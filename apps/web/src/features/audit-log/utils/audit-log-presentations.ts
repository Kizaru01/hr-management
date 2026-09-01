import {
  Activity,
  BriefcaseBusiness,
  Building2,
  CircleCheck,
  CircleX,
  FilePlus,
  FileX,
  Megaphone,
  UserMinus,
  UserRoundPen,
  UsersRound,
} from "lucide-react";

const neutralPresentation = {
  icon: Activity,
  iconClassName: "border-border bg-hover text-secondary-foreground",
  badgeClassName: "border-border bg-hover text-secondary-foreground",
};

const informationalPresentation = {
  iconClassName: "border-info-border bg-info-surface text-info",
  badgeClassName: "border-info-border bg-info-surface text-info",
};

const positivePresentation = {
  iconClassName: "border-success-border bg-success-surface text-success",
  badgeClassName: "border-success-border bg-success-surface text-success",
};

const negativePresentation = {
  iconClassName:
    "border-destructive-border bg-destructive-surface text-destructive",
  badgeClassName:
    "border-destructive-border bg-destructive-surface text-destructive",
};

const actionPresentations: Record<
  string,
  {
    icon: typeof Activity;
    iconClassName: string;
    badgeClassName: string;
  }
> = {
  "announcement.create": {
    ...informationalPresentation,
    icon: Megaphone,
  },
  "department.create": {
    ...informationalPresentation,
    icon: Building2,
  },
  "department.update": {
    ...neutralPresentation,
    icon: Building2,
  },
  "department.head.assign": {
    ...neutralPresentation,
    icon: UsersRound,
  },
  "department.head.replace": {
    ...neutralPresentation,
    icon: UsersRound,
  },
  "department.head.remove": {
    ...negativePresentation,
    icon: UsersRound,
  },
  "department.deactivate": {
    ...negativePresentation,
    icon: CircleX,
  },
  "department.reactivate": {
    ...positivePresentation,
    icon: CircleCheck,
  },
  "position.create": {
    ...informationalPresentation,
    icon: BriefcaseBusiness,
  },
  "position.update": {
    ...neutralPresentation,
    icon: BriefcaseBusiness,
  },
  "position.deactivate": {
    ...negativePresentation,
    icon: CircleX,
  },
  "position.reactivate": {
    ...positivePresentation,
    icon: CircleCheck,
  },
  "employee.update": {
    ...neutralPresentation,
    icon: UserRoundPen,
  },
  "employee.terminate": {
    ...negativePresentation,
    icon: UserMinus,
  },
  "employee_document.create": {
    ...informationalPresentation,
    icon: FilePlus,
  },
  "employee_document.deactivate": {
    ...negativePresentation,
    icon: FileX,
  },
  "leave.approve": {
    ...positivePresentation,
    icon: CircleCheck,
  },
  "leave.reject": {
    ...negativePresentation,
    icon: CircleX,
  },
  "manager.assign": {
    ...neutralPresentation,
    icon: UsersRound,
  },
};

export const getAuditLogPresentation = (action: string) =>
  actionPresentations[action] ?? neutralPresentation;
