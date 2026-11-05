import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import DukeRibbon from '../../components/duke/DukeRibbon';
import DukeButton from '../../components/duke/DukeButton';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
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
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex flex-col items-center group">
          <div className="w-14 h-14 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center p-2.5 shadow-2xl group-hover:border-blue-400 group-hover:scale-105 transition-all">
            <Award className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
          </div>
          <span className="font-serif text-2xl font-bold text-white tracking-wider mt-3 block">
            Duke University
          </span>
          <span className="text-[10px] text-blue-400 font-cinzel tracking-[0.3em] uppercase block">
            The Character of Success • Password Recovery
          </span>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-zinc-950/85 backdrop-blur-2xl py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Reset Credentials
            </h2>
            <p className="text-xs text-slate-400">
              Enter your institutional email to receive an official recovery link
            </p>
          </div>

          {sent ? (
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, a recovery link has been dispatched
                via institutional email routing.
              </p>
              <div className="pt-2">
                <DukeButton to="/login" size="sm">
                  Return to Login
                </DukeButton>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="student1@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <DukeButton
                  type="submit"
                  size="md"
                  variant="primary"
                  className="w-full py-3.5"
                >
                  Send Recovery Link
                </DukeButton>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10">
            <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
