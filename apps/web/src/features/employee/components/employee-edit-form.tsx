"use client";

import { actionFeedback, useValidationFocus } from "@/lib/action-feedback";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormField } from "@/components/form-field";
import { SelectField } from "@/components/select-field";
import { ApiError } from "@/lib/api/api.client";
import { Button } from "@/components/ui/button";

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
  const validationFormRef = useValidationFocus(fieldErrors);
  const [positionLoadError, setPositionLoadError] = useState("");
  const [positionRequestVersion, setPositionRequestVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPositions = async () => {
      setPositionLoadError("");
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
  }, [departmentId, employee.department.id, employee.position.id, positionRequestVersion]);

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDepartmentId(event.target.value);
    setPositions([]);
    setPositionId("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setErrorMessage("");
    setFieldErrors({});
    setIsSaving(true);

    let mutationConfirmed = false;
    try {
      const formData = new FormData(event.currentTarget);
      const selectedEmploymentType = String(formData.get("employmentType"));
      const employmentType = employmentTypeOptions.find(
        (option) => option.value === selectedEmploymentType,
      )?.value;

      if (!employmentType) {
        setFieldErrors({ employmentType: ["Select a valid employment type."] });
        return;
      }

      await actionFeedback(() => updateEmployee(employee.id, {
        firstName: String(formData.get("firstName")),
        middleName: String(formData.get("middleName")),
        lastName: String(formData.get("lastName")),
        email: String(formData.get("email")),
        departmentId,
        positionId,
        branchId: String(formData.get("branchId")),
        employmentType,
      }), {
        success: "Employee updated.",
        error: "Unable to update employee. Please try again.",
      });
      mutationConfirmed = true;

      router.push(`/employees/${employee.id}`);
      router.refresh();
    } catch (error) {
      if (mutationConfirmed) return;
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
    <form ref={validationFormRef}
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-card border border-border bg-surface p-4 shadow-card sm:grid-cols-2"
    >
      <FormField
        label="First name"
        name="firstName"
        error={fieldErrors.firstName?.[0]}
        disabled={isSaving}
        defaultValue={employee.firstName}
      />

      <FormField
        label="Middle name"
        name="middleName"
        error={fieldErrors.middleName?.[0]}
        disabled={isSaving}
        defaultValue={employee.middleName}
      />

      <FormField
        label="Last name"
        name="lastName"
        error={fieldErrors.lastName?.[0]}
        disabled={isSaving}
        defaultValue={employee.lastName}
      />

      <FormField
        label="Email"
        name="email"
        error={fieldErrors.email?.[0]}
        disabled={isSaving}
        type="email"
        defaultValue={employee.email}
      />

      <SelectField
        label="Department"
        name="departmentId"
        error={fieldErrors.departmentId?.[0]}
        disabled={isSaving}
        value={departmentId}
        options={departments}
        onChange={handleDepartmentChange}
      />

      <SelectField
        label="Position"
        name="positionId"
        error={fieldErrors.positionId?.[0]}
        disabled={isSaving}
        value={positionId}
        options={positions}
        onChange={(event) => setPositionId(event.target.value)}
      />

      <SelectField
        label="Branch"
        name="branchId"
        error={fieldErrors.branchId?.[0]}
        disabled={isSaving}
        defaultValue={employee.branch?.id}
        options={branches}
      />

      <SelectField
        label="Employment type"
        name="employmentType"
        error={fieldErrors.employmentType?.[0]}
        disabled={isSaving}
        defaultValue={employee.employmentType}
        options={employmentTypeOptions}
      />

      {positionLoadError ? <div role="alert" className="sm:col-span-2 text-sm text-destructive">
        <p>{positionLoadError}</p>
        <button type="button" onClick={() => setPositionRequestVersion(value => value + 1)} className="mt-2 underline">Retry loading positions</button>
      </div> : null}
      {errorMessage && (
        <div
          role="alert"
          className="space-y-1 text-sm text-destructive sm:col-span-2"
        >
          <p>{errorMessage}</p>

        </div>
      )}

      <Button
        type="submit"
        disabled={!positionId || isSaving}
        className="sm:col-span-2"
      >
        {isSaving ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
};
