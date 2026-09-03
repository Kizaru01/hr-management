"use client";

import { useEffect, useState } from "react";
import {
  createEmployeeSchema,
  type CreateEmployeeInput,
} from "@hr-management/validation";
import { Button } from "@/components/ui/button";
import { Feedback } from "@/components/ui/feedback";
import { Input, Select } from "@/components/ui/form-controls";
import { ApiError } from "@/lib/api/api.client";
import { createEmployee } from "../api/create-employee";
import { getPositionsByDepartment } from "../api/get-positions-by-department";
import type {
  CreatedEmployee,
  LookupOption,
} from "../types/employee";

type FieldErrors = Record<string, string[] | undefined>;

const employmentTypeOptions: Array<{
  value: CreateEmployeeInput["employmentType"];
  label: string;
}> = [
  { value: "regular", label: "Regular" },
  { value: "probationary", label: "Probationary" },
  { value: "contractual", label: "Contractual" },
  { value: "intern", label: "Intern" },
  { value: "part_time", label: "Part time" },
];

interface CreateEmployeeFormProps {
  departments: LookupOption[];
  branches: LookupOption[];
  onCancel: () => void;
  onCreated: (employee: CreatedEmployee, message: string) => void;
}

export function CreateEmployeeForm({
  departments,
  branches,
  onCancel,
  onCreated,
}: CreateEmployeeFormProps) {
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [positions, setPositions] = useState<LookupOption[]>([]);
  const [positionRequestVersion, setPositionRequestVersion] = useState(0);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [positionLoadError, setPositionLoadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!departmentId) {
      return;
    }

    const controller = new AbortController();

    const loadPositions = async () => {
      try {
        const response = await getPositionsByDepartment(
          departmentId,
          controller.signal,
        );
        setPositions(
          response.data.map((position) => ({
            label: position.name,
            value: position.id,
          })),
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setPositionLoadError(
          error instanceof ApiError
            ? error.message
            : "Unable to load positions.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPositions(false);
        }
      }
    };

    void loadPositions();

    return () => controller.abort();
  }, [departmentId, positionRequestVersion]);

  const handleDepartmentChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextDepartmentId = event.target.value;

    setDepartmentId(nextDepartmentId);
    setPositionId("");
    setPositions([]);
    setPositionLoadError("");
    setIsLoadingPositions(Boolean(nextDepartmentId));
    setFieldErrors((current) => ({
      ...current,
      departmentId: undefined,
      positionId: undefined,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const result = createEmployeeSchema.safeParse({
      firstName: formData.get("firstName"),
      middleName: formData.get("middleName") || undefined,
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      hireDate: formData.get("hireDate"),
      departmentId,
      positionId,
      employmentType: formData.get("employmentType"),
      branchId: formData.get("branchId"),
    });

    setErrorMessage("");
    setFieldErrors({});

    if (!result.success) {
      setErrorMessage("Please correct the highlighted fields.");
      setFieldErrors(result.error.flatten().fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createEmployee(result.data);

      form.reset();
      setDepartmentId("");
      setPositionId("");
      setPositions([]);
      setIsLoadingPositions(false);
      onCreated(response.data, response.message);
    } catch (error) {
      const backendFieldErrors =
        error instanceof ApiError && error.details ? error.details : {};

      setFieldErrors(backendFieldErrors);
      setErrorMessage(
        Object.keys(backendFieldErrors).length > 0
          ? "Please correct the highlighted fields."
          : error instanceof ApiError
            ? error.message
            : "Unable to create employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const organizationUnavailable =
    departments.length === 0 || branches.length === 0;

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="grid flex-1 gap-6 px-5 py-5 sm:px-6">
        <fieldset disabled={isSubmitting} className="grid gap-4">
          <legend className="mb-3 text-sm font-semibold">
            Personal information
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormControl
              label="First name"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              errors={fieldErrors.firstName}
            />
            <FormControl
              label="Middle name"
              name="middleName"
              autoComplete="additional-name"
              optional
              errors={fieldErrors.middleName}
            />
            <FormControl
              label="Last name"
              name="lastName"
              autoComplete="family-name"
              errors={fieldErrors.lastName}
            />
            <FormControl
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              errors={fieldErrors.email}
            />
          </div>
        </fieldset>

        <fieldset disabled={isSubmitting} className="grid gap-4">
          <legend className="mb-3 text-sm font-semibold">
            Employment details
          </legend>

          <FormControl
            label="Hire date"
            name="hireDate"
            type="date"
            errors={fieldErrors.hireDate}
          />

          <SelectControl
            label="Department"
            name="departmentId"
            value={departmentId}
            onChange={handleDepartmentChange}
            errors={fieldErrors.departmentId}
            disabled={departments.length === 0}
          >
            <option value="">
              {departments.length === 0
                ? "No active departments available"
                : "Select a department"}
            </option>
            {departments.map((department) => (
              <option key={department.value} value={department.value}>
                {department.label}
              </option>
            ))}
          </SelectControl>
          <SelectControl
            label="Position"
            name="positionId"
            value={positionId}
            onChange={(event) => setPositionId(event.target.value)}
            errors={fieldErrors.positionId}
            disabled={
              !departmentId || isLoadingPositions || Boolean(positionLoadError)
            }
            help={positionLoadError || undefined}
            helpIsError={Boolean(positionLoadError)}
          >
            <option value="">
              {!departmentId
                ? "Select a department first"
                : isLoadingPositions
                  ? "Loading positions..."
                  : positionLoadError
                    ? "Positions unavailable"
                    : positions.length === 0
                      ? "No active positions in this department"
                      : "Select a position"}
            </option>
            {positions.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </SelectControl>
          {positionLoadError ? (
            <Button
              type="button"
              variant="ghost"
              size="small"
              className="justify-self-start"
              onClick={() => {
                setPositionLoadError("");
                setIsLoadingPositions(true);
                setPositionRequestVersion((version) => version + 1);
              }}
            >
              Retry loading positions
            </Button>
          ) : null}

          <SelectControl
            label="Branch"
            name="branchId"
            defaultValue=""
            errors={fieldErrors.branchId}
            disabled={branches.length === 0}
          >
            <option value="">
              {branches.length === 0
                ? "No active branches available"
                : "Select a branch"}
            </option>
            {branches.map((branch) => (
              <option key={branch.value} value={branch.value}>
                {branch.label}
              </option>
            ))}
          </SelectControl>

          <SelectControl
            label="Employment type"
            name="employmentType"
            defaultValue=""
            errors={fieldErrors.employmentType}
          >
            <option value="">Select an employment type</option>
            {employmentTypeOptions.map((employmentType) => (
              <option key={employmentType.value} value={employmentType.value}>
                {employmentType.label}
              </option>
            ))}
          </SelectControl>
        </fieldset>

        {organizationUnavailable ? (
          <Feedback tone="warning">
            Employee creation requires at least one active department and
            branch.
          </Feedback>
        ) : null}

        {errorMessage ? (
          <Feedback tone="error">{errorMessage}</Feedback>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-elevated px-5 py-4 sm:px-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={
            isSubmitting ||
            organizationUnavailable ||
            isLoadingPositions ||
            !positionId
          }
        >
          {isSubmitting ? "Creating..." : "Create employee"}
        </Button>
      </div>
    </form>
  );
}

interface FormControlProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  optional?: boolean;
  errors?: string[];
}

function FormControl({
  label,
  name,
  type = "text",
  autoComplete,
  autoFocus,
  optional = false,
  errors,
}: FormControlProps) {
  const errorId = `${name}-error`;

  return (
    <label className="grid gap-1.5" htmlFor={name}>
      <span className="control-label">
        {label}
        {optional ? (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        ) : null}
      </span>
      <Input
        id={name}
        name={name}
        type={type}
        required={!optional}
        autoComplete={autoComplete}
        data-sheet-initial-focus={autoFocus ? "" : undefined}
        aria-invalid={errors?.length ? true : undefined}
        aria-describedby={errors?.length ? errorId : undefined}
      />
      <FieldError id={errorId} messages={errors} />
    </label>
  );
}

interface SelectControlProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  errors?: string[];
  help?: string;
  helpIsError?: boolean;
}

function SelectControl({
  label,
  name,
  errors,
  help,
  helpIsError = false,
  children,
  ...props
}: SelectControlProps) {
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;
  const describedBy = [errors?.length ? errorId : null, help ? helpId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="grid gap-1.5" htmlFor={name}>
      <span className="control-label">{label}</span>
      <Select
        id={name}
        name={name}
        required
        aria-invalid={errors?.length || helpIsError ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      >
        {children}
      </Select>
      {help ? (
        <p
          id={helpId}
          role={helpIsError ? "alert" : undefined}
          className={helpIsError ? "text-xs text-destructive" : "control-help"}
        >
          {help}
        </p>
      ) : null}
      <FieldError id={errorId} messages={errors} />
    </label>
  );
}

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {messages.join(" ")}
    </p>
  );
}
