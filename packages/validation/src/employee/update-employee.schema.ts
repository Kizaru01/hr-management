import { z } from "zod";
import { createEmployeeSchema } from "./create-employee.schema.js";

export const updateEmployeeSchema =
  createEmployeeSchema.partial();

export type UpdateEmployeeInput = z.infer<
  typeof updateEmployeeSchema
>;