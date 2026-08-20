-- AddConstraint
-- NOT VALID avoids rewriting or modifying existing rows while the constraint is added.
ALTER TABLE "Announcement"
ADD CONSTRAINT "Announcement_audience_target_check"
CHECK (
  (
    "audience" = 'company'
    AND "departmentId" IS NULL
    AND "branchId" IS NULL
  )
  OR
  (
    "audience" = 'department'
    AND "departmentId" IS NOT NULL
    AND "branchId" IS NULL
  )
  OR
  (
    "audience" = 'branch'
    AND "branchId" IS NOT NULL
    AND "departmentId" IS NULL
  )
) NOT VALID;

-- Validate existing rows without changing or deleting them. The migration stops
-- with a constraint violation if legacy data does not satisfy the invariant.
ALTER TABLE "Announcement"
VALIDATE CONSTRAINT "Announcement_audience_target_check";

-- AddConstraint
ALTER TABLE "EmployeeDocument"
ADD CONSTRAINT "EmployeeDocument_date_range_check"
CHECK (
  "issuedAt" IS NULL
  OR "expiresAt" IS NULL
  OR "expiresAt" >= "issuedAt"
) NOT VALID;

ALTER TABLE "EmployeeDocument"
VALIDATE CONSTRAINT "EmployeeDocument_date_range_check";
