'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { FormField } from '@/components/form-field';
import { SelectField } from '@/components/select-field';

import { getPositionsByDepartment } from '../api/get-positions-by-department';
import { updateEmployee } from '../api/update-employee';

import type {
  EmployeeDetails,
  LookupOption,
} from '../types/employee';

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

  const [departmentId, setDepartmentId] = useState(
    employee.department.id,
  );
const [positions, setPositions] = useState<LookupOption[]>([]);
const [positionId, setPositionId] = useState(
  employee.position.id,
);

useEffect(() => {
  const loadPositions = async () => {
    const { data } =
      await getPositionsByDepartment(departmentId);

    setPositions(data);

    if (departmentId !== employee.department.id) {
      setPositionId(data[0]?.value ?? '');
    }
  };

  void loadPositions();
}, [departmentId, employee.department.id]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    await updateEmployee(employee.id, {
      firstName: String(formData.get('firstName')),
      middleName: String(formData.get('middleName')),
      lastName: String(formData.get('lastName')),
      email: String(formData.get('email')),
      departmentId: String(formData.get('departmentId')),
      positionId: String(formData.get('positionId')),
      branchId: String(formData.get('branchId')),
      employmentType: String(formData.get('employmentType')),
    });

    router.push(`/employees/${employee.id}`);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 sm:grid-cols-2"
    >
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
        onChange={(event) =>
          setDepartmentId(event.target.value)
        }
      />

    <SelectField
  label="Position"
  name="positionId"
  value={positionId}
  options={positions}
  onChange={(event) =>
    setPositionId(event.target.value)
  }
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
        options={[
          { label: 'Regular', value: 'regular' },
          { label: 'Probationary', value: 'probationary' },
          { label: 'Contractual', value: 'contractual' },
          { label: 'Part Time', value: 'part_time' },
        ]}
      />

      <button className="rounded-md border px-4 py-2 sm:col-span-2">
        Save changes
      </button>
    </form>
  );
};