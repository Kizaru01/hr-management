import { z } from "zod";
import { createAnnouncementSchema } from "./create-announcements.schema.js";

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
