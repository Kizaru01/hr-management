import { Select } from "@/components/ui/form-controls";

interface SelectFieldProps {
  error?: string;
  disabled?: boolean;
  label: string;
  name: string;
  value?: string;
  defaultValue?: string | null;
  options: {
    label: string;
    value: string;
  }[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

export const SelectField = ({
  error,
  disabled,
  label,
  name,
  value,
  defaultValue,
  options,
  onChange,
}: SelectFieldProps) => (
  <label className="grid gap-1.5">
    <span className="control-label">{label}</span>

    <Select
      disabled={disabled}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : undefined}
      name={name}
      value={value}
      defaultValue={value ? undefined : (defaultValue ?? undefined)}
      onChange={onChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
    {error ? <p id={`${name}-error`} className="text-sm text-destructive">{error}</p> : null}
  </label>
);
