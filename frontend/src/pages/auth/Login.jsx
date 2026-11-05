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
  AlertCircle
} from 'lucide-react';

const QUICK_ROLES = [
  { role: 'STUDENT', label: 'Student', email: 'student1@institution.edu', icon: GraduationCap, color: 'hover:border-emerald-400' },
  { role: 'MENTOR', label: 'Mentor', email: 'mentor.cse@institution.edu', icon: ShieldCheck, color: 'hover:border-indigo-400' },
  { role: 'FACULTY', label: 'Faculty', email: 'faculty.cse@institution.edu', icon: Building, color: 'hover:border-blue-400' },
  { role: 'HOD', label: 'HOD', email: 'hod.cse@institution.edu', icon: Award, color: 'hover:border-rose-400' },
  { role: 'ADMIN', label: 'Admin', email: 'admin@institution.edu', icon: Users, color: 'hover:border-purple-400' }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user, token } = res.data.data;
        login(user, token);
        fetchNotifications();

        if (user.role === 'STUDENT') navigate('/student');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else if (user.role === 'MENTOR') navigate('/mentor');
        else if (user.role === 'HOD') navigate('/hod');
        else navigate('/admin');
      } else {
        setError(res.data?.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to authorization server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: roleEmail, password: 'password123' });
      if (res.data?.success) {
        const { user, token } = res.data.data;
        login(user, token);
        fetchNotifications();

        if (user.role === 'STUDENT') navigate('/student');
        else if (user.role === 'FACULTY') navigate('/faculty');
        else if (user.role === 'MENTOR') navigate('/mentor');
        else if (user.role === 'HOD') navigate('/hod');
        else navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed demo authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shadow-lg group-hover:bg-primary-700 transition">
            <Building2 className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block">IDWAA</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Workflow Automation Agent
            </span>
          </div>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl border border-slate-200 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Login</h2>
            <p className="text-xs text-slate-500 mt-1">Sign in with your department account</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="student1@institution.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              One-Click Role Demo Logins
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickDemo(r.email)}
                    className={`p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-center transition ${r.color}`}
                  >
                    <Icon className="w-4 h-4 text-slate-700 mb-1" />
                    <span className="text-[11px] font-bold text-slate-800">{r.label}</span>
                    <span className="text-[9px] text-slate-400">password123</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center text-xs text-slate-600 pt-2">
            Are you a student without an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
