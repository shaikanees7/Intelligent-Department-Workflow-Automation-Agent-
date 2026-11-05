# Database Schema Documentation: Intelligent Department Workflow Automation Agent

Database Name: `workflow_automation_db`  
RDBMS: MySQL 8.0  
Storage Engine: InnoDB (with Transactional Isolation)

---

## 1. Entity-Relationship Diagram

```
[ departments ]
      ▲
      │ 1:N
   [ users ] ────────┬─────── 1:1 ───────► [ students ]
      ▲              │                          ▲
      │              └─────── 1:1 ──► [ faculty ]│
      │                                         │
      ├─────────────────── 1:N ─────────────────┘
      │ (mentor_assignments: student_user_id & mentor_user_id)
      │
      ├─────────────────── 1:N ─────────► [ permission_requests ]
      │                                         ▲          ▲
      │                                         │ 1:N      │ 1:N
      ├─────────────────── 1:N ──────► [ approval_history ]│
      │                                                    │
      ├─────────────────── 1:N ────────► [ notifications ] │
      │                                                    │
      └─────────────────────────────────── [ uploaded_documents ]

[ approval_workflows ] ─────── 1:N ───────► [ approval_steps ]
```

---

## 2. Table Specifications

### 1. `departments`
Stores academic department structures.
- `department_id` INT AUTO_INCREMENT PRIMARY KEY
- `code` VARCHAR(20) NOT NULL UNIQUE
- `name` VARCHAR(100) NOT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2. `users`
Core user identity and authentication credentials.
- `user_id` INT AUTO_INCREMENT PRIMARY KEY
- `email` VARCHAR(100) NOT NULL UNIQUE
- `password_hash` VARCHAR(255) NOT NULL
- `first_name` VARCHAR(50) NOT NULL
- `last_name` VARCHAR(50) NOT NULL
- `phone` VARCHAR(20)
- `role` ENUM('STUDENT', 'FACULTY', 'MENTOR', 'HOD', 'ADMIN') NOT NULL
- `department_id` INT (FK -> departments.department_id)
- `is_active` BOOLEAN DEFAULT TRUE
- `created_at` / `updated_at` TIMESTAMP

### 3. `students`
Student profile metadata and university identifiers.
- `student_id` INT AUTO_INCREMENT PRIMARY KEY
- `user_id` INT NOT NULL UNIQUE (FK -> users.user_id)
- `registration_number` VARCHAR(50) NOT NULL UNIQUE
- `section` VARCHAR(10) NOT NULL
- `semester` INT NOT NULL
- `batch_year` VARCHAR(20) NOT NULL

### 4. `faculty`
Faculty, mentor, and departmental leadership profiles.
- `faculty_id` INT AUTO_INCREMENT PRIMARY KEY
- `user_id` INT NOT NULL UNIQUE (FK -> users.user_id)
- `employee_id` VARCHAR(50) NOT NULL UNIQUE
- `designation` VARCHAR(100) NOT NULL
- `cabin_location` VARCHAR(100)

### 5. `mentor_assignments`
Maps students to their designated academic mentor.
- `assignment_id` INT AUTO_INCREMENT PRIMARY KEY
- `student_user_id` INT NOT NULL (FK -> users.user_id)
- `mentor_user_id` INT NOT NULL (FK -> users.user_id)
- `academic_year` VARCHAR(20) NOT NULL

### 6. `approval_workflows`
Defines available request workflows.
- `workflow_id` INT AUTO_INCREMENT PRIMARY KEY
- `request_type` ENUM('OD', 'LEAVE', 'EVENT', 'EXAM') NOT NULL UNIQUE
- `workflow_name` VARCHAR(100) NOT NULL
- `description` TEXT
- `is_active` BOOLEAN DEFAULT TRUE

### 7. `approval_steps`
Sequential review hierarchy for each workflow.
- `step_id` INT AUTO_INCREMENT PRIMARY KEY
- `workflow_id` INT NOT NULL (FK -> approval_workflows.workflow_id)
- `step_order` INT NOT NULL
- `required_role` ENUM('MENTOR', 'FACULTY', 'HOD', 'ADMIN') NOT NULL
- `step_name` VARCHAR(100) NOT NULL
- `can_bypass` BOOLEAN DEFAULT FALSE
- `UNIQUE KEY unique_step` (workflow_id, step_order)

### 8. `permission_requests`
Primary permission application records.
- `request_id` INT AUTO_INCREMENT PRIMARY KEY
- `request_code` VARCHAR(30) NOT NULL UNIQUE
- `student_user_id` INT NOT NULL (FK -> users.user_id)
- `request_type` ENUM('OD', 'LEAVE', 'EVENT', 'EXAM') NOT NULL
- `reason` TEXT NOT NULL
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `is_urgent` BOOLEAN DEFAULT FALSE
- `current_step_order` INT DEFAULT 1
- `current_reviewer_role` ENUM('MENTOR', 'FACULTY', 'HOD', 'ADMIN')
- `current_reviewer_user_id` INT (FK -> users.user_id)
- `overall_status` ENUM('SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')
- `pdf_letter_url` VARCHAR(255)

### 9. `approval_history`
Immutable audit trail recording every reviewer decision.
- `history_id` INT AUTO_INCREMENT PRIMARY KEY
- `request_id` INT NOT NULL (FK -> permission_requests.request_id)
- `step_order` INT NOT NULL
- `reviewer_user_id` INT NOT NULL (FK -> users.user_id)
- `action` ENUM('SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED', 'FORWARDED')
- `remarks` TEXT
- `action_timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 10. `uploaded_documents`
Metadata for uploaded supporting files.
- `document_id` INT AUTO_INCREMENT PRIMARY KEY
- `request_id` INT NOT NULL (FK -> permission_requests.request_id)
- `file_name` VARCHAR(255) NOT NULL
- `file_path` VARCHAR(255) NOT NULL
- `file_type` VARCHAR(50)
- `file_size` INT

### 11. `notifications`
In-app alerts and notifications across all application events.
- `notification_id` INT AUTO_INCREMENT PRIMARY KEY
- `user_id` INT NOT NULL (FK -> users.user_id)
- `request_id` INT (FK -> permission_requests.request_id)
- `title` VARCHAR(150) NOT NULL
- `message` TEXT NOT NULL
- `type` ENUM('SUBMISSION', 'ASSIGNMENT', 'APPROVAL', 'REJECTION', 'REMINDER', 'FORWARDED')
- `is_read` BOOLEAN DEFAULT FALSE
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
