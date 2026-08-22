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
  type = 'text',
}: FormFieldProps) => (
  <label className="space-y-1">
    <span className="text-sm font-medium">{label}</span>

    <input
      name={name}
      type={type}
      defaultValue={defaultValue ?? ''}
      className="w-full rounded-md border px-3 py-2"
    />
  </label>
);