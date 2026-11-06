import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  Lock,
  Mail,
  User,
  GraduationCap,
  Hash,
  Layers,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    department: '1',
    section: 'A',
    semester: '6',
    batchYear: '2022-2026',
    password: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!formData.registrationNumber.trim()) {
      setError('University Registration Number is required.');
      return;
    }

    try {
      setSubmitting(true);
      // Strictly submits role: 'STUDENT'
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        departmentId: parseInt(formData.department),
        section: formData.section.trim().toUpperCase(),
        semester: parseInt(formData.semester),
        batchYear: formData.batchYear.trim(),
        role: 'STUDENT' // Public registration strictly student
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success) {
        setSuccessData(res.data.data);
        setSubmitted(true);
        // Automatically establish session if token returned
        if (res.data.data?.token && res.data.data?.user) {
          login(res.data.data.user, res.data.data.token);
        }
      } else {
        setError(res.data?.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      setError(
        err.response?.data?.message ||
        'Registration failed. Please verify that your email and registration number are not already registered.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* 50% Intensity University Campus Main Building Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-100 pointer-events-none"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/20 group-hover:bg-primary-600 transition">
            <Building2 className="w-6 h-6 text-sky-400 group-hover:text-white transition" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block drop-shadow-xs">IDWAA</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Student Registration Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-slate-950/20 backdrop-blur-xs py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Create Student Account</h2>
            <p className="text-xs text-slate-200 mt-1 drop-shadow-sm">
              Official student self-enrollment into university permission workflow network
            </p>
          </div>

          {/* Security Banner: Public registration rule notification */}
          <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Notice:</strong> Only students may self-register. Faculty, Mentor, HOD, and University Office accounts are provisioned exclusively by administrators.
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-200">Account Registered Successfully!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Welcome, <strong>{formData.firstName} {formData.lastName}</strong>! Your student account ({formData.registrationNumber}) has been provisioned and automatically mapped to your department and academic mentor in the database.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="inline-flex items-center gap-2 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition cursor-pointer"
                >
                  Proceed to Student Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Anees"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Shaik"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Registration / Roll No *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    placeholder="241FA18363 / REG2024CSE001"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white font-mono placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="student@institution.edu"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1">Computer Science (CSE)</option>
                    <option value="2">Electronics (ECE)</option>
                    <option value="3">Mechanical (MECH)</option>
                    <option value="4">Information Tech (IT)</option>
                    <option value="5">Civil Engineering (CIVIL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Section *</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    placeholder="A / B / C / D"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white font-mono placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Batch Year</label>
                  <input
                    type="text"
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleChange}
                    placeholder="2022-2026"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold rounded-full text-xs shadow-md transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registering Account in Database...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2">
            Already enrolled?{' '}
            <Link to="/login" className="font-bold text-[#B95BD5] hover:underline">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
