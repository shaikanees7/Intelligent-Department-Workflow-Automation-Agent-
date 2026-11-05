-- ====================================================================
-- Intelligent Department Workflow Automation Agent
-- Comprehensive Normalized MySQL Database Schema
-- ====================================================================

CREATE DATABASE IF NOT EXISTS workflow_automation_db;
USE workflow_automation_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  department_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Core Auth & Roles: STUDENT, FACULTY, MENTOR, HOD, ADMIN)
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  role ENUM('STUDENT', 'FACULTY', 'MENTOR', 'HOD', 'ADMIN') NOT NULL,
  department_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- 3. Students Profile Table
CREATE TABLE IF NOT EXISTS students (
  student_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  registration_number VARCHAR(50) NOT NULL UNIQUE,
  section VARCHAR(10) NOT NULL,
  semester INT NOT NULL,
  batch_year VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. Faculty Profile Table
CREATE TABLE IF NOT EXISTS faculty (
  faculty_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  designation VARCHAR(100) NOT NULL,
  cabin_location VARCHAR(100),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Mentor Assignments (Student <-> Mentor Relationship)
CREATE TABLE IF NOT EXISTS mentor_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  student_user_id INT NOT NULL,
  mentor_user_id INT NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 6. Approval Workflows Definition (e.g. OD, Leave, Event Participation)
CREATE TABLE IF NOT EXISTS approval_workflows (
  workflow_id INT AUTO_INCREMENT PRIMARY KEY,
  request_type ENUM('OD', 'LEAVE', 'EVENT') NOT NULL UNIQUE,
  workflow_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Approval Steps per Workflow (Sequential sequence of reviewers)
CREATE TABLE IF NOT EXISTS approval_steps (
  step_id INT AUTO_INCREMENT PRIMARY KEY,
  workflow_id INT NOT NULL,
  step_order INT NOT NULL,
  required_role ENUM('MENTOR', 'FACULTY', 'HOD', 'ADMIN') NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  can_bypass BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (workflow_id) REFERENCES approval_workflows(workflow_id) ON DELETE CASCADE,
  UNIQUE KEY unique_step (workflow_id, step_order)
);

-- 8. Permission Requests Table
CREATE TABLE IF NOT EXISTS permission_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  request_code VARCHAR(30) NOT NULL UNIQUE,
  student_user_id INT NOT NULL,
  request_type ENUM('OD', 'LEAVE', 'EVENT') NOT NULL,
  reason TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_urgent BOOLEAN DEFAULT FALSE,
  current_step_order INT DEFAULT 1,
  current_reviewer_role ENUM('MENTOR', 'FACULTY', 'HOD', 'ADMIN') DEFAULT 'MENTOR',
  current_reviewer_user_id INT NULL,
  overall_status ENUM('SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') DEFAULT 'SUBMITTED',
  pdf_letter_url VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (current_reviewer_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 9. Approval History / Audit Trail
CREATE TABLE IF NOT EXISTS approval_history (
  history_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  step_order INT NOT NULL,
  reviewer_user_id INT NOT NULL,
  action ENUM('SUBMITTED', 'VERIFIED', 'APPROVED', 'REJECTED', 'FORWARDED') NOT NULL,
  remarks TEXT,
  action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 10. Uploaded Supporting Documents
CREATE TABLE IF NOT EXISTS uploaded_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE
);

-- 11. Notifications Table (In-app + email notification records)
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_id INT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('SUBMISSION', 'ASSIGNMENT', 'APPROVAL', 'REJECTION', 'REMINDER', 'FORWARDED') NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE
);

-- Indexes for high-performance querying
CREATE INDEX idx_req_student ON permission_requests(student_user_id);
CREATE INDEX idx_req_status ON permission_requests(overall_status);
CREATE INDEX idx_req_reviewer ON permission_requests(current_reviewer_user_id);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);
CREATE INDEX idx_history_req ON approval_history(request_id);
