import { z } from "zod";

export const createLeaveSchema = z
  .object({
    leaveType: z.enum([
      "vacation",
      "sick",
      "emergency",
      "maternity",
      "paternity",
      "unpaid",
    ]),

    reason: z.string().trim().min(1, "Reason is required."),

    startDate: z.iso.date("Start date must use YYYY-MM-DD format."),
    endDate: z.iso.date("End date must use YYYY-MM-DD format."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date.",
    path: ["endDate"],
  });

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
