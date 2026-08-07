import { createDepartmentSchema } from "./create-department.schema.js";
import { z } from "zod";

export const updateDepartmentSchema = createDepartmentSchema.partial();

export type UpdateDepartmentInput = z.infer<
  typeof updateDepartmentSchema
>;