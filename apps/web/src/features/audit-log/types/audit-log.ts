export type AuditLogActorRole = "admin" | "hr" | "employee" | "manager";

export type AuditLogJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditLogJsonValue[]
  | { [key: string]: AuditLogJsonValue };

export interface AuditLogActor {
  id: string;
  email: string;
  role: AuditLogActorRole;
}

export interface AuditLogListItem {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: AuditLogJsonValue;
  createdAt: string;
  actorUser: AuditLogActor | null;
}
