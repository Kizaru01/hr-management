import { createBranchSchema } from "./create-branch.schema.js";
import { z } from "zod";

export const updateBranchSchema = createBranchSchema.partial();

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
