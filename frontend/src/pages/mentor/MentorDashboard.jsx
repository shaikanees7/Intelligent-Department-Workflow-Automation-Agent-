import React, { useState, useEffect, useContext } from 'react';
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
  Phone,
  Loader2
} from 'lucide-react';

const MentorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const [requests, setRequests] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('verification'); // 'verification' | 'mentees'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [pendingRes, menteesRes] = await Promise.allSettled([
        api.get('/requests/pending'),
        api.get('/requests/mentees')
      ]);

      if (pendingRes.status === 'fulfilled' && pendingRes.value.data?.success) {
        setRequests(pendingRes.value.data.data);
      }
      if (menteesRes.status === 'fulfilled' && menteesRes.value.data?.success) {
        setMentees(menteesRes.value.data.data);
      }
    } catch (err) {
      console.warn('[MentorDashboard] Error fetching live mentor queue:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setRemarks(
      type === 'VERIFIED'
        ? `Academic Mentor Verification: Student attendance and eligibility verified (${req.attendance || '88%'}). Recommended for department coordinator review.`
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

      setSuccessMsg(`Mentee request marked as ${actionType} and forwarded.`);
      fetchNotifications();
      setTimeout(() => {
        setSelectedRequest(null);
        setSuccessMsg('');
        loadData();
      }, 1200);
    } catch (err) {
      alert('Failed to process action: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = requests.filter(
    (r) => r.overall_status === 'UNDER_REVIEW' || r.overall_status === 'PENDING' || r.overall_status === 'SUBMITTED'
  );

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="MENTOR" />

        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Header Banner */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-[#F4EBF7] text-[#B95BD5] rounded-2xl shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-[#261B50] tracking-tight">
                      Academic Mentor Verification Workspace
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-[#261B50] text-[11px] font-bold">
                      Step 1 of 4
                    </span>
                  </div>
                  <p className="text-xs text-[#7C7390] mt-0.5">
                    Faculty Mentor: {user?.first_name || 'Prof. Suresh'} {user?.last_name || 'Reddy'} • {user?.department_name || 'Computer Science and Engineering'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-pill bg-[#FAF5F8] text-[#261B50] border border-[#EAE0E8] text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#B95BD5]" />
                {mentees.length} Assigned Mentees
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'verification'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending Mentee Verifications ({pendingList.length})
            </button>

            <button
              onClick={() => setActiveTab('mentees')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'mentees'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Assigned Mentee Roster ({mentees.length})
            </button>
          </div>

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="saas-card rounded-3xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#EAE0E8]">
                <h3 className="font-bold text-[#261B50] text-sm">
                  First-Level Advisory Verification Queue
                </h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  Verify reason authenticity and check student academic attendance before forwarding to department coordinator
                </p>
              </div>

              {pendingList.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#7C7390] space-y-1">
                  <div className="font-bold text-sm text-[#261B50]">No Pending Mentee Applications</div>
                  <p>All permission requests from your assigned cohort have been verified and advanced.</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[720px] lg:min-w-0">
                    <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-3.5 lg:px-4">Request ID</th>
                        <th className="py-3 px-3.5 lg:px-4">Mentee Info</th>
                        <th className="py-3 px-3.5 lg:px-4">Attendance</th>
                        <th className="py-3 px-3.5 lg:px-4">Category</th>
                        <th className="py-3 px-3.5 lg:px-4">Reason Excerpt</th>
                        <th className="py-3 px-3.5 lg:px-4">Duration</th>
                        <th className="py-3 px-3.5 lg:px-4 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                      {pendingList.map((req) => (
                        <tr key={req.request_id} className="hover:bg-[#FAF5F8]/60 transition">
                          <td className="py-3.5 px-3.5 lg:px-4 font-bold text-[#261B50] whitespace-nowrap">
                            {req.request_code}
                            {Boolean(req.is_urgent) && (
                              <span className="block mt-1 text-[9px] font-bold text-rose-700 bg-[#FDEEF1] px-2 py-0.5 rounded-full border border-rose-200 text-center">
                                URGENT
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4 whitespace-nowrap">
                            <div className="font-bold text-[#261B50]">{req.student_name}</div>
                            <div className="text-[11px] font-semibold text-[#7C7390]">
                              Reg: {req.registration_number || 'N/A'}
                            </div>
                            {(req.phone || req.student_phone) && (
                              <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{req.phone || req.student_phone}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-[#7C7390]">Sec {req.section || 'A'}</div>
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4 whitespace-nowrap font-bold text-emerald-700">
                            {req.attendance || '88%'}
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4">
                            <span className="badge-pill font-bold px-2 py-0.5 bg-[#FAF5F8] text-[#261B50] border border-[#EAE0E8]">
                              {req.request_type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4 max-w-[180px] lg:max-w-xs truncate" title={req.reason}>
                            "{req.reason}"
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4 text-[#7C7390] whitespace-nowrap text-[11px]">
                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-3.5 lg:px-4 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenModal(req, 'VERIFIED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-[#261B50] hover:bg-[#1C143B] text-white px-3 py-1.5 rounded-full shadow-xs transition cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Verify & Forward
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenModal(req, 'REJECTED')}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-full shadow-xs transition cursor-pointer"
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
                <h3 className="font-bold text-[#261B50] text-sm">Assigned Student Advisory Roster</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">Live database students mapped to your academic mentorship</p>
              </div>

              {mentees.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#7C7390]">
                  No students currently mapped to your section in the database.
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[680px] lg:min-w-0">
                    <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-3.5 lg:px-4">Student Name</th>
                        <th className="py-3 px-3.5 lg:px-4">Registration Number</th>
                        <th className="py-3 px-3.5 lg:px-4">Section</th>
                        <th className="py-3 px-3.5 lg:px-4">Attendance</th>
                        <th className="py-3 px-3.5 lg:px-4">Batch</th>
                        <th className="py-3 px-3.5 lg:px-4 text-right">Active Applications</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                      {mentees.map((m) => (
                        <tr key={m.student_id || m.user_id} className="hover:bg-[#FAF5F8]/60 transition">
                          <td className="py-3.5 px-3.5 lg:px-4 font-bold text-[#261B50]">{m.student_name}</td>
                          <td className="py-3.5 px-3.5 lg:px-4 font-mono text-[#B95BD5] font-bold">{m.registration_number}</td>
                          <td className="py-3.5 px-3.5 lg:px-4">Sec {m.section}</td>
                          <td className="py-3.5 px-3.5 lg:px-4 font-bold text-emerald-700">{m.attendance || '88%'}</td>
                          <td className="py-3.5 px-3.5 lg:px-4 text-[#7C7390]">{m.batch_year || '2022-2026'}</td>
                          <td className="py-3.5 px-3.5 lg:px-4 text-right">
                            <span className={`badge-pill font-bold px-2.5 py-0.5 ${
                              m.active_requests_count > 0 ? 'bg-[#FEF6EB] text-amber-900 border border-[#F7E1B5]' : 'bg-[#FAF5F8] text-[#7C7390] border border-[#EAE0E8]'
                            }`}>
                              {m.active_requests_count || 0} In Progress
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Action Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-[#261B50] shadow-2xl border border-[#EAE0E8]">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      actionType === 'VERIFIED' ? 'bg-[#E8F7F0] text-emerald-700' : 'bg-[#FDEEF1] text-[#E04F69]'
                    }`}>
                      {actionType === 'VERIFIED' ? 'Academic Verification' : 'Reject Application'}
                    </span>
                    <h3 className="text-xl font-black text-[#261B50] mt-1">
                      {actionType === 'VERIFIED' ? 'Verify Application & Forward' : 'Reject Permission Request'}
                    </h3>
                    <p className="text-xs text-[#7C7390] mt-0.5">
                      {selectedRequest.student_name} • {selectedRequest.request_code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 rounded-xl text-[#837B96] hover:text-[#261B50]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-[#E8F7F0] border border-[#B7E8D3] rounded-2xl text-xs font-bold text-emerald-800 text-center">
                    {successMsg}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-2xl text-xs space-y-1">
                      <span className="font-bold text-[#261B50]">Student Justification:</span>
                      <p className="text-[#4F4665]">"{selectedRequest.reason}"</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1">
                        Mentor Verification Remarks {actionType === 'REJECTED' && <span className="text-[#E04F69]">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add institutional academic notes, attendance verification, or justification..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(null)}
                        className="saas-pill-btn-outline text-xs px-4 py-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleActionSubmit}
                        className={`text-xs px-5 py-2 rounded-full font-bold text-white shadow-xs transition cursor-pointer flex items-center gap-1.5 ${
                          actionType === 'VERIFIED'
                            ? 'bg-[#261B50] hover:bg-[#1C143B]'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{actionType === 'VERIFIED' ? 'Confirm Verification' : 'Confirm Rejection'}</span>
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
