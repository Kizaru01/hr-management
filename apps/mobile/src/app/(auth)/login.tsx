import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { loginSchema } from "@hr-management/validation";
import { Action, Card, Copy, Notice, Screen } from "@/components/mobile-ui";
import { useMobileTheme } from "@/constants/mobile-theme";
import { useAuth } from "@/features/auth/auth-provider";
import { ApiError, errorMessage } from "@/lib/api/client";

export default function LoginScreen() {
  const theme = useMobileTheme();
  const { signIn, message } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const submitting = useRef(false);
  async function submit() {
    if (submitting.current) return;
    setError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues)
        errors[String(issue.path[0])] ??= issue.message;
      setFields(errors);
      (errors.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    submitting.current = true;
    setFields({});
    setPending(true);
    try {
      await signIn(result.data);
      setPassword("");
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFields(cause.fields);
        setError(
          cause.status === 401
            ? "Sign-in was rejected. Check your email and password, or contact HR if your account is not active."
            : cause.kind === "network"
              ? "Cannot reach HRMS. Check your connection and try signing in again."
              : cause.message,
        );
      } else setError(errorMessage(cause));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  const fieldStyle = [
    local.input,
    {
      backgroundColor: theme.surface,
      color: theme.text,
      borderColor: theme.border,
    },
  ];
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Screen>
        <View style={{ paddingTop: 36, gap: 12, paddingBottom: 8 }}>
          <View style={[local.brand, { backgroundColor: theme.primary }]}>
            <Copy style={{ color: theme.onPrimary, fontWeight: "700" }}>
              HR
            </Copy>
          </View>
          <Copy kind="eyebrow">HRMS · EMPLOYEE PORTAL</Copy>
          <Copy kind="title">Your workday,{"\n"}in one place.</Copy>
          <Copy kind="muted">Sign in with your activated work account.</Copy>
        </View>
        <Card>
          <Copy kind="heading">Welcome back</Copy>
          {message && !error ? <Notice message={message} /> : null}
          {error ? <Notice message={error} /> : null}
          <View style={{ gap: 7 }}>
            <Copy kind="eyebrow">EMAIL</Copy>
            <TextInput
              ref={emailRef}
              accessibilityLabel="Email"
              accessibilityHint={fields.email}
              placeholder="you@company.com"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setFields((old) => ({ ...old, email: "" }));
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!pending}
              style={[
                fieldStyle,
                fields.email ? { borderColor: theme.danger } : null,
              ]}
            />
            {fields.email ? <Notice message={fields.email} /> : null}
          </View>
          <View style={{ gap: 7 }}>
            <Copy kind="eyebrow">PASSWORD</Copy>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TextInput
                ref={passwordRef}
                accessibilityLabel="Password"
                accessibilityHint={fields.password}
                placeholder="Your password"
                placeholderTextColor={theme.muted}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setFields((old) => ({ ...old, password: "" }));
                }}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={() => void submit()}
                editable={!pending}
                style={[
                  fieldStyle,
                  { flex: 1 },
                  fields.password ? { borderColor: theme.danger } : null,
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={visible ? "Hide password" : "Show password"}
                onPress={() => setVisible(!visible)}
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Copy style={{ color: theme.info, fontSize: 14 }}>
                  {visible ? "Hide" : "Show"}
                </Copy>
              </Pressable>
            </View>
            {fields.password ? <Notice message={fields.password} /> : null}
          </View>
          <Action
            label={pending ? "Signing in…" : "Sign in"}
            onPress={() => void submit()}
            pending={pending}
          />
        </Card>
        <Copy kind="muted">
          Need access or help signing in? Contact your HR team. Employee and
          manager accounts are supported.
        </Copy>
      </Screen>
    </KeyboardAvoidingView>
  );
}
const local = StyleSheet.create({
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  brand: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
