interface FieldErrorProps {
  messages?: string[];
}

export const FieldError = ({ messages }: FieldErrorProps) =>
  messages?.[0] ? (
    <p className="text-xs text-destructive">{messages[0]}</p>
  ) : null;
