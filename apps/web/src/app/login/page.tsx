"use client";

import { FormEvent, useState } from "react";
import { login } from "@/features/auth/api/login";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/api.client";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Feedback } from "@/components/ui/feedback";
import { Input } from "@/components/ui/form-controls";
import { UsersRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await login({
        email,
        password,
      });

      const { role } = response.data;

      if (!response.success) {
        throw new Error("Login failed.");
      }
      setMessage({ tone: "success", text: "Login successful." });

      if (role === "admin" || role === "hr") {
        router.replace("/dashboard");
      } else {
        router.replace("/employee/dashboard");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setMessage({ tone: "error", text: error.message });
      } else {
        setMessage({ tone: "error", text: "Something went wrong." });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background p-4 sm:p-6">
      <ThemeToggle className="absolute right-4 top-4 sm:right-6 sm:top-6" />
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <span className="mb-4 flex size-10 items-center justify-center rounded-control border border-border bg-selected text-info">
              <UsersRound aria-hidden="true" size={20} />
            </span>
            <h1>Sign in to HRMS</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Use your work account to continue.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="control-label">
                Email
              </label>

              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1.5"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="control-label">
                Password
              </label>

              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1.5"
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            {message ? (
              <Feedback tone={message.tone}>{message.text}</Feedback>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
