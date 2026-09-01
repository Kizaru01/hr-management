import { Input } from "@/components/ui/form-controls";

interface FormFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
}

export const FormField = ({
  label,
  name,
  defaultValue,
  type = "text",
}: FormFieldProps) => (
  <label className="grid gap-1.5">
    <span className="control-label">{label}</span>

    <Input name={name} type={type} defaultValue={defaultValue ?? ""} />
  </label>
);
