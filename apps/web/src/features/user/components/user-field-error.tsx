interface UserFieldErrorProps {
  messages?: string[];
}

export function UserFieldError({ messages }: UserFieldErrorProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p role="alert" className="text-xs text-destructive">
      {messages.join(" ")}
    </p>
  );
}
