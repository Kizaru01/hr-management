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
  <label className="space-y-1">
    <span className="text-sm font-medium">{label}</span>

    <select
      name={name}
      value={value}
      defaultValue={value ? undefined : defaultValue ?? undefined}
      onChange={onChange}
      className="w-full rounded-md border px-3 py-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);