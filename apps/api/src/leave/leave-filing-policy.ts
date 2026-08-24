import type { LeaveType } from '../generated/prisma/client.js';

export const LEAVE_FILING_LEAD_DAYS: Record<LeaveType, number> = {
  vacation: 7,
  sick: 0,
  emergency: 0,
  maternity: 7,
  paternity: 7,
  unpaid: 7,
};

export function getLeaveFilingPolicyError(
  leaveType: LeaveType,
  requestedStartDate: Date,
  currentBusinessDate: Date,
): string | null {
  const leadDays = LEAVE_FILING_LEAD_DAYS[leaveType];
  const minimumStartDate = new Date(currentBusinessDate);

  minimumStartDate.setUTCDate(minimumStartDate.getUTCDate() + leadDays);

  if (requestedStartDate >= minimumStartDate) {
    return null;
  }

  if (leadDays === 0) {
    return 'Leave start date cannot be in the past.';
  }

  const leaveTypeLabel = leaveType.charAt(0).toUpperCase() + leaveType.slice(1);

  return `${leaveTypeLabel} leave must be filed at least ${leadDays} days before the start date.`;
}
