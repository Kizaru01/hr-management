import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewProps,
  type TextProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMobileTheme } from "@/constants/mobile-theme";

export function Screen({
  children,
  bottomInset = true,
  ...props
}: ScrollViewProps & { bottomInset?: boolean }) {
  const theme = useMobileTheme();
  return (
    <SafeAreaView
      edges={
        bottomInset
          ? ["top", "left", "right", "bottom"]
          : ["top", "left", "right"]
      }
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        {...props}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.screen}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Copy({
  children,
  kind = "body",
  style,
  ...props
}: TextProps & { kind?: "body" | "title" | "heading" | "muted" | "eyebrow" }) {
  const theme = useMobileTheme();
  return (
    <Text
      {...props}
      style={[
        {
          color:
            kind === "muted" || kind === "eyebrow" ? theme.muted : theme.text,
        },
        styles[kind],
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Card({ children }: { children: ReactNode }) {
  const theme = useMobileTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      {children}
    </View>
  );
}
export function Action({
  label,
  onPress,
  pending = false,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const theme = useMobileTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || pending, busy: pending }}
      disabled={disabled || pending}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? theme.surface : theme.primary,
          borderColor: secondary ? theme.border : theme.primary,
          opacity: pressed || disabled || pending ? 0.65 : 1,
        },
      ]}
    >
      {pending ? (
        <ActivityIndicator color={secondary ? theme.text : theme.onPrimary} />
      ) : null}
      <Text
        style={{
          color: secondary ? theme.text : theme.onPrimary,
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Notice({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const theme = useMobileTheme();
  return (
    <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
      <Text style={{ color: theme.danger, fontSize: 14, lineHeight: 21 }}>
        {message}
      </Text>
      {onRetry ? (
        <Action secondary label="Try again" onPress={onRetry} />
      ) : null}
    </View>
  );
}
export function Loading({ label = "Loading…" }: { label?: string }) {
  const theme = useMobileTheme();
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={styles.loading}
    >
      <ActivityIndicator color={theme.info} />
      <Copy kind="muted" style={{ flexShrink: 1 }}>
        {label}
      </Copy>
    </View>
  );
}
export function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Copy kind="eyebrow">{label}</Copy>
      <Copy>{value}</Copy>
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: 20,
    paddingBottom: 32,
    gap: 20,
  },
  card: { padding: 20, borderWidth: 1, borderRadius: 12, gap: 16 },
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  body: { fontSize: 16, lineHeight: 24 },
  title: { fontSize: 28, lineHeight: 35, fontWeight: "700" },
  heading: { fontSize: 18, lineHeight: 25, fontWeight: "600" },
  muted: { fontSize: 14, lineHeight: 21 },
  eyebrow: { fontSize: 12, lineHeight: 18, fontWeight: "600" },
  loading: {
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
