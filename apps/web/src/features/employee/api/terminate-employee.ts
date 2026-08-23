interface TerminateEmployeeInput {
  terminationDate: string;
  reason: string;
}

export const terminateEmployee = async (
  employeeId: string,
  input: TerminateEmployeeInput,
) => {
  const response = await fetch(`/api/employees/${employeeId}/terminate`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Unable to terminate employee.");
  }

  return data;
};
