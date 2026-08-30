interface UserFieldErrorProps {
  messages?: string[];
}

export function UserFieldError({ messages }: UserFieldErrorProps) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p role="alert" className="text-xs text-red-700 dark:text-red-400">
      {messages.join(" ")}
    </p>
  );
}
