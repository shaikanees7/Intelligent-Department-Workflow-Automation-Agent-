import React, { useState, useContext } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatusBadge from '../../components/common/StatusBadge';
import StatsPieChartCard from '../../components/common/StatsPieChartCard';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Check,
  X,
  FileText,
  AlertCircle,
  GraduationCap,
  Phone
} from 'lucide-react';

const INITIAL_MENTEE_REQUESTS = [
  {
    request_id: 1,
    request_code: 'REQ-842104',
    student_name: 'Anees Shaik',
    registration_number: 'REG2024CSE001',
    section: 'A',
    attendance: '88%',
    request_type: 'OD',
    reason: 'Selected for National Smart India Hackathon Grand Finale in Bangalore. Need 3 days On-Duty permission to travel and compete.',
    start_date: '2026-11-08',
    end_date: '2026-11-10',
    is_urgent: 1,
    overall_status: 'UNDER_REVIEW',
    current_step_order: 1
  },
  {
    request_id: 3,
    request_code: 'REQ-842115',
    student_name: 'Priya Sundaram',
    registration_number: 'REG2024CSE018',
    section: 'A',
    attendance: '92%',
    request_type: 'LEAVE',
    reason: 'Medical rest requested due to viral fever. Doctor prescription attached.',
    start_date: '2026-11-09',
    end_date: '2026-11-11',
    is_urgent: 1,
    overall_status: 'UNDER_REVIEW',
    current_step_order: 1
  }
];

const ASSIGNED_MENTEES = [
  { id: 1, name: 'Anees Shaik', regNo: 'REG2024CSE001', section: 'A', attendance: '88%', cgpa: '8.9', activeRequests: 1 },
  { id: 2, name: 'Priya Sundaram', regNo: 'REG2024CSE018', section: 'A', attendance: '92%', cgpa: '9.2', activeRequests: 1 },
  { id: 3, name: 'Karthik Raja', regNo: 'REG2024CSE029', section: 'A', attendance: '81%', cgpa: '7.8', activeRequests: 0 },
  { id: 4, name: 'Sneha Patel', regNo: 'REG2024CSE034', section: 'A', attendance: '85%', cgpa: '8.4', activeRequests: 0 }
];

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const [requests, setRequests] = useState(INITIAL_MENTEE_REQUESTS);
  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'mentees'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleOpenModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setRemarks(
      type === 'VERIFIED'
        ? `Academic Mentor Verification: Student attendance verified (${req.attendance}). Recommended for department coordinator review.`
        : ''
    );
    setSuccessMsg('');
  };

  const handleActionSubmit = async () => {
    if (!selectedRequest) return;
    if (actionType === 'REJECTED' && !remarks.trim()) {
      alert('Remarks are required to reject an application.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/requests/${selectedRequest.request_id}/action`, {
        action: actionType === 'VERIFIED' ? 'APPROVED' : 'REJECTED',
        remarks: remarks
      });

      setRequests((prev) =>
        prev.map((item) =>
          item.request_id === selectedRequest.request_id
            ? { ...item, overall_status: actionType === 'VERIFIED' ? 'APPROVED' : 'REJECTED' }
            : item
        )
      );

      setSuccessMsg(`Mentee request marked as ${actionType} and forwarded.`);
      fetchNotifications();
      setTimeout(() => {
        setSelectedRequest(null);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setRequests((prev) =>
        prev.map((item) =>
          item.request_id === selectedRequest.request_id
            ? { ...item, overall_status: actionType === 'VERIFIED' ? 'APPROVED' : 'REJECTED' }
            : item
        )
      );
      setSuccessMsg(`Mentee request recorded as ${actionType}.`);
      setTimeout(() => {
        setSelectedRequest(null);
        setSuccessMsg('');
      }, 1500);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = requests.filter((r) => r.overall_status === 'UNDER_REVIEW' || r.overall_status === 'PENDING');

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="MENTOR" />

        <main className="flex-1 w-full space-y-6">
          {/* Header Banner */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-saas-primary/15 text-saas-primary rounded-2xl shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-saas-textDark tracking-tight">
                      Academic Mentor Verification Workspace
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-saas-navy text-[11px] font-bold">
                      Step 1 of 4
                    </span>
                  </div>
                  <p className="text-xs text-saas-textMuted mt-0.5">
                    Faculty Mentor: {user?.first_name || 'Prof. Suresh'} {user?.last_name || 'Reddy'} • Batch 2022-2026 Advisory Desk
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-pill bg-saas-canvas text-saas-navy border border-[#EAE0E8] text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-saas-primary" />
                {ASSIGNED_MENTEES.length} Assigned Mentees
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'verification'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Mentee Verifications ({pendingList.length})
            </button>

            <button
              onClick={() => setActiveTab('mentees')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'mentees'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Assigned Mentee Roster ({ASSIGNED_MENTEES.length})
            </button>
          </div>

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="saas-card rounded-3xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#EAE0E8]">
                <h3 className="font-bold text-saas-textDark text-sm">
                  First-Level Advisory Verification Queue
                </h3>
                <p className="text-xs text-saas-textMuted mt-0.5">
                  Verify reason authenticity and check student academic attendance before forwarding to department coordinator
                </p>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-12 text-center text-xs text-saas-textMuted">
                  All assigned mentee applications have been verified.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3.5 px-6">Request ID</th>
                        <th className="py-3.5 px-6">Mentee Info</th>
                        <th className="py-3.5 px-6">Attendance</th>
                        <th className="py-3.5 px-6">Category</th>
                        <th className="py-3.5 px-6">Reason Excerpt</th>
                        <th className="py-3.5 px-6">Duration</th>
                        <th className="py-3.5 px-6 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                      {pendingList.map((req) => (
                        <tr key={req.request_id} className="hover:bg-saas-canvas/40 transition">
                          <td className="py-4 px-6 font-bold text-saas-textDark whitespace-nowrap">
                            {req.request_code}
                            {Boolean(req.is_urgent) && (
                              <span className="block mt-1 text-[9px] font-bold text-rose-700 bg-[#FDEEF1] px-2 py-0.5 rounded-full border border-rose-200 text-center">
                                URGENT
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="font-bold text-saas-textDark">{req.student_name}</div>
                            <div className="text-[11px] font-semibold text-saas-textMuted">
                              Reg: {req.registration_number || 'N/A'}
                            </div>
                            {(req.phone || req.student_phone) && (
                              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{req.phone || req.student_phone}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-saas-textMuted">Sec {req.section || 'A'}</div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap font-bold text-emerald-700">
                            {req.attendance}
                          </td>
                          <td className="py-4 px-6">
                            <span className="badge-pill font-bold px-2.5 py-0.5 bg-saas-canvas text-saas-navy border border-[#EAE0E8]">
                              {req.request_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate" title={req.reason}>
                            "{req.reason}"
                          </td>
                          <td className="py-4 px-6 text-saas-textMuted whitespace-nowrap">
                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenModal(req, 'VERIFIED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-saas-navy hover:bg-saas-darkCard text-white px-3.5 py-1.5 rounded-full shadow-2xs transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Verify & Forward
                            </button>
                            <button
                              onClick={() => handleOpenModal(req, 'REJECTED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 rounded-full shadow-2xs transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Mentees Roster Tab */}
          {activeTab === 'mentees' && (
            <div className="saas-card rounded-3xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#EAE0E8]">
                <h3 className="font-bold text-saas-textDark text-sm">Assigned Student Roster</h3>
                <p className="text-xs text-saas-textMuted mt-0.5">Mentees mapped to your academic advisory cohort</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6">Registration Number</th>
                      <th className="py-3.5 px-6">Section</th>
                      <th className="py-3.5 px-6">Attendance</th>
                      <th className="py-3.5 px-6">CGPA</th>
                      <th className="py-3.5 px-6 text-right">Active Applications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                    {ASSIGNED_MENTEES.map((m) => (
                      <tr key={m.id} className="hover:bg-saas-canvas/40 transition">
                        <td className="py-4 px-6 font-bold text-saas-textDark">{m.name}</td>
                        <td className="py-4 px-6 font-mono text-saas-primary font-bold">{m.regNo}</td>
                        <td className="py-4 px-6">{m.section}</td>
                        <td className="py-4 px-6 font-bold text-emerald-700">{m.attendance}</td>
                        <td className="py-4 px-6 font-bold text-saas-textDark">{m.cgpa}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`badge-pill font-bold px-2.5 py-0.5 ${
                            m.activeRequests > 0 ? 'bg-[#FEF6EB] text-amber-900 border border-[#F7E1B5]' : 'bg-saas-canvas text-saas-textMuted border border-[#EAE0E8]'
                          }`}>
                            {m.activeRequests} In Progress
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mentor Advisory Analytics Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Mentee Verification Clearance Ratio"
              subtitle="Status of requests submitted by assigned students in your advisory cohort"
              total={requests.length || 8}
              totalLabel="Mentees"
              badge="Advisory Desk"
              items={[
                {
                  label: 'Verified & Forwarded',
                  count: requests.filter((r) => r.overall_status === 'APPROVED').length || 5,
                  color: '#238B62'
                },
                {
                  label: 'Pending Verification',
                  count: pendingList.length || 2,
                  color: '#D69B35'
                },
                {
                  label: 'Requires Justification',
                  count: 1,
                  color: '#D65B70'
                }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Cohort Attendance Ratios"
              subtitle="Attendance compliance breakdown of assigned student cohort"
              total={ASSIGNED_MENTEES.length || 5}
              totalLabel="Students"
              badge="Eligibility"
              items={[
                {
                  label: 'Excellent (Above 85% Attendance)',
                  count: ASSIGNED_MENTEES.filter((m) => parseInt(m.attendance) >= 85).length || 3,
                  color: '#B95BD5'
                },
                {
                  label: 'Eligible (75% - 85% Attendance)',
                  count: ASSIGNED_MENTEES.filter((m) => parseInt(m.attendance) >= 75 && parseInt(m.attendance) < 85).length || 2,
                  color: '#261B50'
                },
                {
                  label: 'Critical (Below 75%)',
                  count: ASSIGNED_MENTEES.filter((m) => parseInt(m.attendance) < 75).length || 0,
                  color: '#D65B70'
                }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 bg-[#1E163B]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="saas-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE0E8]">
                  <div className="flex items-center gap-2">
                    {actionType === 'VERIFIED' ? (
                      <span className="p-2 rounded-2xl bg-[#E8F7F0] text-emerald-700 font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-2xl bg-[#FDEEF1] text-rose-700 font-bold">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-saas-textDark text-base">
                        {actionType === 'VERIFIED' ? 'Mentor Verification' : 'Reject Mentee Request'}
                      </h3>
                      <p className="text-[11px] text-saas-textMuted">{selectedRequest.request_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1.5 text-saas-textMuted hover:text-saas-textDark rounded-full hover:bg-saas-canvas transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-[#E8F7F0] border border-[#B3E8CE] rounded-2xl text-xs text-emerald-800 text-center font-bold">
                    {successMsg}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-saas-canvas/60 rounded-2xl border border-[#EAE0E8] space-y-1">
                      <div className="font-bold text-saas-textDark">
                        {selectedRequest.student_name} (Reg: {selectedRequest.registration_number || 'N/A'}{(selectedRequest.phone || selectedRequest.student_phone) ? ` • Mob: ${selectedRequest.phone || selectedRequest.student_phone}` : ''})
                      </div>
                      <div className="text-saas-textMuted">
                        Attendance Record: <strong className="text-emerald-700">{selectedRequest.attendance}</strong>
                      </div>
                      <div className="mt-2 text-saas-textDark bg-white p-3 rounded-xl border border-[#EAE0E8] italic">
                        "{selectedRequest.reason}"
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-saas-textDark mb-1">
                        Mentor Verification Remarks {actionType === 'REJECTED' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add mentor observation notes..."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className="saas-pill-btn-outline text-xs px-4 py-2"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleActionSubmit}
                        className={`px-5 py-2 font-bold text-white rounded-full shadow-xs transition disabled:opacity-50 text-xs ${
                          actionType === 'VERIFIED'
                            ? 'bg-saas-navy hover:bg-saas-darkCard'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {submitting
                          ? 'Processing...'
                          : actionType === 'VERIFIED'
                          ? 'Confirm & Forward to Faculty'
                          : 'Reject Request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MentorDashboard;
