# Database Schema Specification

Normalized MySQL tables:
- `departments`: Department definitions (CSE, ECE, MECH, etc.)
- `users`: Authentication, passwords (bcrypt), and roles (STUDENT, FACULTY, MENTOR, HOD, ADMIN).
- `students`: Student profiles (registration number, section, semester, batch).
- `faculty`: Faculty profiles (employee ID, designation, cabin).
- `mentor_assignments`: Student-to-mentor mapping for academic years.
- `approval_workflows`: Workflow definitions for OD, Leave, and Event types.
- `approval_steps`: Ordered sequence of required roles for each workflow.
- `permission_requests`: Core request records with tracking states, dates, and reviewer markers.
- `approval_history`: Comprehensive audit trail of all reviewer decisions and remarks.
- `uploaded_documents`: Metadata for supporting evidence attachments.
- `notifications`: In-app notification queue and email transmission logs.
