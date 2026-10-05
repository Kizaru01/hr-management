import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import type { LoginInput } from "@hr-management/validation";
import { apiRequest, ApiError, errorMessage } from "@/lib/api/client";
import {
  parseCurrentUser,
  parseLogin,
  type CurrentUser,
} from "@/lib/api/contracts";
import { tokenStorage } from "./token-storage";

type Session = {
  status: "loading" | "signedOut" | "signedIn" | "blocked";
  user: CurrentUser | null;
  message: string | null;
};
interface AuthContextValue extends Session {
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
  request: <T>(path: string, signal?: AbortSignal) => Promise<T>;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const allowed = (user: CurrentUser) =>
  user.role === "employee" || user.role === "manager";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    status: "loading",
    user: null,
    message: null,
  });
  const token = useRef<string | null>(null);
  const generation = useRef(0);
  const needsClear = useRef(false);

  const clearSession = useCallback(async (message: string | null = null) => {
    const version = ++generation.current;
    token.current = null;
    needsClear.current = true;
    setSession({ status: "loading", user: null, message: null });
    try {
      await tokenStorage.clear();
      if (generation.current !== version) return;
      needsClear.current = false;
      setSession({ status: "signedOut", user: null, message });
    } catch {
      if (generation.current !== version) return;
      setSession({
        status: "blocked",
        user: null,
        message:
          "Secure storage could not be cleared. Access is locked. Retry to finish signing out.",
      });
    }
  }, []);

  const restore = useCallback(async () => {
    if (needsClear.current) return clearSession();
    const version = ++generation.current;
    token.current = null;
    setSession({ status: "loading", user: null, message: null });
    let saved: string | null;
    try {
      saved = await tokenStorage.read();
    } catch {
      if (generation.current === version)
        setSession({
          status: "blocked",
          user: null,
          message:
            "Secure storage is unavailable. Unlock your device and retry. This experience requires the Android or iOS app.",
        });
      return;
    }
    if (generation.current !== version) return;
    if (!saved) {
      token.current = null;
      setSession({ status: "signedOut", user: null, message: null });
      return;
    }
    try {
      const user = parseCurrentUser(
        await apiRequest<unknown>("/auth/me", { token: saved }),
      );
      if (generation.current !== version) return;
      if (!allowed(user)) {
        await clearSession(
          "Use an employee or manager account. HR and administrator accounts use the web dashboard.",
        );
        return;
      }
      token.current = saved;
      setSession({ status: "signedIn", user, message: null });
    } catch (error) {
      if (generation.current !== version) return;
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        await clearSession(
          "Your session has expired or access was revoked. Please sign in again.",
        );
      } else {
        token.current = null;
        setSession({
          status: "blocked",
          user: null,
          message: errorMessage(error),
        });
      }
    }
  }, [clearSession]);

  useEffect(() => {
    const epoch = generation;
    const start = setTimeout(() => void restore(), 0);
    return () => {
      clearTimeout(start);
      epoch.current++;
    };
  }, [restore]);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" && session.status === "signedIn") void restore();
    });
    return () => subscription.remove();
  }, [restore, session.status]);

  const signIn = useCallback(
    async (input: LoginInput) => {
      const version = ++generation.current;
      const login = parseLogin(
        await apiRequest<unknown>("/auth/login", { body: input }),
      );
      const user = parseCurrentUser(
        await apiRequest<unknown>("/auth/me", { token: login.accessToken }),
      );
      if (generation.current !== version)
        throw new ApiError("cancelled", "Sign-in cancelled.");
      if (!allowed(user))
        throw new ApiError(
          "http",
          "Use an employee or manager account. HR and administrator accounts use the web dashboard.",
          403,
        );
      try {
        await tokenStorage.write(login.accessToken);
      } catch {
        await clearSession(
          "Your session could not be saved securely. Please sign in again.",
        );
        throw new ApiError(
          "configuration",
          "Your session could not be saved securely. Unlock your device and try again.",
        );
      }
      if (generation.current !== version) return;
      token.current = login.accessToken;
      setSession({ status: "signedIn", user, message: null });
    },
    [clearSession],
  );

  const request = useCallback(
    async <T,>(path: string, signal?: AbortSignal): Promise<T> => {
      const currentToken = token.current;
      const version = generation.current;
      if (!currentToken) throw new ApiError("cancelled", "No active session.");
      try {
        const data = await apiRequest<T>(path, { token: currentToken, signal });
        if (generation.current !== version)
          throw new ApiError("cancelled", "Session changed.");
        return data;
      } catch (error) {
        if (
          generation.current === version &&
          error instanceof ApiError &&
          error.status === 401
        ) {
          await clearSession(
            "Your session has expired or access was revoked. Please sign in again.",
          );
        }
        // 403 on a feature is an authorization error, not an invalid token.
        throw error;
      }
    },
    [clearSession],
  );
  const signOut = useCallback(() => clearSession(), [clearSession]);
  return (
    <AuthContext.Provider
      value={{ ...session, signIn, signOut, retry: restore, request }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider is required.");
  return context;
}
