import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
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
  Calendar,
  FileText
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

    if (!registrationNumber.trim() || !mobileNumber.trim()) {
      setError('Registration Number and Mobile Number are required for institutional verification.');
      return;
    }

    if (!subject.trim() || !reason.trim() || !startDate || !endDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('To Date cannot be earlier than From Date.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('reason', `[Subject: ${subject}] ${reason}`);
      formData.append('request_type', 'OD'); // Default fallback category; AI router dynamically re-classifies
      formData.append('start_date', startDate);
      formData.append('end_date', endDate);
      formData.append('registration_number', registrationNumber.trim());
      formData.append('mobile_number', mobileNumber.trim());
      formData.append('phone', mobileNumber.trim());
      if (file) {
        formData.append('document', file);
      }

      const res = await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccessData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to submit application.');
      }
    } catch (err) {
      console.error('[NewRequest] Submission error:', err);
      setError(err.response?.data?.message || 'Submission error. Please check fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EFF2] text-[#261B50] font-sans relative selection:bg-[#B95BD5] selection:text-white overflow-x-hidden">
      {/* Subtle Atmospheric Ambient Glow */}
      <BlueprintWatermark />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout Container */}
      <div className="flex flex-col md:flex-row relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        {/* Left Sidebar */}
        <Sidebar role="STUDENT" />

        {/* Form Container */}
        <main className="flex-1 w-full space-y-6">
          <div className="bg-white/95 rounded-3xl border border-[#EAE0E8] shadow-card-soft p-6 sm:p-8 space-y-6 backdrop-blur-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0E8EE]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-[#F4EBF7] text-[#B95BD5]">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-[#261B50] tracking-tight">
                    Submit Permission Application
                  </h1>
                </div>
                <p className="text-xs text-[#7C7390] mt-1">
                  Intelligent permission submission with Groq AI routing and multi-level departmental clearance
                </p>
              </div>

              <Link
                to="/student/requests"
                className="saas-pill-btn-outline text-xs"
              >
                <span>View Application History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {successData ? (
              <div className="bg-[#E8F7F0] rounded-3xl border border-[#B7E8D3] p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 bg-[#D2F2E3] text-[#1E9A68] rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-[#261B50]">Application Submitted Successfully!</h2>
                  <p className="text-xs text-[#4F4665] max-w-md mx-auto leading-relaxed">
                    Your request has been received and analyzed by our AI Routing Agent. Verification workflows and office notifications have been dispatched.
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#B7E8D3] rounded-2xl inline-block max-w-md shadow-xs">
                  <div className="text-xs font-bold text-[#837B96] uppercase tracking-wider">Official Reference Code</div>
                  <div className="text-xl font-black text-[#1E9A68] mt-1 tracking-wider font-mono">
                    {successData.requestCode || successData.request_code}
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                    to={`/student/track/${successData.requestId || successData.request_id}`}
                    className="saas-pill-btn-primary"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Track Live Workflow Progress</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccessData(null);
                      handleReset();
                    }}
                    className="saas-pill-btn-outline cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Guidance Card */}
                <div className="flex items-start gap-4 p-5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-3xl shadow-xs">
                  <div className="p-2.5 rounded-2xl bg-[#F4EBF7] text-[#B95BD5] shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <h3 className="font-black text-[#261B50] text-sm">Intelligent AI Classification & Office Routing</h3>
                    <p className="text-[#4F4665] leading-relaxed">
                      Simply enter your registration number, contact phone, and details of your request.
                      Our Neural Routing Agent automatically evaluates your text, matches university policy, and directs the request to the appropriate department office.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-[#FDEEF1] border border-[#F9CAD3] rounded-2xl text-xs font-bold text-[#E04F69]">
                    {error}
                  </div>
                )}

                {/* Urgency Detection Alert */}
                {isUrgent && (
                  <div className="p-4 bg-[#FEF6EB] border border-[#FCE1C2] rounded-2xl flex items-start gap-3 text-[#A06C1C] animate-pulse">
                    <AlertTriangle className="w-5 h-5 text-[#E58B24] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-black">Expedited Workflow Flagged!</span>
                      <p className="mt-0.5 text-[#78350F] leading-relaxed">
                        Your event begins within 48 hours. This request will be highlighted with urgent priority for your mentor and coordinator.
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Student Verification: Registration Number & Mobile Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1.5 flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#B95BD5]" />
                        <span>Registration Number</span> <span className="text-[#E04F69]">*</span>
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        required
                        placeholder="e.g. 21BCE1024 / 241FA18363"
                        className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] font-mono font-bold transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#B95BD5]" />
                        <span>Mobile Number</span> <span className="text-[#E04F69]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        placeholder="e.g. +91 9876543210"
                        className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] font-semibold transition"
                      />
                    </div>
                  </div>

                  {/* Subject / Purpose Title */}
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                      Request Subject / Purpose Title <span className="text-[#E04F69]">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="e.g. Smart India Hackathon / Medical Leave / Supplementary Exam Reschedule / Hostel Outing"
                      className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] transition"
                    />
                  </div>

                  {/* Duration Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                        From Date <span className="text-[#E04F69]">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                        To Date <span className="text-[#E04F69]">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] transition"
                      />
                    </div>
                  </div>

                  {/* Detailed Justification */}
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                      Detailed Reason / Justification <span className="text-[#E04F69]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      placeholder="Provide a detailed explanation for your request, including any relevant course, exam, event, or personal details for the AI agent to evaluate..."
                      className="w-full px-4 py-3 bg-[#FAF5F7] hover:bg-white focus:bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] leading-relaxed transition"
                    />
                  </div>

                  {/* File Upload Box */}
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                      Supporting Document (Optional: Brochure, Invitation Letter, Medical Certificate, Fee Receipt)
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed border-[#EAE0E8] rounded-3xl bg-[#FAF5F7] hover:bg-white hover:border-[#B95BD5] transition cursor-pointer relative group">
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-8 w-8 text-[#837B96] group-hover:text-[#B95BD5] transition" />
                        <div className="flex text-xs text-[#4F4665] justify-center">
                          <label className="relative cursor-pointer rounded-md font-bold text-[#B95BD5] hover:text-[#8E32A8]">
                            <span>{file ? file.name : 'Choose a file to attach'}</span>
                            <input
                              type="file"
                              onChange={(e) => setFile(e.target.files[0] || null)}
                              className="sr-only"
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                            />
                          </label>
                        </div>
                        <p className="text-[10px] text-[#837B96]">PDF, PNG, JPG, DOC up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0E8EE]">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="saas-pill-btn-outline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Form</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="saas-pill-btn-primary cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewRequest;
