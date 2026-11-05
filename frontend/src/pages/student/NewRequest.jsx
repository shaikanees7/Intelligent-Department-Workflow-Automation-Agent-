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
  Phone
} from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Submit Permission Application
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your request details. The University AI Agent will automatically classify and route your application to the responsible office.
              </p>
            </div>
            <Link
              to="/student/requests"
              className="text-xs font-bold text-primary-600 hover:text-primary-800"
            >
              View Application History →
            </Link>
          </div>

          {successData ? (
            <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-md text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Application Submitted Successfully!</h2>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block max-w-md">
                <div className="text-xs text-slate-500">Official Reference Code:</div>
                <div className="text-xl font-extrabold text-primary-700 mt-0.5 tracking-wider">
                  {successData.requestCode || successData.request_code}
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your application has been received and analyzed by our AI Routing Agent. Verification workflows and office notifications have been dispatched.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to={`/student/track/${successData.requestId || successData.request_id}`}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition"
                >
                  <Activity className="w-4 h-4" />
                  Track Live Workflow Progress
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessData(null);
                    handleReset();
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* AI Guidance Card */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-primary-50/80 via-indigo-50/50 to-sky-50/60 border border-primary-200/80 rounded-2xl">
                <div className="p-2 rounded-xl bg-primary-600 text-white shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <h3 className="font-bold text-slate-900">Intelligent AI Classification & Routing</h3>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    You don't need to choose an administrative category. Simply provide your registration number, contact phone, and describe your purpose.
                    Our AI Routing Agent evaluates your application and assigns it directly to the relevant university office.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  {error}
                </div>
              )}

              {/* Urgency Detection Alert */}
              {isUrgent && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-amber-900 animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold">Intelligent Rule: High Urgency Flagged!</span>
                    <p className="mt-0.5 text-amber-800">
                      Your event begins within 48 hours. This request will be highlighted in red for your mentor and faculty coordinator for expedited approval.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Student Verification: Registration Number & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-primary-600" />
                      Registration Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      required
                      placeholder="e.g. 21BCE1024 / 241FA18363"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary-600" />
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                      placeholder="e.g. +91 9876543210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                {/* Subject / Purpose Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Request Subject / Purpose Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    placeholder="e.g. Smart India Hackathon / Medical Leave / Supplementary Exam Reschedule / Hostel Outing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900"
                  />
                </div>

                {/* Duration Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      From Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      To Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Detailed Justification */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Reason / Justification <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Provide a detailed explanation for your request, including any relevant course, exam, event, or personal details for the AI agent to evaluate..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 text-slate-900 leading-relaxed"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supporting Document (Optional: Brochure, Invitation Letter, Medical Certificate, Fee Receipt)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer relative">
                    <div className="space-y-2 text-center">
                      <Upload className="mx-auto h-8 w-8 text-slate-400" />
                      <div className="flex text-xs text-slate-600 justify-center">
                        <label className="relative cursor-pointer rounded-md font-bold text-primary-600 hover:text-primary-500">
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
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
