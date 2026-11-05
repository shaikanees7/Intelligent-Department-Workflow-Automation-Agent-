import React, { useState, useContext } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatusBadge from '../../components/common/StatusBadge';
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
    <div className="min-h-screen bg-[#F3F5F7] relative flex flex-col font-sans overflow-x-hidden">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10">
        <Sidebar role="MENTOR" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 text-indigo-800 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Academic Mentor Verification Workspace
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Faculty Mentor: {user?.first_name || 'Prof. Suresh'} {user?.last_name || 'Reddy'} • Batch 2022-2026
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {ASSIGNED_MENTEES.length} Assigned Mentees
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'verification'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Pending Mentee Verifications ({pendingList.length})
            </button>

            <button
              onClick={() => setActiveTab('mentees')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'mentees'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Assigned Mentee Roster ({ASSIGNED_MENTEES.length})
            </button>
          </div>

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  First-Level Verification Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Verify reason authenticity and check student academic attendance before forwarding to department coordinator
                </p>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  All assigned mentee applications have been verified.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
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
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {pendingList.map((req) => (
                        <tr key={req.request_id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                            {req.request_code}
                            {Boolean(req.is_urgent) && (
                              <span className="block mt-1 text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 text-center">
                                URGENT
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{req.student_name}</div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              Reg: {req.registration_number || 'N/A'}
                            </div>
                            {(req.phone || req.student_phone) && (
                              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{req.phone || req.student_phone}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400">Sec {req.section || 'A'}</div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap font-bold text-emerald-700">
                            {req.attendance}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-bold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800">
                              {req.request_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-xs truncate" title={req.reason}>
                            "{req.reason}"
                          </td>
                          <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => handleOpenModal(req, 'VERIFIED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Verify & Forward
                            </button>
                            <button
                              onClick={() => handleOpenModal(req, 'REJECTED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg shadow-2xs transition"
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
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Assigned Student Roster</h3>
                <p className="text-xs text-slate-500">Mentees mapped to your academic advisory cohort</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6">Registration Number</th>
                      <th className="py-3.5 px-6">Section</th>
                      <th className="py-3.5 px-6">Attendance</th>
                      <th className="py-3.5 px-6">CGPA</th>
                      <th className="py-3.5 px-6 text-right">Active Applications</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {ASSIGNED_MENTEES.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-bold text-slate-900">{m.name}</td>
                        <td className="py-4 px-6 font-mono">{m.regNo}</td>
                        <td className="py-4 px-6">{m.section}</td>
                        <td className="py-4 px-6 font-bold text-emerald-700">{m.attendance}</td>
                        <td className="py-4 px-6 font-bold text-slate-800">{m.cgpa}</td>
                        <td className="py-4 px-6 text-right">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.activeRequests > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
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

          {/* Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {actionType === 'VERIFIED' ? (
                      <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                        <ShieldCheck className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-xl bg-rose-100 text-rose-700 font-bold">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {actionType === 'VERIFIED' ? 'Mentor Verification' : 'Reject Mentee Request'}
                      </h3>
                      <p className="text-[11px] text-slate-500">{selectedRequest.request_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-bold">
                    {successMsg}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">
                        {selectedRequest.student_name} (Reg: {selectedRequest.registration_number || 'N/A'}{(selectedRequest.phone || selectedRequest.student_phone) ? ` • Mob: ${selectedRequest.phone || selectedRequest.student_phone}` : ''})
                      </div>
                      <div className="text-slate-600">
                        Attendance Record: <strong className="text-emerald-700">{selectedRequest.attendance}</strong>
                      </div>
                      <div className="mt-2 text-slate-800 bg-white p-2.5 rounded border border-slate-200 italic">
                        "{selectedRequest.reason}"
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mentor Verification Remarks {actionType === 'REJECTED' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add mentor observation notes..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleActionSubmit}
                        className={`px-5 py-2 font-bold text-white rounded-xl shadow-sm transition disabled:opacity-50 ${
                          actionType === 'VERIFIED'
                            ? 'bg-indigo-600 hover:bg-indigo-700'
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
