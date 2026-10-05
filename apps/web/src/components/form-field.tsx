import { Input } from "@/components/ui/form-controls";

interface FormFieldProps {
  error?: string;
  disabled?: boolean;
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
}

export const FormField = ({
  error,
  disabled,
  label,
  name,
  defaultValue,
  type = "text",
}: FormFieldProps) => (
  <label className="grid gap-1.5">
    <span className="control-label">{label}</span>

    <Input disabled={disabled} aria-invalid={Boolean(error)} aria-describedby={error ? `${name}-error` : undefined} name={name} type={type} defaultValue={defaultValue ?? ""} />
    {error ? <p id={`${name}-error`} className="text-sm text-destructive">{error}</p> : null}
  </label>
);
