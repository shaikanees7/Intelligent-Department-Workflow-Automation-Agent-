# Intelligent Department Workflow Automation Agent 🚀

A centralized, automated digital permission and approval platform for university departments. Designed to replace paper applications with automated multi-level workflows, real-time tracking, PDF pass generation, and role-based dashboards.

---

## 🏛️ System Features & Functionalities

- **Automated Multi-Level Workflows**: Configurable sequence (Student → Mentor → Faculty Coordinator → HOD).
- **Rule-Based Routing & Priority**: Urgent requests automatically flagged based on lead times.
- **Role-Based Portals**:
  - **Student**: Submit OD, Leave, Event requests, track live approval timeline, download PDF passes.
  - **Faculty**: Review, verify, add remarks, and forward applications to HOD.
  - **Mentor**: Verify assigned student records and request integrity.
  - **HOD & Admin**: Final sanctioning, workflow builder, audit history, user management, and department analytics.
- **Automated Reminders**: Hourly cron service alerting authorities of pending requests > 24 hours.
- **Audit Trail & Tracking**: Transparent timeline with reviewer names, timestamps, and remarks.
- **PDF Generation**: Automated PDF generation for sanctioned permission passes.

---

## 📁 Project Directory Structure

```
├── docs/                        # Architecture and schema documentation
│   ├── ARCHITECTURE.md
│   └── DATABASE_SCHEMA.md
├── backend/                     # Node.js & Express REST API Backend
│   ├── server.js                # Server entry point & cron initializer
│   ├── database/
│   │   ├── schema.sql           # Complete MySQL database DDL
│   │   ├── db.js                # MySQL pool connection
│   │   └── seed.js              # Sample data seeder
│   ├── uploads/                 # Storage for attachments & generated PDFs
│   └── src/
│       ├── config/              # JWT, Mail, Multer configurations
│       ├── controllers/         # Auth, Request, Admin, Notification controllers
│       ├── middleware/          # JWT, Role authorization, Validation, Error handler
│       ├── models/              # User, Student, PermissionRequest, Notification models
│       ├── routes/              # Modular Express route handlers
│       ├── services/            # Workflow engine, PDF generator, Priority engine, Cron
│       └── utils/               # Constants, API response helpers, Logger
├── frontend/                    # React.js SPA Dashboard
│   ├── public/                  # HTML template & assets
│   ├── src/
│   │   ├── assets/              # Styles and Tailwind configuration
│   │   ├── components/
│   │   │   ├── common/          # Navbar, Sidebar, Badges, ProtectedRoute
│   │   │   └── tracking/        # Live timeline workflow visualizer
│   │   ├── context/             # AuthContext, NotificationContext
│   │   ├── pages/               # Auth, Student, Faculty, Mentor, Admin dashboards
│   │   └── services/            # Axios API client
│   ├── tailwind.config.js
│   └── package.json
├── package.json                 # Root script runner (dev, install:all, db:setup)
└── README.md                    # Project documentation
```

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MySQL (Normalized schema).
- **Authentication**: JWT & Bcrypt password hashing.
- **Utilities**: PDFKit (PDF generation), Node-Cron (Automated reminders), Nodemailer (Email).

---

## 🚀 Setup & Execution Guide (Windows / VS Code)

### 1. Database Setup (MySQL)
Create database and run the schema:
```bash
mysql -u root -p < backend/database/schema.sql
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in `backend/` and configure your MySQL credentials:
```bash
cp backend/.env.example backend/.env
```

### 3. Install Dependencies
From the root directory:
```bash
npm run install:all
```

### 4. Seed Default Users & Workflows
```bash
npm run db:setup
```

### 5. Run Application Concurrently
```bash
npm run dev
```
- Frontend will open at: `http://localhost:3000`
- Backend API running at: `http://localhost:5000`

---

## 🔑 Default Seed Credentials

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@institution.edu` | `password123` |
| **HOD (CSE)** | `hod.cse@institution.edu` | `password123` |
| **Faculty Coordinator** | `faculty.cse@institution.edu` | `password123` |
| **Academic Mentor** | `mentor.cse@institution.edu` | `password123` |
| **Student** | `student1@institution.edu` | `password123` |

---
