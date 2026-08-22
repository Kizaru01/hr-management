export const getPositionsByDepartment = async (departmentId: string) => {
  const response = await fetch(`/api/positions?departmentId=${departmentId}`);

  if (!response.ok) {
    throw new Error("Unable to load positions.");
  }

  return response.json();
};
