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
  iconClassName: "border-foreground/20 bg-foreground/5 text-foreground/70",
  badgeClassName: "border-foreground/20 bg-foreground/5 text-foreground/80",
};

const informationalPresentation = {
  iconClassName:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  badgeClassName:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
};

const positivePresentation = {
  iconClassName:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  badgeClassName:
    "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
};

const negativePresentation = {
  iconClassName:
    "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  badgeClassName:
    "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
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
