import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* 50% Intensity University Campus Main Building Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-100 pointer-events-none"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/20 group-hover:bg-primary-600 transition">
            <Building2 className="w-6 h-6 text-sky-400 group-hover:text-white transition" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block drop-shadow-xs">IDWAA</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Password Recovery
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-900/60 backdrop-blur-xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/20 space-y-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">Reset Credentials</h2>
            <p className="text-xs text-slate-300 mt-1">
              Enter your institutional email to receive an official recovery link
            </p>
          </div>

          {sent ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a recovery link has been dispatched
                via institutional email routing.
              </p>
              <Link
                to="/login"
                className="inline-block text-xs font-bold text-primary-700 hover:underline pt-2"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="student1@institution.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Send Recovery Instructions
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

