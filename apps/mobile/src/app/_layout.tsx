import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/features/auth/auth-provider";
import {
  Action,
  Card,
  Copy,
  Loading,
  Notice,
  Screen,
} from "@/components/mobile-ui";
import { useMobileTheme } from "@/constants/mobile-theme";

function Routes() {
  const session = useAuth();
  const theme = useMobileTheme();
  const scheme = useColorScheme();
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          primary: theme.primary,
          border: theme.border,
        },
      }}
    >
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      {session.status === "loading" ? (
        <Screen>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Copy kind="title">HRMS</Copy>
            <Loading label="Checking your session…" />
          </View>
        </Screen>
      ) : session.status === "blocked" ? (
        <Screen>
          <Copy kind="title">Let’s reconnect</Copy>
          <Card>
            <Notice
              message={session.message ?? "Your session could not be verified."}
              onRetry={() => void session.retry()}
            />
            <Action
              secondary
              label="Clear saved session"
              onPress={() => void session.signOut()}
            />
          </Card>
        </Screen>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={session.status === "signedOut"}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
          <Stack.Protected guard={session.status === "signedIn"}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      )}
    </ThemeProvider>
  );
}
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
