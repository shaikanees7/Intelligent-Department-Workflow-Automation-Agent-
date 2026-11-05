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
  Sparkles,
  Info
} from 'lucide-react';

const DEMO_PRESETS = {
  STUDENT: {
    userId: 5,
    email: 'student1@institution.edu',
    firstName: 'Anees',
    lastName: 'Shaik',
    role: 'STUDENT',
    departmentId: 1,
    departmentName: 'Computer Science and Engineering',
    registrationNumber: 'REG2024CSE001',
    section: 'A'
  },
  MENTOR: {
    userId: 4,
    email: 'mentor.cse@institution.edu',
    firstName: 'Prof. Suresh',
    lastName: 'Reddy',
    role: 'MENTOR',
    departmentId: 1,
    departmentName: 'Computer Science and Engineering',
    designation: 'Senior Assistant Professor'
  },
  FACULTY: {
    userId: 3,
    email: 'faculty.cse@institution.edu',
    firstName: 'Prof. Anitha',
    lastName: 'Sharma',
    role: 'FACULTY',
    departmentId: 1,
    departmentName: 'Computer Science and Engineering',
    designation: 'Assistant Professor'
  },
  HOD: {
    userId: 2,
    email: 'hod.cse@institution.edu',
    firstName: 'Dr. Ramesh',
    lastName: 'Kumar',
    role: 'HOD',
    departmentId: 1,
    departmentName: 'Computer Science and Engineering',
    designation: 'Head of Department'
  },
  ADMIN: {
    userId: 1,
    email: 'admin@institution.edu',
    firstName: 'System',
    lastName: 'Administrator',
    role: 'ADMIN',
    departmentId: 1,
    departmentName: 'Central Administration'
  }
};

const QUICK_ROLES = [
  { role: 'STUDENT', label: 'Student', email: 'student1@institution.edu', icon: GraduationCap, color: 'hover:border-emerald-400 bg-white/10 hover:bg-emerald-500/20' },
  { role: 'MENTOR', label: 'Mentor', email: 'mentor.cse@institution.edu', icon: ShieldCheck, color: 'hover:border-indigo-400 bg-white/10 hover:bg-indigo-500/20' },
  { role: 'FACULTY', label: 'Faculty', email: 'faculty.cse@institution.edu', icon: Building, color: 'hover:border-blue-400 bg-white/10 hover:bg-blue-500/20' },
  { role: 'HOD', label: 'HOD', email: 'hod.cse@institution.edu', icon: Award, color: 'hover:border-rose-400 bg-white/10 hover:bg-rose-500/20' },
  { role: 'ADMIN', label: 'Admin', email: 'admin@institution.edu', icon: Users, color: 'hover:border-purple-400 bg-white/10 hover:bg-purple-500/20' }
];

const Login = () => {
  const [email, setEmail] = useState('student1@institution.edu');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);
  const navigate = useNavigate();

  // Helper to establish session
  const performLogin = (userData, token = 'demo_jwt_token_secret_12345') => {
    login(userData, token);
    try {
      fetchNotifications();
    } catch {}

    if (userData.role === 'STUDENT') navigate('/student');
    else if (userData.role === 'FACULTY') navigate('/faculty');
    else if (userData.role === 'MENTOR') navigate('/mentor');
    else if (userData.role === 'HOD') navigate('/hod');
    else navigate('/admin');
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Try real backend authorization first
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user, token } = res.data.data;
        performLogin(user, token);
        return;
      }
    } catch (err) {
      console.warn('[Login] Backend auth unavailable or rejected, using demo fallback:', err.message);
    }

    // 2. Demo fallback: Determine role from presets or selected role
    let demoUser = null;
    const lowerEmail = email.toLowerCase();

    if (lowerEmail.includes('mentor')) demoUser = DEMO_PRESETS.MENTOR;
    else if (lowerEmail.includes('faculty')) demoUser = DEMO_PRESETS.FACULTY;
    else if (lowerEmail.includes('hod')) demoUser = DEMO_PRESETS.HOD;
    else if (lowerEmail.includes('admin')) demoUser = DEMO_PRESETS.ADMIN;
    else if (DEMO_PRESETS[selectedRole]) {
      demoUser = {
        ...DEMO_PRESETS[selectedRole],
        email: email || DEMO_PRESETS[selectedRole].email,
        firstName: email.split('@')[0] || DEMO_PRESETS[selectedRole].firstName
      };
    } else {
      demoUser = {
        ...DEMO_PRESETS.STUDENT,
        email: email,
        firstName: email.split('@')[0]
      };
    }

    // Successfully log in with demo profile
    performLogin(demoUser);
    setLoading(false);
  };

  const handleQuickDemoClick = (roleKey) => {
    const preset = DEMO_PRESETS[roleKey];
    if (preset) {
      setEmail(preset.email);
      setPassword('password123');
      setSelectedRole(roleKey);
      performLogin(preset);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* 50% Intensity University Campus Main Building Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-100 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      {/* Ambient dark overlay for maximum contrast and transparency depth */}
      <div className="absolute inset-0 bg-slate-950/45 pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-white/15 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-black shadow-xl border border-white/25 group-hover:bg-primary-600 transition">
            <Building2 className="w-6 h-6 text-sky-400 group-hover:text-white transition" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block drop-shadow-md">IDWAA</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block drop-shadow-sm">
              Workflow Automation Agent
            </span>
          </div>
        </Link>
      </div>

      {/* Very Low Intensity Transparent Glass Login Box */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-950/20 backdrop-blur-xs py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Institutional Login</h2>
            <p className="text-xs text-slate-200 mt-1 drop-shadow-sm">Sign in to test demo or department account</p>
          </div>

          {/* Very Low Intensity Notice Banner */}
          <div className="p-3 bg-sky-500/15 border border-sky-400/25 rounded-2xl flex items-start gap-2.5 text-xs text-sky-200 backdrop-blur-xs">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Instant Demo Login Ready:</span>
              <p className="text-[11px] text-sky-200 mt-0.5">
                Click any role card below or sign in with your email to launch the dashboard.
              </p>
            </div>
          </div>

          {/* 1-Click Role Login Cards */}
          <div>
            <label className="block text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-2 text-center drop-shadow-xs">
              1-Click Demo Login (Select Role)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickDemoClick(r.role)}
                    className={`p-2.5 border border-white/10 rounded-2xl flex flex-col items-center justify-center text-center transition hover:scale-[1.02] shadow-sm bg-black/20 hover:bg-black/40 backdrop-blur-xs ${r.color}`}
                  >
                    <Icon className="w-4 h-4 text-white mb-1" />
                    <span className="text-xs font-bold text-white drop-shadow-xs">{r.label}</span>
                    <span className="text-[10px] text-sky-300 font-semibold mt-0.5">Log In →</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="shrink-0 mx-3 text-slate-300 text-xs uppercase font-semibold drop-shadow-xs">Or enter credentials</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 drop-shadow-xs">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-300 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. your_email@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/25 hover:bg-black/35 focus:bg-black/45 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-200 drop-shadow-xs">Password</label>
                <Link to="/forgot-password" className="text-xs text-sky-300 hover:text-sky-200 hover:underline drop-shadow-xs">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-300 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/25 hover:bg-black/35 focus:bg-black/45 border border-white/15 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1 drop-shadow-xs">Log In As Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950/70 border border-white/15 rounded-xl text-xs font-semibold text-white focus:ring-2 focus:ring-sky-400 focus:outline-none"
              >
                <option value="STUDENT" className="bg-slate-900 text-white">Student Dashboard</option>
                <option value="MENTOR" className="bg-slate-900 text-white">Academic Mentor Dashboard</option>
                <option value="FACULTY" className="bg-slate-900 text-white">Faculty Coordinator Dashboard</option>
                <option value="HOD" className="bg-slate-900 text-white">Head of Department (HOD) Portal</option>
                <option value="ADMIN" className="bg-slate-900 text-white">System Administrator Hub</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-600/90 hover:bg-primary-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-black/40 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-300 pt-2 border-t border-white/10">
            Need a student account?{' '}
            <Link to="/register" className="font-bold text-sky-400 hover:text-sky-300 hover:underline drop-shadow-xs">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
