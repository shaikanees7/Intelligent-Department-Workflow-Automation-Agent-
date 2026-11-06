import React, { useState, useEffect, useContext, useRef } from 'react';
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
  FileText,
  ShieldAlert,
  HelpCircle,
  Edit3,
  X,
  Loader2
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
  const [validationModal, setValidationModal] = useState(null);

  const reasonInputRef = useRef(null);
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
    setValidationModal(null);
  };

  const handleEditFromModal = () => {
    setValidationModal(null);
    setTimeout(() => {
      if (reasonInputRef.current) {
        reasonInputRef.current.focus();
        reasonInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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

      // 1. Pre-submission Intent Validation with Groq AI Agent
      const validationRes = await api.post('/requests/validate-intent', {
        subject: subject.trim(),
        reason: reason.trim(),
        request_type: 'OD',
        start_date: startDate,
        end_date: endDate
      });

      const validation = validationRes.data?.data;

      // Check if the AI validation agent rejected or requested clarification
      if (validation && !validation.valid) {
        setSubmitting(false);
        setValidationModal({
          open: true,
          type: validation.classification || 'INVALID_PERMISSION_INTENT',
          data: validation
        });
        return;
      }

      // 2. Intent verified -> Proceed to submit request
      const formData = new FormData();
      formData.append('subject', subject.trim());
      formData.append('reason', `[Subject: ${subject.trim()}] ${reason.trim()}`);
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
      // Capture server-side HTTP 422 intent validation rejections
      if (err.response?.status === 422 && err.response?.data?.validation) {
        setValidationModal({
          open: true,
          type: err.response.data.validation.classification || 'INVALID_PERMISSION_INTENT',
          data: err.response.data.validation
        });
      } else {
        setError(err.response?.data?.message || 'Submission error. Please check fields and try again.');
      }
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
        <main className="flex-1 min-w-0 w-full space-y-6">
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
                      ref={reasonInputRef}
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
                      className="saas-pill-btn-primary cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Evaluating Intent with AI...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Application</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SaaS AI Permission Intent Modal */}
      {validationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#261B50]/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className={`relative w-full max-w-lg bg-white/95 rounded-3xl p-6 sm:p-8 space-y-6 text-[#261B50] shadow-2xl backdrop-blur-md border ${
            validationModal.type === 'INVALID_PERMISSION_INTENT'
              ? 'border-[#F9CAD3] shadow-[0_20px_50px_rgba(224,79,105,0.15)]'
              : 'border-[#EAE0E8] shadow-[0_20px_50px_rgba(185,91,213,0.15)]'
          }`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  validationModal.type === 'INVALID_PERMISSION_INTENT'
                    ? 'bg-[#FDEEF1] text-[#E04F69] border-[#F9CAD3]'
                    : 'bg-[#FEF6EB] text-[#E58B24] border-[#FCE1C2]'
                }`}>
                  {validationModal.type === 'INVALID_PERMISSION_INTENT' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <HelpCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      validationModal.type === 'INVALID_PERMISSION_INTENT'
                        ? 'bg-[#FDEEF1] text-[#E04F69]'
                        : 'bg-[#FEF6EB] text-[#E58B24]'
                    }`}>
                      {validationModal.type === 'INVALID_PERMISSION_INTENT'
                        ? 'Intent Blocked'
                        : 'Clarification Required'}
                    </span>
                    <span className="text-[10px] text-[#837B96] font-mono">
                      Groq LPU Engine
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#261B50] tracking-tight">
                    {validationModal.type === 'INVALID_PERMISSION_INTENT'
                      ? 'Permission Request Not Allowed'
                      : 'Additional Information Required'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setValidationModal(null)}
                className="p-1.5 rounded-xl hover:bg-[#F4EBF7] text-[#837B96] hover:text-[#261B50] transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Explanation Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5F8] border border-[#EAE0E8] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#261B50] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#B95BD5]" />
                  <span>AI Agent Evaluation</span>
                </span>
                {validationModal.data?.confidence && (
                  <span className="text-[10px] font-mono font-bold text-[#837B96] bg-white px-2 py-0.5 rounded-md border border-[#EAE0E8]">
                    Confidence: {(validationModal.data.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-[#261B50] leading-relaxed">
                {validationModal.data?.message || 'This application does not meet institutional permission requirements.'}
              </p>
              {validationModal.data?.reason && (
                <div className="pt-2 border-t border-[#F0E8EE] text-[11px] text-[#5D5570]">
                  <span className="font-bold text-[#261B50]">Analysis: </span>
                  {validationModal.data.reason}
                </div>
              )}
            </div>

            {/* Institutional Policy Suggestion Box */}
            <div className="p-4 rounded-2xl bg-[#FAF8FA] border border-[#F0E8EE] text-xs text-[#5D5570] space-y-1.5">
              <div className="font-bold text-[#261B50] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#B95BD5]" />
                <span>University Permission Guidelines</span>
              </div>
              {validationModal.type === 'INVALID_PERMISSION_INTENT' ? (
                <p className="leading-relaxed">
                  Permission requests must be for legitimate purposes such as On-Duty (OD) for hackathons, technical workshops, competitions, academic symposiums, verified medical appointments, or emergency leave. Applications intended to avoid or skip lectures cannot be entered into the workflow.
                </p>
              ) : (
                <div className="space-y-1">
                  <p className="leading-relaxed">
                    Please provide essential details so your mentor and faculty coordinator can verify your request:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#7C7390]">
                    <li>Event or workshop name and organizing institution</li>
                    <li>Specific medical appointment or health reason</li>
                    <li>Relevant academic or course context</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setValidationModal(null)}
                className="saas-pill-btn-outline cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleEditFromModal}
                className="saas-pill-btn-primary cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{validationModal.type === 'INVALID_PERMISSION_INTENT' ? 'Edit Request' : 'Update Details'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewRequest;
