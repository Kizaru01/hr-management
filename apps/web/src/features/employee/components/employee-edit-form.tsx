"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormField } from "@/components/form-field";
import { SelectField } from "@/components/select-field";
import { ApiError } from "@/lib/api/api.client";

import { getPositionsByDepartment } from "../api/get-positions-by-department";
import { updateEmployee } from "../api/update-employee";

import type { EmployeeDetails, LookupOption } from "../types/employee";

const employmentTypeOptions = [
  { label: "Regular", value: "regular" },
  { label: "Probationary", value: "probationary" },
  { label: "Contractual", value: "contractual" },
  { label: "Intern", value: "intern" },
  { label: "Part Time", value: "part_time" },
] satisfies Array<{
  label: string;
  value: EmployeeDetails["employmentType"];
}>;

interface Props {
  employee: EmployeeDetails;
  departments: LookupOption[];
  branches: LookupOption[];
}

export const EmployeeEditForm = ({
  employee,
  departments,
  branches,
}: Props) => {
  const router = useRouter();

  const [departmentId, setDepartmentId] = useState(employee.department.id);
  const [positions, setPositions] = useState<LookupOption[]>([]);
  const [positionId, setPositionId] = useState(employee.position.id);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPositions = async () => {
      setErrorMessage("");
      setFieldErrors({});

      try {
        const { data } = await getPositionsByDepartment(departmentId);

        if (cancelled) {
          return;
        }

        const positionOptions = data.map((position) => ({
          label: position.name,
          value: position.id,
        }));

        setPositions(positionOptions);

        const employeePositionIsAvailable =
          departmentId === employee.department.id &&
          positionOptions.some(
            (position) => position.value === employee.position.id,
          );

        setPositionId(
          employeePositionIsAvailable
            ? employee.position.id
            : (positionOptions[0]?.value ?? ""),
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load positions.",
        );
        setFieldErrors(
          error instanceof ApiError && error.details ? error.details : {},
        );
      }
    };

    void loadPositions();

    return () => {
      cancelled = true;
    };
  }, [departmentId, employee.department.id, employee.position.id]);

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDepartmentId(event.target.value);
    setPositions([]);
    setPositionId("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});
    setIsSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const selectedEmploymentType = String(formData.get("employmentType"));
      const employmentType = employmentTypeOptions.find(
        (option) => option.value === selectedEmploymentType,
      )?.value;

      if (!employmentType) {
        throw new Error("Invalid employment type.");
      }

      await updateEmployee(employee.id, {
        firstName: String(formData.get("firstName")),
        middleName: String(formData.get("middleName")),
        lastName: String(formData.get("lastName")),
        email: String(formData.get("email")),
        departmentId,
        positionId,
        branchId: String(formData.get("branchId")),
        employmentType,
      });

      router.push(`/employees/${employee.id}`);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to update employee.",
      );
      setFieldErrors(
        error instanceof ApiError && error.details ? error.details : {},
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <FormField
        label="First name"
        name="firstName"
        defaultValue={employee.firstName}
      />

      <FormField
        label="Middle name"
        name="middleName"
        defaultValue={employee.middleName}
      />

      <FormField
        label="Last name"
        name="lastName"
        defaultValue={employee.lastName}
      />

      <FormField
        label="Email"
        name="email"
        type="email"
        defaultValue={employee.email}
      />

      <SelectField
        label="Department"
        name="departmentId"
        value={departmentId}
        options={departments}
        onChange={handleDepartmentChange}
      />

      <SelectField
        label="Position"
        name="positionId"
        value={positionId}
        options={positions}
        onChange={(event) => setPositionId(event.target.value)}
      />

      <SelectField
        label="Branch"
        name="branchId"
        defaultValue={employee.branch?.id}
        options={branches}
      />

      <SelectField
        label="Employment type"
        name="employmentType"
        defaultValue={employee.employmentType}
        options={employmentTypeOptions}
      />

      {errorMessage && (
        <div
          role="alert"
          className="space-y-1 text-sm text-red-700 sm:col-span-2"
        >
          <p>{errorMessage}</p>

          {Object.entries(fieldErrors).length > 0 && (
            <ul className="list-disc pl-5">
              {Object.entries(fieldErrors).flatMap(([field, messages]) =>
                messages.map((message) => (
                  <li key={`${field}-${message}`}>
                    {field}: {message}
                  </li>
                )),
              )}
            </ul>
          )}
        </div>
      )}

      <button
        disabled={!positionId || isSaving}
        className="rounded-md border px-4 py-2 sm:col-span-2"
      >
        {isSaving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
};
