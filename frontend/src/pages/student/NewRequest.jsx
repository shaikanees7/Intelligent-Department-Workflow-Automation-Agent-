import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import {
  FilePlus,
  Activity,
  Calendar,
  Sparkles,
  Upload,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-react';

const NewRequest = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'OD';

  const [requestType, setRequestType] = useState(initialType);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [extraDetails, setExtraDetails] = useState('');
  const [file, setFile] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const navigate = useNavigate();

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
    setReason('');
    setStartDate('');
    setEndDate('');
    setExtraDetails('');
    setFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('request_type', requestType);

      const fullReason = extraDetails
        ? `[${requestType} Subject: ${extraDetails}] ${reason}`
        : reason;

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
                Your request will be automatically routed to your assigned mentor and faculty coordinator.
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
                  {successData.requestCode}
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your application has entered Step 1: Academic Mentor Verification. Notifications have been dispatched.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to={`/student/track/${successData.requestId}`}
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
              {/* Type Switcher Tabs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Request Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequestType('OD')}
                    className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                      requestType === 'OD'
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Activity className={`w-5 h-5 ${requestType === 'OD' ? 'text-primary-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">On-Duty (OD)</div>
                      <div className="text-[10px] text-slate-500">Hackathons, Competitions</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('LEAVE')}
                    className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                      requestType === 'LEAVE'
                        ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className={`w-5 h-5 ${requestType === 'LEAVE' ? 'text-indigo-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Student Leave</div>
                      <div className="text-[10px] text-slate-500">Medical or Personal Absence</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('EVENT')}
                    className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
                      requestType === 'EVENT'
                        ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${requestType === 'EVENT' ? 'text-purple-700' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Event Participation</div>
                      <div className="text-[10px] text-slate-500">Festivals, Workshops</div>
                    </div>
                  </button>
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
                {/* Specific field for context */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {requestType === 'OD'
                      ? 'Event / Organization / Hackathon Name'
                      : requestType === 'LEAVE'
                      ? 'Leave Category (e.g. Medical / Family Emergency / Sick Leave)'
                      : 'Event Title & Hosting Institute'}
                  </label>
                  <input
                    type="text"
                    value={extraDetails}
                    onChange={(e) => setExtraDetails(e.target.value)}
                    required
                    placeholder={
                      requestType === 'OD'
                        ? 'e.g. National Smart India Hackathon'
                        : requestType === 'LEAVE'
                        ? 'e.g. Severe Fever / Medical Rest'
                        : 'e.g. Annual Technical Symposium at IIT Madras'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Duration Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Detailed Justification */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detailed Reason / Justification
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="Provide detailed explanation for your absence or on-duty participation..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 leading-relaxed"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Supporting Document (Brochure, Invitation Letter, or Medical Certificate)
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
                      <p className="text-[10px] text-slate-400">PDF, PNG, JPG up to 5MB</p>
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
