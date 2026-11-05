# Architecture Documentation: Intelligent Department Workflow Automation Agent

## 1. System Overview
The **Intelligent Department Workflow Automation Agent (IDWAA)** is an enterprise-grade academic workflow automation platform built for universities and higher education institutions. It digitizes student permission requests (On-Duty, Student Leave, Event Participation, Exam Permissions) and automates multi-stage verification, approval routing, audit logging, and digital gate pass issuance.

---

## 2. Architecture Layers

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER                               │
│  React.js SPA (Tailwind CSS, Lucide Icons, Axios, React Router v6)     │
│  Dashboards: Student | Mentor | Faculty | HOD | Central Admin          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Multipart (JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION TIER                                │
│  Express.js REST API Server (Port 5000)                                │
│  ├── Security: JWT Verification, RBAC Middleware, CORS Control        │
│  ├── Controllers: Auth, Requests, Reviewers, Admin, Notifications     │
│  └── Storage: Multer (Supporting Documents & Uploads)                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     INTELLIGENT WORKFLOW ENGINE                        │
│  ├── Multi-Level Approval State Machine with ACID Transactions        │
│  ├── Dynamic Authority Routing (Mentor -> Faculty -> HOD)              │
│  ├── Priority & Urgency Assessment Engine (<48h Deadline Flagging)     │
│  ├── PDFKit Digital Permission Pass Generation                         │
│  ├── Background Hourly Reminder Cron (Stagnant Request Alerts)        │
│  └── Dual Channel Alerts: In-App Notifications + Email (Nodemailer)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ MySQL2 Connection Pool
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE TIER                           │
│  MySQL 8.0 Relational Database (11 Normalized Tables)                  │
│  Tables: users, students, faculty, departments, mentor_assignments,    │
│  permission_requests, approval_workflows, approval_steps,              │
│  approval_history, uploaded_documents, notifications                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Approval Workflow State Machine

Applications transition dynamically based on database-configured approval steps:

```
[ Student Submits Request ]
            │
            ▼
    [ Status: SUBMITTED ]
    (Urgency Assessed; Mentor Assigned)
            │
            ▼
┌───────────────────────────────────────┐
│     Step 1: Mentor Verification      │
└───────────────────┬───────────────────┘
                    │
         ┌──────────┴──────────┐
         │ (Rejected)          │ (Approved / Verified)
         ▼                     ▼
[ Status: REJECTED ]    [ Status: UNDER_REVIEW ]
(Workflow Terminates)   (Forwarded to Step 2: Faculty)
                               │
                               ▼
                    ┌───────────────────────────────────────┐
                    │      Step 2: Faculty Approval         │
                    └───────────────────┬───────────────────┘
                                        │
                             ┌──────────┴──────────┐
                             │ (Rejected)          │ (Approved)
                             ▼                     ▼
                    [ Status: REJECTED ]    [ Status: UNDER_REVIEW ]
                    (Workflow Terminates)   (Forwarded to Step 3: HOD)
                                                   │
                                                   ▼
                                        ┌───────────────────────────────────────┐
                                        │       Step 3: HOD Final Sanction      │
                                        └───────────────────┬───────────────────┘
                                                            │
                                                 ┌──────────┴──────────┐
                                                 │ (Rejected)          │ (Approved)
                                                 ▼                     ▼
                                        [ Status: REJECTED ]    [ Status: APPROVED ]
                                        (Workflow Terminates)   (1. PDF Pass Generated)
                                                                (2. Gate Pass Link Created)
                                                                (3. Student Notified)
```

---

## 4. Intelligent Routing Matrix

Reviewers are resolved automatically using institutional organization data:

| Workflow Step | Target Role | Resolution Logic |
|---|---|---|
| Step 1: Initial Verification | `MENTOR` | Looked up from `mentor_assignments` where `student_user_id = ?` |
| Step 2: Department Sanction | `FACULTY` | Resolved by active faculty member in student's department (`department_id = ?`) |
| Step 3: Executive Sanction | `HOD` | Resolved by department HOD (`role = 'HOD' AND department_id = ?`) |
| Exceptional Step | `ADMIN` | Resolved by institutional system administrator |

---

## 5. Security & RBAC Specifications

- **Token Format**: HMAC-SHA256 Signed JSON Web Tokens containing `{ userId, email, role, departmentId }`.
- **Session Duration**: 24 hours (`JWT_EXPIRES_IN=24h`).
- **Authorization Guard**: `requireRole(...roles)` validates token claims prior to controller execution.
- **Data Protection**: Database transactions with `FOR UPDATE` row locks prevent race conditions and duplicate approvals.
- **Audit Compliance**: All actions recorded in immutable `approval_history` records with timestamps and reviewer remarks.
