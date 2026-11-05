import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  CheckCheck,
  Building2,
  ExternalLink,
  ChevronDown,
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
  const notifRef = useRef(null);
  const roleRef = useRef(null);
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
      STUDENT: { userId: 5, email: 'student1@institution.edu', first_name: 'Anees', last_name: 'Shaik', role: 'STUDENT', department_id: 1, department_name: 'Computer Science', registration_number: 'REG2024CSE001', section: 'A' },
      OFFICE_ADMIN: { userId: 10, email: 'office.exam@institution.edu', first_name: 'Exam Cell', last_name: 'Admin', role: 'OFFICE_ADMIN', office_id: 1, department_id: 1, department_name: 'Examination Cell' },
      MENTOR: { userId: 4, email: 'mentor.cse@institution.edu', first_name: 'Prof. Suresh', last_name: 'Reddy', role: 'MENTOR', department_id: 1, department_name: 'Computer Science', designation: 'Senior Assistant Professor' },
      FACULTY: { userId: 3, email: 'faculty.cse@institution.edu', first_name: 'Prof. Anitha', last_name: 'Sharma', role: 'FACULTY', department_id: 1, department_name: 'Computer Science', designation: 'Assistant Professor' },
      HOD: { userId: 2, email: 'hod.cse@institution.edu', first_name: 'Dr. Ramesh', last_name: 'Kumar', role: 'HOD', department_id: 1, department_name: 'Computer Science', designation: 'Head of Department' },
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

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'OFFICE_ADMIN': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'HOD': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'FACULTY': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'MENTOR': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'STUDENT': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-extrabold shadow-sm group-hover:bg-primary-700 transition">
            <Building2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="text-base font-bold text-slate-900 tracking-tight leading-none group-hover:text-primary-700 transition">
              IDWAA Portal
            </div>
            <div className="text-[11px] font-medium text-slate-500 tracking-wide">
              Intelligent Department Workflow Automation
            </div>
          </div>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Role Switcher */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition"
            title="Switch role for testing"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Role Switcher</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Switching (Demo)
              </div>
              <div className="divide-y divide-slate-100">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickSwitch(acc.email, acc.role)}
                    className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition ${
                      user?.role === acc.role ? 'bg-primary-50 text-primary-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{acc.label}</div>
                      <div className="text-[10px] text-slate-400">{acc.email}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeColor(acc.role)}`}>
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
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Notifications</h4>
                  <p className="text-[11px] text-slate-500">{unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
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
                        !n.is_read ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1" />
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

        {/* User Identity Chip */}
        {user && (
          <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user.first_name ? user.first_name[0] : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">
                  {user.first_name} {user.last_name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  {user.department_name && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      • {user.department_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
