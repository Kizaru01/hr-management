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

    startDate: z.coerce.date(),

    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be on or after start date.",
    path: ["endDate"],
  });

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
