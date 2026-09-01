import { Select } from "@/components/ui/form-controls";

interface SelectFieldProps {
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
  </label>
);
