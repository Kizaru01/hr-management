# HR Management API — Flow & Endpoint Guide

This file is a quick reference for the current backend architecture.

Use it whenever you forget:

* what endpoint to call
* what role is allowed
* what request body to send
* what ID a route expects
* how Employee → User → Auth → Shift → Attendance → Leave connect together

---

# 1. ID Naming Convention

This is important because the system has multiple IDs.

```text
Employee.id
→ internal database CUID
→ example: cmsr2e65x0000wse8oruv2he9

Employee.employeeNumber
→ business/company employee number
→ example: EMP-0005

User.id
→ internal User database ID

Department.id
→ internal Department database ID

Position.id
→ internal Position database ID

Branch.id
→ internal Branch database ID

Shift.id
→ internal Shift database ID

LeaveRequest.id
→ internal Leave Request database ID

Attendance.id
→ internal Attendance database ID
```

Foreign keys such as:

```text
Attendance.employeeId
LeaveRequest.employeeId
EmployeeShift.employeeId
```

refer to:

```text
Employee.id
```

They do **not** contain:

```text
EMP-0005
```

`EMP-0005` is:

```text
Employee.employeeNumber
```

---

# 2. Main System Flow

```text
CREATE COMPANY STRUCTURE
        │
        ├── Department
        ├── Position
        └── Branch
        │
        ▼
CREATE EMPLOYEE
        │
        ├── employeeNumber generated
        ├── department linked
        ├── position linked
        └── branch linked
        │
        ▼
CREATE USER ACCOUNT
        │
        ├── linked to Employee
        ├── status = pending
        ├── activation token generated
        └── Employee.userId = User.id
        │
        ▼
ACTIVATE ACCOUNT
        │
        ├── validate activation token
        ├── hash password
        ├── status = active
        └── clear activation token
        │
        ▼
LOGIN
        │
        ├── verify email
        ├── verify password
        ├── verify active account
        ├── update lastLoginAt
        └── generate JWT
        │
        ▼
AUTHENTICATED REQUESTS
        │
        ├── JwtAuthGuard
        ├── JwtStrategy
        ├── request.user
        └── RolesGuard
        │
        ▼
EMPLOYEE FEATURES
        │
        ├── Employee self profile
        ├── Shift assignment
        ├── Attendance
        └── Leave requests
```

---

# 3. Roles

Current system roles:

```text
admin
hr
employee
```

Basic idea:

```text
ADMIN
→ system-level administration
→ HR operations
→ employee management
→ shift management
→ attendance management
→ leave management

HR
→ employee management
→ user/account management
→ shift management
→ attendance management
→ leave management

EMPLOYEE
→ own profile
→ own attendance
→ own leave requests
→ cannot access management endpoints
```

Future manager-specific business rules can be added separately.

---

# 4. Authentication Flow

## Create Employee

First create the Employee business record.

Then create a User account linked to that Employee.

Then activate the account.

Then login.

```text
Employee
   ↓
User
   ↓
Activation
   ↓
Login
   ↓
JWT
```

---

# 5. Department Endpoints

## Management Roles

```text
admin / hr
```

### Get Departments

```http
GET /department
```

### Get One Department

```http
GET /department/:id
```

### Create Department

```http
POST /department
```

Example:

```json
{
  "code": "IT",
  "name": "Information Technology",
  "description": "Handles company technology and systems."
}
```

### Update Department

```http
PATCH /department/:id
```

Example:

```json
{
  "name": "Information Technology Department",
  "description": "Updated department description."
}
```

---

# 6. Branch Endpoints

## Management Roles

```text
admin / hr
```

Use your existing Branch DTO fields.

Typical flow:

```http
GET /branch
GET /branch/:id
POST /branch
PATCH /branch/:id
```

Example placeholder:

```json
{
  "code": "SF01",
  "name": "San Fernando Branch"
}
```

Use the exact fields currently defined by your Branch validation schema.

---

# 7. Position Endpoints

## Management Roles

```text
admin / hr
```

Typical flow:

```http
GET /position
GET /position/:id
POST /position
PATCH /position/:id
```

Example:

```json
{
  "name": "Software Developer",
  "departmentId": "DEPARTMENT_DATABASE_ID",
  "description": "Develops and maintains company software."
}
```

Use the additional salary fields if they exist in your current Position DTO.

---

# 8. Employee Endpoints

## Management — Admin / HR

### Get All Employees

```http
GET /employee
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get Employee by Database ID

```http
GET /employee/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

`:id` means:

```text
Employee.id
```

not:

```text
employeeNumber
```

### Create Employee

```http
POST /employee
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Example:

```json
{
  "firstName": "Miguel",
  "middleName": "Reyes",
  "lastName": "Santos",
  "email": "miguel.santos@test.com",
  "hireDate": "2026-08-14",
  "employmentType": "regular",
  "departmentId": "DEPARTMENT_DATABASE_ID",
  "positionId": "POSITION_DATABASE_ID",
  "branchId": "BRANCH_DATABASE_ID"
}
```

Backend generates:

```text
employeeNumber
```

Example:

```text
EMP-0005
```

### Update Employee

```http
PATCH /employee/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

`:id` means:

```text
Employee.id
```

Example:

```json
{
  "phoneNumber": "09123456789"
}
```

### Remove Employee

```http
DELETE /employee/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

---

# 9. Employee Self-Service

## Any Authenticated Employee

### Get My Employee Profile

```http
GET /employee/me
Authorization: Bearer EMPLOYEE_TOKEN
```

No employee database ID is sent.

Flow:

```text
JWT
↓
request.user.id
↓
User.id
↓
Employee.userId
↓
Employee
```

### Update My Profile

```http
PATCH /employee/me
Authorization: Bearer EMPLOYEE_TOKEN
```

Example:

```json
{
  "phoneNumber": "09171234567"
}
```

Only fields allowed by `UpdateMyProfileDto` can be modified.

---

# 10. User Account Endpoints

## Admin / HR

### Create User Account

```http
POST /user
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

The important business identifier is now:

```text
employeeNumber
```

Example:

```json
{
  "email": "miguel.santos@test.com",
  "role": "employee",
  "employeeNumber": "EMP-0005"
}
```

Flow:

```text
employeeNumber
↓
find Employee
↓
Employee already linked?
↓
create User
↓
generate activation token
↓
link Employee.userId = User.id
```

Expected initial User state:

```text
status = pending
passwordHash = null
activationTokenHash = populated
activationExpiresAt = populated
```

---

# 11. Account Activation

## Public

```http
POST /auth/activate
```

Example:

```json
{
  "token": "RAW_ACTIVATION_TOKEN",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Flow:

```text
Raw token
↓
hash token
↓
find User by activationTokenHash
↓
check expiration
↓
hash password
↓
status = active
↓
clear activation token
```

Expected after activation:

```text
status = active
passwordHash = populated
activationTokenHash = null
activationExpiresAt = null
```

---

# 12. Login

## Public

```http
POST /auth/login
```

Example:

```json
{
  "email": "miguel.santos@test.com",
  "password": "Password123!"
}
```

Expected response contains:

```json
{
  "accessToken": "JWT_TOKEN",
  "id": "USER_DATABASE_ID",
  "email": "miguel.santos@test.com",
  "role": "employee",
  "lastLoginAt": "..."
}
```

Use:

```http
Authorization: Bearer JWT_TOKEN
```

for protected endpoints.

---

# 13. Authentication / Authorization Flow

Protected request:

```text
Request
↓
JwtAuthGuard
↓
Passport
↓
JwtStrategy
↓
verify JWT
↓
verify User still exists
↓
verify User.status = active
↓
request.user = {
  id,
  email,
  role
}
↓
RolesGuard
↓
Controller
```

Difference:

```text
401 Unauthorized
→ authentication failed

403 Forbidden
→ authenticated, but role/resource access denied
```

---

# 14. Shift Endpoints

## Admin / HR

### Get All Shifts

```http
GET /shift
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

### Get One Shift

```http
GET /shift/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

`:id` means:

```text
Shift.id
```

### Create Shift

```http
POST /shift
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Example:

```json
{
  "name": "Morning Shift",
  "startTime": "08:00",
  "endTime": "17:00"
}
```

Other example:

```json
{
  "name": "Night Shift",
  "startTime": "22:00",
  "endTime": "07:00"
}
```

### Update Shift

```http
PATCH /shift/:id
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Example:

```json
{
  "startTime": "07:30",
  "endTime": "16:30"
}
```

### Deactivate Shift

```http
PATCH /shift/:id/deactivate
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

No body required.

---

# 15. Assign Shift to Employee

## Admin / HR

```http
POST /shift/employee/:employeeId
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Important:

The route currently says:

```text
:employeeId
```

but the value passed is:

```text
Employee.id
```

Your controller/local TypeScript variable should preferably be:

```ts
employeeDatabaseId
```

Example URL:

```text
/shift/employee/cmsr2e65x0000wse8oruv2he9
```

Body:

```json
{
  "shiftId": "SHIFT_DATABASE_ID",
  "workDays": [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ],
  "effectiveFrom": "2026-08-14"
}
```

Optional:

```json
{
  "shiftId": "SHIFT_DATABASE_ID",
  "workDays": [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ],
  "effectiveFrom": "2026-08-14",
  "effectiveTo": "2026-12-31"
}
```

No `effectiveTo` means:

```text
ongoing assignment
```

The backend prevents overlapping assignments.

---

# 16. Get Employee Shift History

## Admin / HR

```http
GET /shift/employee/:employeeId
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Again:

```text
:employeeId
```

currently contains:

```text
Employee.id
```

not:

```text
EMP-0005
```

---

# 17. Attendance Endpoints

AttendanceController is authenticated.

Employee identity always comes from JWT.

The employee does **not** send their Employee database ID when checking in/out.

---

## Check In

### Authenticated Employee

```http
POST /attendance/check-in
Authorization: Bearer EMPLOYEE_TOKEN
```

No body.

Backend determines:

```text
User.id
↓
Employee
↓
Employee.id

server time
↓
checkInAt

Asia/Manila date
↓
workDate

EmployeeShift
↓
expected shift
↓
lateMinutes
```

Expected record:

```json
{
  "employeeId": "EMPLOYEE_DATABASE_ID",
  "workDate": "2026-08-14T00:00:00.000Z",
  "checkInAt": "...",
  "checkOutAt": null,
  "lateMinutes": 0,
  "undertimeMinutes": 0
}
```

Duplicate check-in:

```text
409 Conflict
```

---

# 18. Check Out

### Authenticated Employee

```http
POST /attendance/check-out
Authorization: Bearer EMPLOYEE_TOKEN
```

No body.

Backend:

```text
find today's Attendance
↓
must already be checked in
↓
must not already be checked out
↓
set checkOutAt
↓
calculate undertimeMinutes
```

Duplicate checkout:

```text
409 Conflict
```

Checkout without check-in:

```text
400 Bad Request
```

---

# 19. My Attendance History

### Authenticated Employee

```http
GET /attendance/me
Authorization: Bearer EMPLOYEE_TOKEN
```

Optional date range:

```http
GET /attendance/me?from=2026-08-01&to=2026-08-31
```

Both `from` and `to` should be provided together.

---

# 20. Daily Attendance Status

### Authenticated Employee

```http
GET /attendance/me/status?date=2026-08-14
Authorization: Bearer EMPLOYEE_TOKEN
```

Possible derived statuses:

```text
scheduled
rest_day
on_leave
absent
in_progress
on_time
late
undertime
late_and_undertime
```

Status is currently **derived**, not stored in PostgreSQL.

Example:

```json
{
  "success": true,
  "message": "Daily attendance status retrieved successfully.",
  "data": {
    "workDate": "2026-08-14T00:00:00.000Z",
    "status": "rest_day"
  }
}
```

---

# 21. Attendance Management

## Admin / HR

```http
GET /attendance?date=2026-08-14
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Employee trying this endpoint:

```text
403 Forbidden
```

---

# 22. Attendance Summary

### Employee

```http
GET /attendance/me/summary?from=2026-08-01&to=2026-08-31
Authorization: Bearer EMPLOYEE_TOKEN
```

Possible response:

```json
{
  "totalWorkDays": 22,
  "present": 19,
  "onTime": 14,
  "late": 5,
  "undertime": 3,
  "absent": 1,
  "onLeave": 2,
  "restDays": 9,
  "totalLateMinutes": 73,
  "totalUndertimeMinutes": 25
}
```

The summary derives information from:

```text
EmployeeShift
+
workDays
+
Attendance
+
LeaveRequest
```

---

# 23. Leave Endpoints

## Submit Leave

### Authenticated Employee

```http
POST /leave
Authorization: Bearer EMPLOYEE_TOKEN
```

Example:

```json
{
  "leaveType": "vacation",
  "reason": "Family vacation",
  "startDate": "2026-09-01",
  "endDate": "2026-09-03"
}
```

Backend controls:

```text
employeeId
status
approvedById
approvedAt
```

Initial state:

```text
status = pending
approvedById = null
approvedAt = null
```

---

# 24. Get My Leave Requests

### Authenticated Employee

```http
GET /leave/me
Authorization: Bearer EMPLOYEE_TOKEN
```

Returns only the authenticated employee's requests.

---

# 25. Get All Leave Requests

## Admin / HR

```http
GET /leave
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Employee access:

```text
403 Forbidden
```

---

# 26. Approve Leave

## Admin / HR for Current V1

```http
PATCH /leave/:id/approve
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

`:id` means:

```text
LeaveRequest.id
```

No body required unless approval remarks are later added.

Flow:

```text
find LeaveRequest
↓
must exist
↓
must be pending
↓
find approver Employee from User.id
↓
status = approved
approvedById = approver Employee.id
approvedAt = now
```

Approving an already approved request:

```text
400 Bad Request
```

---

# 27. Reject Leave

## Admin / HR

```http
PATCH /leave/:id/reject
Authorization: Bearer ADMIN_OR_HR_TOKEN
```

Example:

```json
{
  "remarks": "Requested dates conflict with staffing requirements."
}
```

Flow:

```text
pending
↓
rejected
```

---

# 28. Cancel Leave

### Employee

```http
PATCH /leave/:id/cancel
Authorization: Bearer EMPLOYEE_TOKEN
```

No body.

Business rules:

```text
Leave must belong to current employee
Leave must still be pending
```

Trying to cancel another employee's leave:

```text
403 Forbidden
```

Trying to cancel approved/rejected leave:

```text
400 Bad Request
```

---

# 29. Leave State Machine

```text
                 pending
               /    |    \
              /     |     \
             ▼      ▼      ▼
       approved  rejected  cancelled
```

The frontend never directly sends:

```json
{
  "status": "approved"
}
```

Instead it calls an action endpoint:

```text
/approve
/reject
/cancel
```

The backend owns the workflow state.

---

# 30. Full Copy-Paste Regression Test

Use a completely new employee.

## A. Create Employee

```json
{
  "firstName": "Miguel",
  "middleName": "Reyes",
  "lastName": "Santos",
  "email": "miguel.santos@test.com",
  "hireDate": "2026-08-14",
  "employmentType": "regular",
  "departmentId": "DEPARTMENT_DATABASE_ID",
  "positionId": "POSITION_DATABASE_ID",
  "branchId": "BRANCH_DATABASE_ID"
}
```

Save:

```text
Employee.id
Employee.employeeNumber
```

---

## B. Create User

```json
{
  "email": "miguel.santos@test.com",
  "role": "employee",
  "employeeNumber": "EMP-0005"
}
```

Save:

```text
User.id
activationToken
```

---

## C. Activate

```json
{
  "token": "ACTIVATION_TOKEN",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

---

## D. Login

```json
{
  "email": "miguel.santos@test.com",
  "password": "Password123!"
}
```

Save:

```text
EMPLOYEE_TOKEN
```

---

## E. Create Shift

Admin/HR:

```json
{
  "name": "Regression Morning Shift",
  "startTime": "08:00",
  "endTime": "17:00"
}
```

Save:

```text
SHIFT_ID
```

---

## F. Assign Shift

```json
{
  "shiftId": "SHIFT_ID",
  "workDays": [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ],
  "effectiveFrom": "2026-08-14"
}
```

---

## G. Check Daily Status

```http
GET /attendance/me/status?date=2026-08-14
```

Possible:

```text
scheduled
rest_day
```

depending on assignment/workdays.

---

## H. Check In

```http
POST /attendance/check-in
```

No body.

---

## I. Check In Again

```http
POST /attendance/check-in
```

Expected:

```text
409
```

---

## J. Check Out

```http
POST /attendance/check-out
```

No body.

---

## K. Check Out Again

Expected:

```text
409
```

---

## L. My Attendance

```http
GET /attendance/me
```

---

## M. Attendance Summary

```http
GET /attendance/me/summary?from=2026-08-01&to=2026-08-31
```

---

## N. Submit Leave

```json
{
  "leaveType": "vacation",
  "reason": "Regression testing leave",
  "startDate": "2026-09-01",
  "endDate": "2026-09-03"
}
```

Save:

```text
LEAVE_REQUEST_ID
```

---

## O. My Leave

```http
GET /leave/me
```

---

## P. Employee Tries Management Leave

```http
GET /leave
```

Expected:

```text
403
```

---

## Q. Admin / HR Approves

```http
PATCH /leave/LEAVE_REQUEST_ID/approve
```

Expected:

```text
approved
approvedById populated
approvedAt populated
```

---

# 31. Quick Endpoint Cheat Sheet

```text
DEPARTMENT
admin/hr
GET    /department
GET    /department/:id
POST   /department
PATCH  /department/:id


BRANCH
admin/hr
GET    /branch
GET    /branch/:id
POST   /branch
PATCH  /branch/:id


POSITION
admin/hr
GET    /position
GET    /position/:id
POST   /position
PATCH  /position/:id


EMPLOYEE
admin/hr
GET    /employee
GET    /employee/:id
POST   /employee
PATCH  /employee/:id
DELETE /employee/:id

authenticated employee
GET    /employee/me
PATCH  /employee/me


USER
admin/hr
POST   /user


AUTH
public
POST   /auth/activate
POST   /auth/login


SHIFT
admin/hr
GET    /shift
GET    /shift/:id
POST   /shift
PATCH  /shift/:id
PATCH  /shift/:id/deactivate

admin/hr
POST   /shift/employee/:employeeId
GET    /shift/employee/:employeeId


ATTENDANCE
authenticated employee
POST   /attendance/check-in
POST   /attendance/check-out
GET    /attendance/me
GET    /attendance/me/status?date=YYYY-MM-DD
GET    /attendance/me/summary?from=YYYY-MM-DD&to=YYYY-MM-DD

admin/hr
GET    /attendance?date=YYYY-MM-DD


LEAVE
authenticated employee
POST   /leave
GET    /leave/me
PATCH  /leave/:id/cancel

admin/hr
GET    /leave
PATCH  /leave/:id/approve
PATCH  /leave/:id/reject
```

---

# 32. Mental Model

When you forget how the system works, remember this:

```text
Department / Position / Branch
          ↓
       Employee
          ↓
         User
          ↓
      Activation
          ↓
        Login
          ↓
          JWT
          ↓
   Authenticated User
          ↓
   Employee Profile
       /        \
      /          \
   Shift        Leave
      \          /
       \        /
       Attendance
```

And for security:

```text
JwtAuthGuard
→ Who are you?

RolesGuard
→ Does your role allow this?

Service ownership/business rules
→ Are you allowed to act on THIS specific resource?

Repository
→ Save/read the data
```

That is the core architecture of the current HR Management backend.
