import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Building,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2,
  X
} from 'lucide-react';

const QUICK_ROLES = [
  { role: 'STUDENT', label: 'Student', email: 'student1@institution.edu', icon: GraduationCap },
  { role: 'MENTOR', label: 'Mentor', email: 'mentor.cse@institution.edu', icon: ShieldCheck },
  { role: 'FACULTY', label: 'Faculty', email: 'faculty.cse@institution.edu', icon: Building },
  { role: 'HOD', label: 'HOD', email: 'hod.cse@institution.edu', icon: Award },
  { role: 'OFFICE_ADMIN', label: 'Office Staff', email: 'office.exam@institution.edu', icon: Building2 },
  { role: 'ADMIN', label: 'Admin', email: 'admin@institution.edu', icon: Users }
];

const Login = () => {
  const [email, setEmail] = useState('student1@institution.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // First Login Mandatory Password Change Modal State
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  // Route dispatcher by role
  const navigateByRole = (role) => {
    if (role === 'STUDENT') navigate('/student');
    else if (role === 'FACULTY') navigate('/faculty');
    else if (role === 'MENTOR') navigate('/mentor');
    else if (role === 'HOD') navigate('/hod');
    else if (role === 'OFFICE_ADMIN' || role === 'OFFICE_STAFF') navigate('/office');
    else navigate('/admin');
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Authenticate strictly with real database backend
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password
      });

      if (res.data?.success && res.data?.data) {
        const { user, token, must_change_password } = res.data.data;

        // If staff account has temporary password, enforce password change
        if (must_change_password || user?.must_change_password) {
          setPendingAuthData({ user, token, temporaryPassword: password });
          setShowPasswordChangeModal(true);
          setLoading(false);
          return;
        }

        // Establish real session
        login(user, token);
        try {
          fetchNotifications();
        } catch {}

        navigateByRole(user.role);
      } else {
        setError(res.data?.message || 'Invalid institutional credentials.');
      }
    } catch (err) {
      console.error('[Login] Authentication error:', err);
      setError(
        err.response?.data?.message ||
        'Authentication failed. Please verify your institutional email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setPasswordChangeError('');

    if (newPassword.length < 8) {
      setPasswordChangeError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      // Change password with token
      const res = await api.post(
        '/auth/change-password',
        {
          current_password: pendingAuthData.temporaryPassword,
          new_password: newPassword
        },
        {
          headers: { Authorization: `Bearer ${pendingAuthData.token}` }
        }
      );

      if (res.data?.success) {
        setShowPasswordChangeModal(false);
        const updatedUser = { ...pendingAuthData.user, must_change_password: false };
        login(updatedUser, pendingAuthData.token);
        try {
          fetchNotifications();
        } catch {}
        navigateByRole(updatedUser.role);
      } else {
        setPasswordChangeError(res.data?.message || 'Password update failed.');
      }
    } catch (err) {
      setPasswordChangeError(err.response?.data?.message || 'Failed to update password. Try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleQuickRoleSelect = (quickEmail) => {
    setEmail(quickEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* 50% Intensity University Campus Main Building Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-100 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/35 pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-black/20 backdrop-blur-sm text-white rounded-2xl flex items-center justify-center font-black shadow-xl border border-white/20 group-hover:bg-[#B95BD5] transition">
            <Building2 className="w-6 h-6 text-[#D8B8E8] group-hover:text-white transition" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block drop-shadow-xs">IDWAA</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              University Permission Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-950/25 backdrop-blur-xs py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Institutional Login</h2>
            <p className="text-xs text-slate-200 mt-1 drop-shadow-sm">
              Sign in with your verified institutional account credentials
            </p>
          </div>

          {/* Quick Role Fill Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
              Quick Role Credentials
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {QUICK_ROLES.map((r) => {
                const IconComponent = r.icon;
                const isSelected = email === r.email;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r.email)}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#B95BD5]/30 border-[#B95BD5] text-white shadow-xs'
                        : 'bg-white/10 border-white/15 text-slate-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0 text-[#D8B8E8]" />
                    <span className="text-[11px] font-bold truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Official Institutional Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@institution.edu"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B95BD5] focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-200">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-[#D8B8E8] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-[#B95BD5] focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold rounded-full text-xs shadow-md transition flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            Student without an account?{' '}
            <Link to="/register" className="font-bold text-[#D8B8E8] hover:underline">
              Register as Student
            </Link>
          </div>
        </div>
      </div>

      {/* Mandatory First-Login Password Change Modal */}
      {showPasswordChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-[#261B50] shadow-2xl border border-[#EAE0E8]">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF6EB] text-[#E58B24] border border-[#FCE1C2] flex items-center justify-center shrink-0">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FEF6EB] text-[#E58B24]">
                  First Login Security Requirement
                </span>
                <h3 className="text-xl font-black text-[#261B50] mt-1">Update Temporary Password</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  Your administrator provided a temporary password. You must set a personal secure password before accessing your dashboard.
                </p>
              </div>
            </div>

            {passwordChangeError && (
              <div className="p-3 bg-[#FDEEF1] border border-[#F9CAD3] rounded-xl text-xs font-bold text-[#E04F69]">
                {passwordChangeError}
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">New Secure Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 bg-[#FAF5F7] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-[#FAF5F7] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordChangeModal(false)}
                  className="saas-pill-btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="saas-pill-btn-primary text-xs px-5 py-2 cursor-pointer flex items-center gap-1.5"
                >
                  {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Save Password & Continue</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
