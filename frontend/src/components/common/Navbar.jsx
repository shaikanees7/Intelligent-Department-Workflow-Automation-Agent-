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
  Layers
} from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'STUDENT', email: 'student1@institution.edu', label: 'Student (Anees Shaik)' },
  { role: 'OFFICE_ADMIN', email: 'office.exam@institution.edu', label: 'Exam Cell Office Admin' },
  { role: 'OFFICE_ADMIN', email: 'office.hostel@institution.edu', label: 'Hostel Office Admin' },
  { role: 'MENTOR', email: 'mentor.cse@institution.edu', label: 'Academic Mentor (Prof. Suresh Reddy)' },
  { role: 'FACULTY', email: 'faculty.cse@institution.edu', label: 'Faculty Coordinator (Prof. Anitha Sharma)' },
  { role: 'HOD', email: 'hod.cse@institution.edu', label: 'Head of Dept (Dr. Ramesh Kumar)' },
  { role: 'ADMIN', email: 'admin@institution.edu', label: 'System Administrator' },
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
        if (newUser.role === 'STUDENT') navigate('/student');
        else if (newUser.role === 'OFFICE_ADMIN') navigate('/office');
        else if (newUser.role === 'FACULTY') navigate('/faculty');
        else if (newUser.role === 'MENTOR') navigate('/mentor');
        else if (newUser.role === 'HOD') navigate('/hod');
        else navigate('/admin');
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
    if (targetUser.role === 'STUDENT') navigate('/student');
    else if (targetUser.role === 'OFFICE_ADMIN') navigate('/office');
    else if (targetUser.role === 'FACULTY') navigate('/faculty');
    else if (targetUser.role === 'MENTOR') navigate('/mentor');
    else if (targetUser.role === 'HOD') navigate('/hod');
    else navigate('/admin');
  };

  const formatRoleLabel = (role) => {
    switch (role) {
      case 'STUDENT': return 'Student';
      case 'MENTOR': return 'Academic Mentor';
      case 'FACULTY': return 'Faculty Coordinator';
      case 'HOD': return 'Head of Department';
      case 'OFFICE_ADMIN': return 'Office Admin';
      case 'ADMIN': return 'Administrator';
      default: return role;
    }
  };

  return (
    <header className="bg-[#F3F5F7]/95 backdrop-blur-md px-6 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-200/80">
      {/* Brand: IDWAA Logo & State College Identity */}
      <div className="flex items-center space-x-3.5">
        <Link
          to={
            user?.role === 'STUDENT'
              ? '/student'
              : user?.role === 'OFFICE_ADMIN'
              ? '/office'
              : user?.role === 'FACULTY'
              ? '/faculty'
              : user?.role === 'MENTOR'
              ? '/mentor'
              : user?.role === 'HOD'
              ? '/hod'
              : '/admin'
          }
          className="flex items-center space-x-3 group"
        >
          <div className="relative overflow-hidden rounded-xl border border-slate-200/90 shadow-xs bg-white/90 p-1 group-hover:border-teal-500 group-hover:shadow-sm transition-all duration-200 flex items-center justify-center">
            <img
              src={idwaaLogo}
              alt="IDWAA - State College Workflow Portal Logo"
              className="h-10 sm:h-11 w-auto max-w-[90px] sm:max-w-[110px] object-contain rounded-lg"
            />
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-wider leading-none group-hover:text-teal-700 transition">
            IDWAA
          </span>
        </Link>
      </div>

      {/* Right Controls: Role Switcher & User Profile Widget */}
      <div className="flex items-center space-x-3.5">
        {/* Role Switcher Pill (Matching Reference Image) */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition select-none cursor-pointer"
            title="Instant Role Switching for Testing"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-800">Role Switcher</span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Switching (Demo)
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickSwitch(acc.email, acc.role)}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition ${
                      user?.role === acc.role ? 'bg-teal-50 text-teal-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.email}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {acc.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                  <p className="text-[11px] text-slate-500">{unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      onClick={() => !n.is_read && markAsRead(n.notification_id)}
                      className={`p-3.5 text-xs transition cursor-pointer hover:bg-slate-50 ${
                        !n.is_read ? 'bg-teal-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      <div className="text-[10px] text-slate-400 mt-1.5">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Widget (Matching Reference Image) */}
        {user && (
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 flex items-center space-x-2.5 shadow-xs hover:shadow-sm hover:border-slate-300 transition cursor-pointer select-none"
            >
              <div className="w-7 h-7 rounded-full bg-[#5A646E] text-white flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                {user.first_name ? user.first_name[0] : 'A'}
              </div>
              <div className="text-left pr-1">
                <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                  <span>{user.first_name || 'Anees'} {user.last_name || 'Shaik'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <span>{formatRoleLabel(user.role)}</span>
                  <Users className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  {user.registration_number && (
                    <p className="text-[10px] font-mono text-teal-700 mt-0.5">Reg: {user.registration_number}</p>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    to={user.role === 'STUDENT' ? '/student' : '/office'}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Dashboard Overview
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
