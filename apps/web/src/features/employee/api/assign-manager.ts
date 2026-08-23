export const assignManager = async (employeeId: string, managerId: string) => {
  const response = await fetch(`/api/employees/${employeeId}/manager`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ managerId }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
