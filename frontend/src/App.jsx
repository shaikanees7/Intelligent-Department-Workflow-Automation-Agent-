import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotFound from './pages/common/NotFound';

// Role-Based Dashboards & Pages
import StudentDashboard from './pages/student/StudentDashboard';
import NewRequest from './pages/student/NewRequest';
import MyRequests from './pages/student/MyRequests';
import TrackRequest from './pages/student/TrackRequest';

import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import HODDashboard from './pages/hod/HODDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UniversityOffices from './pages/admin/UniversityOffices';
import OfficeDashboard from './pages/office/OfficeDashboard';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public Landing & Authentication */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/new-request"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <NewRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/requests"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/track"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <TrackRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/track/:id"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <TrackRequest />
                </ProtectedRoute>
              }
            />

            {/* Faculty Coordinator Routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/*"
              element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />

            {/* Academic Mentor Routes */}
            <Route
              path="/mentor"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mentor/*"
              element={
                <ProtectedRoute allowedRoles={['MENTOR']}>
                  <MentorDashboard />
                </ProtectedRoute>
              }
            />

            {/* HOD Department Routes */}
            <Route
              path="/hod"
              element={
                <ProtectedRoute allowedRoles={['HOD']}>
                  <HODDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod/*"
              element={
                <ProtectedRoute allowedRoles={['HOD']}>
                  <HODDashboard />
                </ProtectedRoute>
              }
            />

            {/* University Office Protected Routes */}
            <Route
              path="/office"
              element={
                <ProtectedRoute allowedRoles={['OFFICE_ADMIN', 'ADMIN']}>
                  <OfficeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/office/:id"
              element={
                <ProtectedRoute allowedRoles={['OFFICE_ADMIN', 'ADMIN']}>
                  <OfficeDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Institutional Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/offices"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UniversityOffices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
