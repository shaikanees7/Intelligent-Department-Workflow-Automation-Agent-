import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import DukeRibbon from '../../components/duke/DukeRibbon';
import DukeButton from '../../components/duke/DukeButton';

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

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Complete form validation passed
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen bg-black flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden text-slate-100">
      {/* Background Campus Image with Cinematic Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 scale-100"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black pointer-events-none" />

      {/* Duke Hanging Blue Ribbon in Top-Right Corner */}
      <div className="absolute top-0 right-6 sm:right-16 z-30">
        <DukeRibbon position="top" label="DUKE" year="1838" />
      </div>

      {/* University Seal & Header */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <Link to="/" className="inline-flex flex-col items-center group">
          <div className="w-14 h-14 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center p-2.5 shadow-2xl group-hover:border-blue-400 group-hover:scale-105 transition-all">
            <Award className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <span className="font-serif text-2xl font-bold text-white tracking-wider mt-3 block">
            Duke University
          </span>
          <span className="text-[10px] text-blue-400 font-cinzel tracking-[0.3em] uppercase block">
            The Character of Success • Student Enrollment Portal
          </span>
        </Link>
      </div>

      {/* Main Glass Form Card */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-zinc-950/85 backdrop-blur-2xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create Student Account
            </h2>
            <p className="text-xs text-slate-400">
              Enroll digitally into your academic department workflow network
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Registration Details Saved</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Your profile has been queued for verification. For demo testing, default pre-seeded
                student accounts are ready to sign in immediately.
              </p>
              <div className="pt-2">
                <DukeButton to="/login" size="md">
                  Proceed to Login
                </DukeButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Anees"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Shaik"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration / Roll No *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    placeholder="REG2024CSE005"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institutional Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="student@institution.edu"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  >
                    <option value="1" className="bg-zinc-900 text-white">Computer Science (CSE)</option>
                    <option value="2" className="bg-zinc-900 text-white">Electronics (ECE)</option>
                    <option value="3" className="bg-zinc-900 text-white">Mechanical (MECH)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Section *</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    placeholder="A"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s} className="bg-zinc-900 text-white">
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Batch Year</label>
                  <input
                    type="text"
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleChange}
                    placeholder="2022-2026"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mobile Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
              </div>

              <div className="pt-3">
                <DukeButton
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full py-3.5"
                >
                  Complete Registration
                </DukeButton>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            Already enrolled?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 hover:underline">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
