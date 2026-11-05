import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Activity,
  Sparkles,
  Upload,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Hash,
  Phone,
  FileText,
  Calendar,
  ChevronRight
} from 'lucide-react';
import DukeButton from '../../components/duke/DukeButton';

const NewRequest = () => {
  const { user } = useContext(AuthContext);

  const [registrationNumber, setRegistrationNumber] = useState(
    user?.registration_number || user?.registrationNumber || ''
  );
  const [mobileNumber, setMobileNumber] = useState(
    user?.phone || ''
  );
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const navigate = useNavigate();

  // Sync if user profile loads asynchronously
  useEffect(() => {
    if (user) {
      if (!registrationNumber && (user.registration_number || user.registrationNumber)) {
        setRegistrationNumber(user.registration_number || user.registrationNumber);
      }
      if (!mobileNumber && user.phone) {
        setMobileNumber(user.phone);
      }
    }
  }, [user]);

  // Check priority based on start date
  useEffect(() => {
    if (startDate) {
      const today = new Date();
      const target = new Date(startDate);
      const diffTime = target - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setIsUrgent(diffDays <= 2);
    } else {
      setIsUrgent(false);
    }
  }, [startDate]);

  const handleReset = () => {
    setSubject('');
    setReason('');
    setStartDate('');
    setEndDate('');
    setFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!registrationNumber.trim()) {
      setError('Registration Number is required.');
      return;
    }

    if (!mobileNumber.trim()) {
      setError('Mobile Number is required.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('request_type', 'OD');
      formData.append('registration_number', registrationNumber.trim());
      formData.append('mobile_number', mobileNumber.trim());
      formData.append('phone', mobileNumber.trim());

      const fullReason = `[Reg No: ${registrationNumber.trim()}] [Phone: ${mobileNumber.trim()}] [Subject: ${subject.trim()}] ${reason.trim()}`;

      formData.append('reason', fullReason);
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);

      if (file) {
        formData.append('supporting_document', file);
      }

      const res = await api.post('/requests', formData);
      if (res.data?.success) {
        setSuccessData(res.data.data);
      } else {
        setError(res.data?.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while submitting application.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Submit Permission Application
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Fill in your request details. The University AI Agent will automatically classify and route your application to the responsible office.
              </p>
            </div>
            <Link
              to="/student/requests"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
            >
              View Application History →
            </Link>
          </div>

          {successData ? (
            <div className="bg-zinc-950/85 backdrop-blur-xl rounded-3xl border border-emerald-500/30 p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Application Submitted Successfully!</h2>
              
              <div className="p-5 bg-black/60 border border-white/10 rounded-2xl inline-block max-w-md w-full shadow-inner">
                <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Official Reference Code
                </div>
                <div className="text-2xl font-mono font-bold text-blue-400 mt-1 tracking-wider">
                  {successData.requestCode || successData.request_code}
                </div>
              </div>

              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your application has been received and analyzed by our AI Routing Agent. Verification workflows and office notifications have been dispatched.
              </p>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <DukeButton
                  to={`/student/track/${successData.requestId || successData.request_id}`}
                  size="md"
                  icon={Activity}
                >
                  Track Live Workflow Progress
                </DukeButton>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    handleReset();
                  }}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 rounded-full text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/85 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6">
              {/* AI Guidance Card */}
              <div className="flex items-start gap-3.5 p-4 bg-blue-950/30 border border-blue-500/30 rounded-2xl">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 mt-0.5 shadow-md shadow-blue-600/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <h3 className="font-serif text-sm font-bold text-white">Intelligent AI Classification & Routing</h3>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    You don't need to choose an administrative category. Simply provide your registration number, contact phone, and describe your purpose.
                    Our AI Routing Agent evaluates your application and assigns it directly to the relevant university office.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Urgency Detection Alert */}
              {isUrgent && (
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex items-start gap-3 text-amber-200 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-300">Intelligent Rule: High Urgency Flagged!</span>
                    <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                      Your event begins within 48 hours. This request will be highlighted in red for your mentor and faculty coordinator for expedited approval.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Verification: Registration Number & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-blue-400" />
                      Registration Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                      placeholder="e.g. 21BCE1024 / 241FA18363"
                      className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-400" />
                      Mobile Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                    />
                  </div>
                </div>

                {/* Subject / Purpose Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Request Subject / Purpose Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Smart India Hackathon / Medical Leave / Supplementary Exam Reschedule / Hostel Outing"
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
                  />
                </div>

                {/* Duration Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      From Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      To Date <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Detailed Justification */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Detailed Reason / Justification <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Provide a detailed explanation for your request, including any relevant course, exam, event, or personal details for the AI agent to evaluate..."
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-white/15 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition leading-relaxed"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Supporting Document (Optional: Brochure, Invitation Letter, Medical Certificate, Fee Receipt)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/15 border-dashed rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-blue-500/60 transition cursor-pointer relative group">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400 group-hover:text-blue-400 transition-colors" />
                      <div className="flex text-xs text-slate-300 justify-center">
                        <label className="relative cursor-pointer rounded-md font-bold text-blue-400 hover:text-blue-300">
                          <span>{file ? file.name : 'Choose a file to attach'}</span>
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0] || null)}
                            className="sr-only"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400">PDF, PNG, JPG, DOC up to 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 rounded-full font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Form
                  </button>

                  <DukeButton
                    type="submit"
                    disabled={submitting}
                    loading={submitting}
                    size="md"
                    variant="primary"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </DukeButton>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NewRequest;
