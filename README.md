# Intelligent Department Workflow Automation Agent 🚀

A centralized, enterprise-grade digital permission and workflow automation platform built for educational institutions. Designed to eliminate manual paper signatures and automate multi-level permission workflows (On-Duty, Student Leave, Event Participation, Exam Permissions) with real-time tracking, digital gate pass generation, and role-based authority dashboards.

---

## 🏛️ System Features & Functionalities

- **Intelligent Multi-Level Workflows**: Configurable sequential approval chains (Student → Mentor → Faculty Coordinator → HOD).
- **Google Gemini AI Routing Agent**: Integrates Google Gemini API to analyze submitted student requests, understand natural language intents, classify permission categories, and match against active registered university offices.
- **University Office Registration Module**: Centralized administration portal allowing dynamic registration, editing, and activation of university administrative sections (Examination Cell, Finance Office, Hostel Office, Academic Office, Sports Department, Library, Transportation Office, etc.).
- **Interactive AI Clarification Engine**: Flags ambiguous requests, asks targeted clarification questions to students, receives answers, and re-classifies applications automatically with historical audit trails.
- **Dedicated Office Administrator Portals (`/office`)**: Custom workflow desk for university office administrators to review incoming requests, accept assignments, forward between offices, approve, or reject.
- **Rule-Based Urgency Engine**: Automatically detects short lead times (<48 hours) and flags urgent applications for priority review.
- **Dynamic Authority Routing**: Automatically resolves the student's assigned academic mentor, department faculty coordinator, and HOD from institutional records.
- **Role-Based Portals (6 Distinct Roles)**:
  - **Student**: Submit OD, Leave, Event, and Exam permission requests; upload supporting documents; track live progress; answer AI clarifications; download signed PDF gate passes.
  - **Office Admin**: Review routed applications, inspect AI routing explanations, accept or forward requests, and grant section-level sanctions.
  - **Mentor**: Verify mentee academic standing, check attendance metrics, add observations, and forward applications.
  - **Faculty**: Department review desk, adjust lab/class schedules, sanction or reject with remarks.
  - **HOD**: Executive department authorization, digital sanctioning, and institutional gate pass issuance.
  - **Administrator**: Institutional analytics, university office registration, AI routing metrics, user management, mentor assignments, workflow engine configuration, and audit logs.
- **Digital PDF Pass Generation**: Automatic cryptographic generation of official permission letters with unique reference IDs and verified signatories upon HOD approval.
- **Background Automation & Alerts**: Automated hourly cron service sending reminder notifications for stagnant applications pending over 24 hours.
- **Immutable Audit Trail**: Transparent step-by-step history tracking reviewer identities, timestamps, and decision remarks.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend (Untouched)** | React.js 18, Tailwind CSS, Lucide React, Axios, React Router v6 |
| **Backend API** | Node.js, Express.js, RESTful Architecture |
| **Database** | MySQL 8.0, mysql2 connection pool with transactional isolation |
| **Authentication** | JSON Web Tokens (JWT), Bcrypt.js password hashing, RBAC middleware |
| **File Handling & PDF** | Multer (5MB validation), PDFKit (automated certificate generation) |
| **Automation** | Node-Cron, Nodemailer (with simulated fallback logging) |

---

## 📁 Directory Structure

```
├── docs/                        # Architecture, API, and Database specifications
│   ├── ARCHITECTURE.md          # Multi-tier system architecture & workflow state machine
│   ├── API_DOCUMENTATION.md     # Complete REST API reference
│   └── DATABASE_SCHEMA.md       # Relational 3NF database schema & ER diagram
├── backend/                     # Node.js & Express REST API Server
│   ├── server.js                # Server entry point & cron initializer
│   ├── database/
│   │   ├── schema.sql           # Complete MySQL database DDL (11 tables)
│   │   ├── db.js                # MySQL pool connection with retry logic
│   │   └── seed.js              # Institutional demo data seeder
│   ├── uploads/                 # Storage for attachments & generated PDFs
│   ├── tests/                   # Automated API integration test suite
│   │   └── api.test.js          # 30-assertion end-to-end test runner
│   └── src/
│       ├── config/              # JWT, Mail, Multer configurations
│       ├── controllers/         # Auth, Request, Admin, Notification controllers
│       ├── middleware/          # JWT, Role authorization, Validation, Error handler
│       ├── models/              # User, Student, PermissionRequest, Notification models
│       ├── routes/              # Modular Express route handlers
│       ├── services/            # Workflow engine, PDF generator, Priority engine, Cron
│       └── utils/               # Constants, API response helpers, Logger
├── frontend/                    # React.js SPA Dashboard (STRICTLY READ-ONLY)
│   ├── src/
│   │   ├── components/          # Common UI, Navbar, Sidebar, StatusBadge, Timeline
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/               # Dashboards (Student, Faculty, Mentor, HOD, Admin)
│   │   └── services/api.js      # Axios API client
├── .env.example                 # Root environment template
└── package.json                 # Monorepo task runner
```

---

## 🚀 Quick Start & Execution Guide

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MySQL Server**: 8.0 or higher running on port `3306` or `3307`

### 2. Environment Configuration
Copy the environment template in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Ensure your database credentials match in `backend/.env`:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
DB_NAME=workflow_automation_db
JWT_SECRET=super_secret_jwt_key_department_workflow_2026
CLIENT_URL=http://localhost:3000
```

### 3. Database Initialization & Seeding
Initialize the database tables and institutional seed dataset:
```bash
# Apply schema
mysql -h 127.0.0.1 -P 3307 -u root < backend/database/schema.sql

# Seed data
cd backend
npm run db:seed
```

### 4. Running the Complete Application

Run backend and frontend concurrently from the root directory:
```bash
# Terminal 1: Start Backend Server (Port 5000)
cd backend
npm start

# Terminal 2: Start Frontend Application (Port 3000)
cd frontend
npm start
```

Or from the repository root:
```bash
npm run dev
```

---

## 🔑 Institutional Demo Credentials

All test accounts share the default password: **`password123`**

| Role | Email Address | Assigned Department | Default Dashboard |
|---|---|---|---|
| **Student (Lead)** | `student1@institution.edu` | Computer Science | `/student` |
| **Student (Personal)** | `vu.241fa18363@gmail.com` | Computer Science | `/student` |
| **Faculty Mentor** | `mentor.cse@institution.edu` | Computer Science | `/mentor` |
| **Faculty Coordinator** | `faculty.cse@institution.edu` | Computer Science | `/faculty` |
| **Head of Department (HOD)** | `hod.cse@institution.edu` | Computer Science | `/hod` |
| **System Administrator** | `admin@institution.edu` | Central Administration | `/admin` |

---

## 🧪 Automated Testing

The backend includes a comprehensive 30-assertion integration test suite testing all 5 roles, multi-level approvals, rejections, tracking, notifications, and access controls:

```bash
cd backend
npm test
```

Expected Output:
```
====================================================
STARTING BACKEND API INTEGRATION TEST SUITE
====================================================
  ✅ PASS: Health check returns 200 OK
  ✅ PASS: Student login successful with JWT
  ✅ PASS: Mentor login successful
  ✅ PASS: Faculty login successful
  ✅ PASS: HOD login successful
  ✅ PASS: Admin login successful
  ✅ PASS: User email (vu.241fa18363@gmail.com) login successful
  ✅ PASS: Invalid password rejected with 401 Unauthorized
  ✅ PASS: Student request created with 201 Created
  ✅ PASS: Step 1: Mentor approved and request forwarded to FACULTY
  ✅ PASS: Step 2: Faculty approved and request forwarded to HOD
  ✅ PASS: Step 3: HOD final approval completed
  ✅ PASS: PDF Permission Pass generated successfully
  ✅ PASS: Tracking confirms request is APPROVED
  ✅ PASS: Audit trail contains all 3 review steps with remarks and timestamps
  ✅ PASS: Student blocked from admin endpoints (403 Forbidden)
====================================================
TEST RESULTS: 30 PASSED, 0 FAILED
====================================================
```

---

## 🔒 Security Best Practices
- Passwords hashed using bcrypt with salt factor 10.
- State-changing approval endpoints locked using MySQL row-level `FOR UPDATE` transactions to prevent race conditions.
- Strict Role-Based Access Control (RBAC) enforced on all private routes.
- Sanitized file uploads restricted to allowed extensions (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`) up to 5MB.
