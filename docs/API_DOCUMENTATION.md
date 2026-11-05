# Complete API Documentation: Intelligent Department Workflow Automation Agent

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates user credentials and issues a JWT session token.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "student1@institution.edu",
  "password": "password123"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "userId": 5,
      "user_id": 5,
      "email": "student1@institution.edu",
      "firstName": "Anees",
      "first_name": "Anees",
      "lastName": "Shaik",
      "last_name": "Shaik",
      "role": "STUDENT",
      "departmentId": 1,
      "department_id": 1,
      "departmentName": "Computer Science and Engineering",
      "department_name": "Computer Science and Engineering",
      "registrationNumber": "REG2024CSE001",
      "registration_number": "REG2024CSE001",
      "section": "A",
      "semester": 6,
      "batchYear": "2022-2026",
      "batch_year": "2022-2026"
    }
  }
}
```

### `POST /api/auth/register`
Creates a new student account, profile, and assigns the default mentor.
- **Access**: Public
- **Request Body**:
```json
{
  "email": "newstudent@institution.edu",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "registrationNumber": "241FA18999",
  "departmentId": 1,
  "section": "A",
  "semester": 6,
  "batchYear": "2022-2026"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": { "user": { ... }, "token": "..." }
}
```

### `GET /api/auth/profile`
Fetches the authenticated user's profile.
- **Access**: Bearer Token (Any Role)
- **Response `200 OK`**: `{ "success": true, "data": { ...user } }`

---

## 2. Permission Request Endpoints (`/api/requests`)

### `POST /api/requests`
Submits a new permission request with automatic urgency assessment and mentor routing.
- **Access**: Bearer Token (`STUDENT` only)
- **Content-Type**: `multipart/form-data` or `application/json`
- **Fields**:
  - `request_type`: `'OD' | 'LEAVE' | 'EVENT' | 'EXAM'` (required)
  - `reason`: string (required)
  - `start_date`: `'YYYY-MM-DD'` (required)
  - `end_date`: `'YYYY-MM-DD'` (required)
  - `supporting_document`: file (optional)
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Permission request submitted successfully",
  "data": {
    "requestId": 7,
    "requestCode": "REQ-842104",
    "request_id": 7,
    "request_code": "REQ-842104"
  }
}
```

### `GET /api/requests/my`
Retrieves all applications submitted by the logged-in student.
- **Access**: Bearer Token (`STUDENT` only)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "request_id": 1,
      "request_code": "REQ-842104",
      "request_type": "OD",
      "reason": "Selected for Hackathon...",
      "start_date": "2026-11-08",
      "end_date": "2026-11-10",
      "is_urgent": 1,
      "current_step_order": 2,
      "current_reviewer_role": "FACULTY",
      "reviewer_first_name": "Anitha",
      "overall_status": "UNDER_REVIEW",
      "pdf_letter_url": null,
      "created_at": "2026-11-04T09:30:00Z"
    }
  ]
}
```

### `GET /api/requests/pending`
Retrieves pending applications assigned to the logged-in reviewing authority.
- **Access**: Bearer Token (`MENTOR`, `FACULTY`, `HOD`, `ADMIN`)
- **Response `200 OK`**: Array of pending applications with student academic profile and previous remarks.

### `GET /api/requests/:id/track`
Returns live tracking status and complete audit history timeline.
- **Access**: Bearer Token (Any Role)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "request": {
      "request_id": 1,
      "request_code": "REQ-842104",
      "request_type": "OD",
      "overall_status": "APPROVED",
      "current_step_order": 3,
      "pdf_letter_url": "/uploads/permission_letter_REQ-842104.pdf"
    },
    "history": [
      {
        "history_id": 1,
        "step_order": 1,
        "first_name": "Suresh",
        "last_name": "Reddy",
        "role": "MENTOR",
        "action": "VERIFIED",
        "remarks": "Attendance 88%. Recommended.",
        "action_timestamp": "2026-11-04T10:15:00.000Z"
      }
    ]
  }
}
```

### `POST /api/requests/:id/action`
Executes an approval or rejection decision.
- **Access**: Bearer Token (`MENTOR`, `FACULTY`, `HOD`, `ADMIN`)
- **Request Body**:
```json
{
  "action": "APPROVED", // or "REJECTED"
  "remarks": "Verified and sanctioned."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Request action 'APPROVED' processed successfully.",
  "data": {
    "status": "FORWARDED", // or "APPROVED" (final) or "REJECTED"
    "nextRole": "HOD",
    "nextStepOrder": 3
  }
}
```

---

## 3. Administrative Endpoints (`/api/admin`)

### `GET /api/admin/stats`
Returns institutional dashboard analytics.
- **Access**: Bearer Token (`HOD`, `ADMIN`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "total_requests": 18,
    "approved_count": 14,
    "rejected_count": 1,
    "pending_count": 3
  }
}
```

### `GET /api/admin/users`
Lists all institutional accounts with department and profile metadata.
- **Access**: Bearer Token (`ADMIN` only)

### `POST /api/admin/users`
Creates a new user account with designated role and department profile.
- **Access**: Bearer Token (`ADMIN` only)

### `GET /api/admin/departments`
Lists academic departments.
- **Access**: Bearer Token (`ADMIN`, `HOD`)

### `GET /api/admin/workflows`
Returns active approval workflow matrices and sequential steps.
- **Access**: Bearer Token (`ADMIN`)

---

## 4. Notification Endpoints (`/api/notifications`)

### `GET /api/notifications`
Fetches in-app notifications for the authenticated user.
- **Access**: Bearer Token (Any Role)

### `PATCH /api/notifications/:id/read`
Marks a specific notification as read.
- **Access**: Bearer Token (Any Role)

### `PATCH /api/notifications/read-all`
Marks all user notifications as read.
- **Access**: Bearer Token (Any Role)
