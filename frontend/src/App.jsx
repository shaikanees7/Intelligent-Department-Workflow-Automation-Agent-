import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TrackRequest from './pages/student/TrackRequest';
import NotFound from './pages/common/NotFound';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Protected Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/track/:id" element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <TrackRequest />
              </ProtectedRoute>
            } />

            {/* Faculty Protected Routes */}
            <Route path="/faculty" element={
              <ProtectedRoute allowedRoles={['FACULTY']}>
                <FacultyDashboard />
              </ProtectedRoute>
            } />

            {/* Mentor Protected Routes */}
            <Route path="/mentor" element={
              <ProtectedRoute allowedRoles={['MENTOR']}>
                <MentorDashboard />
              </ProtectedRoute>
            } />

            {/* Admin & HOD Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'HOD']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
