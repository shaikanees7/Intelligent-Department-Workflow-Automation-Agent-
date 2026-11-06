import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import idwaaLogo from '../../assets/images/idwaa-logo.jpg';
import {
  Bell,
  LogOut,
  ChevronDown,
  ArrowLeftRight,
  Users,
  CheckCheck,
  Shield,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'STUDENT', email: 'student1@institution.edu', label: 'Student (Anees Shaik)', desc: 'Submit requests & track live gate pass' },
  { role: 'MENTOR', email: 'mentor.cse@institution.edu', label: 'Mentor (Prof. Suresh Reddy)', desc: 'Academic attendance & authenticity verify' },
  { role: 'FACULTY', email: 'faculty.cse@institution.edu', label: 'Faculty Coordinator (Prof. Anitha)', desc: 'Departmental curriculum & OD review' },
  { role: 'HOD', email: 'hod.cse@institution.edu', label: 'Head of Dept (Dr. Ramesh Kumar)', desc: 'Institutional authority & final sanction' },
  { role: 'OFFICE_ADMIN', email: 'office.exam@institution.edu', label: 'Office Admin (Exam Cell)', desc: 'Administrative office processing desk' },
  { role: 'ADMIN', email: 'admin@institution.edu', label: 'System Administrator', desc: 'University-wide workflows & user control' },
];

const Navbar = () => {
  const { user, login, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useContext(NotificationContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const roleRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target)) {
        setShowRoleSwitcher(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickSwitch = async (email, roleKey) => {
    try {
      const res = await api.post('/auth/login', { email, password: 'password123' });
      if (res.data?.success) {
        const { user: newUser, token } = res.data.data;
        login(newUser, token);
        setShowRoleSwitcher(false);
        try { fetchNotifications(); } catch {}
        redirectToRole(newUser.role);
        return;
      }
    } catch (err) {
      console.warn('[QuickSwitch] Falling back to demo switch:', err.message);
    }

    // Demo Fallback
    const demoProfiles = {
      STUDENT: { userId: 5, email: 'student1@institution.edu', first_name: 'Anees', last_name: 'Shaik', role: 'STUDENT', department_id: 1, department_name: 'Computer Science and Engineering', registration_number: 'REG2024CSE001', section: 'A' },
      OFFICE_ADMIN: { userId: 10, email: 'office.exam@institution.edu', first_name: 'Exam Cell', last_name: 'Admin', role: 'OFFICE_ADMIN', office_id: 1, department_id: 1, department_name: 'Examination Cell' },
      MENTOR: { userId: 4, email: 'mentor.cse@institution.edu', first_name: 'Prof. Suresh', last_name: 'Reddy', role: 'MENTOR', department_id: 1, department_name: 'Computer Science and Engineering', designation: 'Senior Assistant Professor' },
      FACULTY: { userId: 3, email: 'faculty.cse@institution.edu', first_name: 'Prof. Anitha', last_name: 'Sharma', role: 'FACULTY', department_id: 1, department_name: 'Computer Science and Engineering', designation: 'Assistant Professor' },
      HOD: { userId: 2, email: 'hod.cse@institution.edu', first_name: 'Dr. Ramesh', last_name: 'Kumar', role: 'HOD', department_id: 1, department_name: 'Computer Science and Engineering', designation: 'Head of Department' },
      ADMIN: { userId: 1, email: 'admin@institution.edu', first_name: 'System', last_name: 'Admin', role: 'ADMIN', department_id: 1, department_name: 'Central Administration' }
    };

    const targetUser = demoProfiles[roleKey] || demoProfiles.STUDENT;
    login(targetUser, 'demo_jwt_token_12345');
    setShowRoleSwitcher(false);
    redirectToRole(targetUser.role);
  };

  const redirectToRole = (role) => {
    if (role === 'STUDENT') navigate('/student');
    else if (role === 'OFFICE_ADMIN') navigate('/office');
    else if (role === 'FACULTY') navigate('/faculty');
    else if (role === 'MENTOR') navigate('/mentor');
    else if (role === 'HOD') navigate('/hod');
    else navigate('/admin');
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'STUDENT': return '/student';
      case 'OFFICE_ADMIN': return '/office';
      case 'FACULTY': return '/faculty';
      case 'MENTOR': return '/mentor';
      case 'HOD': return '/hod';
      case 'ADMIN': return '/admin';
      default: return '/student';
    }
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'STUDENT': return 'Student';
      case 'MENTOR': return 'Academic Mentor';
      case 'FACULTY': return 'Faculty Coordinator';
      case 'HOD': return 'Head of Department';
      case 'OFFICE_ADMIN': return 'Office Administrator';
      case 'ADMIN': return 'System Administrator';
      default: return role || 'User';
    }
  };

  return (
    <header className="bg-[#FAF5F7]/85 backdrop-blur-xl px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-[#EAE0E8]/90 transition-all duration-200">
      {/* Brand Identity: IDWAA Logo & Title */}
      <div className="flex items-center space-x-3.5">
        <Link to={getDashboardRoute()} className="flex items-center space-x-3 group">
          <div className="relative overflow-hidden rounded-2xl border border-[#EAE0E8] shadow-xs bg-white p-1 group-hover:border-[#B95BD5] group-hover:shadow-[0_4px_16px_rgba(185,91,213,0.25)] transition-all duration-200 flex items-center justify-center">
            <img
              src={idwaaLogo}
              alt="IDWAA Logo"
              className="h-9 sm:h-10 w-auto max-w-[90px] sm:max-w-[105px] object-contain rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xl sm:text-2xl font-black text-[#261B50] tracking-tight leading-none group-hover:text-[#B95BD5] transition-colors">
              IDWAA
            </span>
            <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F4EBF7] text-[#8E32A8] border border-[#E8D1ED] tracking-wide">
              Workflow Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Right Controls: Role Switcher & User Profile Widget */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Role Switcher Pill */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-white hover:bg-[#FAF5FB] text-[#261B50] font-bold text-xs rounded-full border border-[#EAE0E8] shadow-xs hover:border-[#B95BD5] hover:shadow-[0_4px_14px_rgba(185,91,213,0.18)] transition-all cursor-pointer"
            title="Instant Role Switching for Testing"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-[#B95BD5]" />
            <span className="font-bold text-[#261B50] hidden sm:inline">Role Switcher</span>
            <ChevronDown className="w-3 h-3 text-[#7C7390]" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-3xl shadow-2xl border border-[#EAE0E8] p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-[#F0E8EE] flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-[#261B50] uppercase tracking-wider">
                    Role Switcher (Live Demo)
                  </div>
                  <div className="text-[10px] text-[#7C7390]">
                    Select any role to test workflow permissions
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#B95BD5]" />
              </div>

              <div className="divide-y divide-[#F0E8EE] max-h-84 overflow-y-auto pt-1">
                {DEMO_ACCOUNTS.map((acc) => {
                  const isCurrent = user?.role === acc.role;
                  return (
                    <button
                      key={acc.role + acc.email}
                      onClick={() => handleQuickSwitch(acc.email, acc.role)}
                      className={`w-full text-left p-2.5 rounded-2xl flex items-center justify-between transition group ${
                        isCurrent ? 'bg-[#F7EDFA] border border-[#E8D1ED]' : 'hover:bg-[#FAF5F7]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-[#261B50] group-hover:text-[#B95BD5] transition-colors">
                          {acc.label}
                        </div>
                        <div className="text-[10px] text-[#7C7390] leading-tight">
                          {acc.desc}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCurrent
                          ? 'bg-[#B95BD5] text-white'
                          : 'bg-[#F4EBF7] text-[#8E32A8]'
                      }`}>
                        {acc.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative w-9 h-9 bg-white hover:bg-[#FAF5FB] rounded-full border border-[#EAE0E8] flex items-center justify-center text-[#261B50] hover:text-[#B95BD5] hover:border-[#B95BD5] shadow-xs transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#B95BD5] text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#EAE0E8] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="pb-3 border-b border-[#F0E8EE] flex items-center justify-between">
                <div>
                  <h4 className="font-black text-[#261B50] text-sm">Notifications</h4>
                  <p className="text-[11px] text-[#7C7390]">{unreadCount} unread automated updates</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-bold text-[#B95BD5] hover:text-[#8E32A8] transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#F0E8EE] pt-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#7C7390]">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      onClick={() => !n.is_read && markAsRead(n.notification_id)}
                      className={`p-3 text-xs transition rounded-2xl cursor-pointer ${
                        !n.is_read ? 'bg-[#F7EDFA]/60 hover:bg-[#F7EDFA]' : 'hover:bg-[#FAF5F7]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-[#261B50]">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#B95BD5] shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[#4F4665] mt-1 text-[11px] leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-[#7C7390] mt-1.5 font-medium">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Chip with Dropdown */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 px-3 py-1.5 bg-white hover:bg-[#FAF5FB] rounded-full border border-[#EAE0E8] shadow-xs hover:border-[#B95BD5] hover:shadow-[0_4px_14px_rgba(185,91,213,0.18)] transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#261B50] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.first_name ? user.first_name[0] : 'U'}
              </div>
              <div className="hidden md:block text-left pr-1">
                <div className="text-xs font-bold text-[#261B50] leading-none">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-[#8E32A8] font-bold mt-0.5">
                  {formatRoleLabel(user.role)}
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-[#7C7390]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-3xl shadow-2xl border border-[#EAE0E8] py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-[#F0E8EE]">
                  <p className="text-xs font-black text-[#261B50]">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-[11px] text-[#7C7390] truncate">{user.email}</p>
                  {user.registration_number && (
                    <p className="text-[10px] font-mono text-[#8E32A8] font-bold mt-0.5">
                      Reg: {user.registration_number}
                    </p>
                  )}
                </div>

                <div className="p-1 space-y-0.5">
                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#261B50] hover:bg-[#F7EDFA] hover:text-[#B95BD5] rounded-xl font-bold transition"
                  >
                    <Layers className="w-4 h-4 text-[#7C7390]" />
                    Dashboard Overview
                  </Link>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#E04F69] hover:bg-[#FDEEF1] rounded-xl font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
