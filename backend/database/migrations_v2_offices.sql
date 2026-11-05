-- ====================================================================
-- Upgrade Migration: University Offices & AI-Powered Routing Tables
-- ====================================================================

USE workflow_automation_db;

-- 1. University Offices Table
CREATE TABLE IF NOT EXISTS university_offices (
  office_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  responsible_officer VARCHAR(150) NOT NULL,
  contact_email VARCHAR(100) NOT NULL,
  contact_phone VARCHAR(30),
  location VARCHAR(150) NOT NULL,
  supported_permission_types TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Office Staff Assignment Table
CREATE TABLE IF NOT EXISTS office_staff (
  staff_id INT AUTO_INCREMENT PRIMARY KEY,
  office_id INT NOT NULL,
  user_id INT NOT NULL,
  designation VARCHAR(100) NOT NULL,
  is_primary_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (office_id) REFERENCES university_offices(office_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_office_user (office_id, user_id)
);

-- 3. AI Classification & Routing Logs
CREATE TABLE IF NOT EXISTS ai_classification_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  model_used VARCHAR(50) DEFAULT 'gemini-3.5-flash-lite',
  prompt_summary TEXT,
  raw_response TEXT,
  permission_category VARCHAR(100),
  suggested_primary_office VARCHAR(150),
  suggested_secondary_offices TEXT,
  reason TEXT,
  confidence DECIMAL(4,3) DEFAULT 0.000,
  requires_clarification BOOLEAN DEFAULT FALSE,
  clarification_question TEXT,
  status ENUM('ROUTED', 'MANUAL_REVIEW_NEEDED', 'CLARIFICATION_REQUESTED', 'OVERRIDDEN') DEFAULT 'ROUTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE
);

-- 4. Application to Office Assignments Table
CREATE TABLE IF NOT EXISTS application_office_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  office_id INT NOT NULL,
  assigned_by ENUM('AI_ROUTING', 'ADMIN_MANUAL', 'OFFICE_FORWARD') DEFAULT 'AI_ROUTING',
  status ENUM('PENDING', 'ACCEPTED', 'PROCESSED', 'FORWARDED', 'REJECTED') DEFAULT 'PENDING',
  action_taken_by INT NULL,
  remarks TEXT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES university_offices(office_id) ON DELETE CASCADE,
  FOREIGN KEY (action_taken_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 5. Clarification History Table
CREATE TABLE IF NOT EXISTS clarification_history (
  clarification_id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  question TEXT NOT NULL,
  student_reply TEXT NULL,
  replied_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES permission_requests(request_id) ON DELETE CASCADE
);

-- Indexes for lightning-fast lookups
CREATE INDEX idx_office_code ON university_offices(code);
CREATE INDEX idx_office_active ON university_offices(is_active);
CREATE INDEX idx_ai_req ON ai_classification_logs(request_id);
CREATE INDEX idx_app_office ON application_office_assignments(office_id, status);
CREATE INDEX idx_clarify_req ON clarification_history(request_id);
