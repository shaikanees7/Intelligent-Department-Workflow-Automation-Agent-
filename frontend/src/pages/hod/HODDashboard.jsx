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
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Users,
  Check,
  X,
  FileText,
  Download,
  AlertCircle,
  Building,
  TrendingUp,
  Phone
} from 'lucide-react';

const HODDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const [stats, setStats] = useState({
    total_requests: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_count: 0
  });

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchHODData = async () => {
    try {
      setLoading(true);
      const [statsRes, queueRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/requests/pending')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success && statsRes.value.data.data) {
        setStats(statsRes.value.data.data);
      }
      if (queueRes.status === 'fulfilled' && queueRes.value.data?.success && Array.isArray(queueRes.value.data.data)) {
        setQueue(queueRes.value.data.data);
      }
    } catch (err) {
      console.warn('[HODDashboard] Data fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHODData();
  }, []);

  const handleOpenModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setRemarks(
      type === 'APPROVED'
        ? 'Sanctioned by Head of Department. Official digital gate pass issued.'
        : ''
    );
    setSuccessMsg('');
  };

  const handleExecuteSanction = async () => {
    if (!selectedReq) return;
    if (actionType === 'REJECTED' && !remarks.trim()) {
      alert('Remarks are required for rejecting a request.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/requests/${selectedReq.request_id}/action`, {
        action: actionType,
        remarks: remarks
      });

      setSuccessMsg(`Request successfully ${actionType === 'APPROVED' ? 'sanctioned and Gate Pass generated' : 'rejected'}.`);
      fetchNotifications();
      setTimeout(() => {
        setSelectedReq(null);
        setSuccessMsg('');
        fetchHODData();
      }, 1500);
    } catch (err) {
      setSuccessMsg(`Action failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = queue.filter((r) => r.overall_status === 'UNDER_REVIEW' || r.overall_status === 'PENDING');

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="HOD" />

        <main className="flex-1 w-full space-y-6">
          {/* Header */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-saas-primary/15 text-saas-primary rounded-2xl shadow-xs">
                  <Award className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-saas-textDark tracking-tight">
                      Head of Department (HOD) Sanctions Portal
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-saas-navy text-[11px] font-bold">
                      Step 3 of 4
                    </span>
                  </div>
                  <p className="text-xs text-saas-textMuted mt-0.5">
                    Dr. Ramesh Kumar • Department of Computer Science & Engineering • Final Institutional Authority
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="badge-pill bg-[#E8F7F0] text-emerald-800 border border-[#B3E8CE] text-xs font-bold py-1.5 px-3.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Final Institutional Authority
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Total Department Requests</p>
              <h3 className="text-3xl font-black text-saas-textDark mt-1">{stats.total_requests ?? 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting HOD Sanction</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pending_count ?? 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sanctioned & Generated</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.approved_count ?? 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">{stats.rejected_count ?? 0}</h3>
            </div>
          </div>

          {/* Final Sanctions Queue */}
          <div className="saas-card rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#EAE0E8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-saas-textDark text-sm">
                  Final Approval Queue (Step 3/4 in Workflow)
                </h3>
                <p className="text-xs text-saas-textMuted mt-0.5">
                  Applications verified by Mentor and approved by Faculty Coordinator awaiting final sanction
                </p>
              </div>
              <span className="badge-pill bg-[#FEF6EB] text-amber-900 border border-[#F7E1B5] text-xs font-bold py-1 px-3">
                {pendingList.length} Action Needed
              </span>
            </div>

            {pendingList.length === 0 ? (
              <div className="p-12 text-center text-xs text-saas-textMuted">
                No applications currently waiting for HOD final sanction.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Request ID</th>
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-6">Category</th>
                      <th className="py-3.5 px-6">Previous Approvals & Remarks</th>
                      <th className="py-3.5 px-6">Validity Dates</th>
                      <th className="py-3.5 px-6 text-right">Final Decision</th>
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
                        <td className="py-4 px-6">
                          <span className="badge-pill font-bold px-2.5 py-0.5 bg-saas-canvas text-saas-navy border border-[#EAE0E8]">
                            {req.request_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 max-w-sm space-y-1">
                          <p className="font-medium text-saas-textDark truncate" title={req.reason}>
                            "{req.reason}"
                          </p>
                          {req.mentor_remarks && (
                            <p className="text-[10px] text-saas-primary truncate" title={req.mentor_remarks}>
                              ✓ Mentor: {req.mentor_remarks}
                            </p>
                          )}
                          {req.faculty_remarks && (
                            <p className="text-[10px] text-saas-navy font-semibold truncate" title={req.faculty_remarks}>
                              ✓ Coordinator: {req.faculty_remarks}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-6 text-saas-textMuted whitespace-nowrap">
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => handleOpenModal(req, 'APPROVED')}
                            className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full shadow-2xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Final Sanction
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

          {/* Department Analytics Visual Pie Charts & Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Department Sanctions & Clearance Ratios"
              subtitle="Live breakdown of applications submitted to Computer Science Department"
              total={stats.total_requests ?? 0}
              totalLabel="Total"
              badge="Department Live"
              items={[
                {
                  label: 'Sanctioned & Generated',
                  count: stats.approved_count ?? 0,
                  color: '#238B62'
                },
                {
                  label: 'Awaiting HOD Sanction',
                  count: stats.pending_count ?? 0,
                  color: '#D69B35'
                },
                {
                  label: 'Rejected',
                  count: stats.rejected_count ?? 0,
                  color: '#D65B70'
                }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Requests by Academic Category"
              subtitle="Distribution across institutional permission categories for AY 2025-26"
              total={stats.total_requests ?? 0}
              totalLabel="Categories"
              badge="AY 2025-26"
              items={[
                {
                  label: 'On-Duty (OD) Requests',
                  count: queue.filter(r => r.request_type === 'OD').length,
                  color: '#B95BD5'
                },
                {
                  label: 'Student Leave Requests',
                  count: queue.filter(r => r.request_type === 'LEAVE' || r.request_type === 'MEDICAL').length,
                  color: '#261B50'
                },
                {
                  label: 'Event Participation',
                  count: queue.filter(r => r.request_type !== 'OD' && r.request_type !== 'LEAVE' && r.request_type !== 'MEDICAL').length,
                  color: '#D8B8E8'
                }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Turnaround & Automated Compliance Card */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-[#E8F7F0] text-emerald-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h4 className="font-bold text-saas-textDark text-sm">
                  Approval Turnaround Efficiency
                </h4>
                <span className="badge-pill bg-[#E8F7F0] text-emerald-800 border border-[#B3E8CE] text-xs font-bold py-0.5 px-2.5">
                  92% On-Time
                </span>
              </div>
              <p className="text-xs text-saas-textMuted leading-relaxed pt-1">
                With IDWAA (Intelligent Department Workflow Automation Agent), average departmental approval turnaround time has dropped from 3.5 days to 4.2 hours.
              </p>
            </div>
            <div className="p-4 bg-saas-canvas/60 rounded-2xl border border-[#EAE0E8] text-xs text-saas-textDark w-full md:w-80">
              <div className="font-bold text-saas-navy">Automated Audit Compliance</div>
              <div className="text-[11px] text-saas-textMuted mt-1 leading-relaxed">
                All approvals maintain digital timestamps, reviewer signatures, and cryptographically verifiable PDF gate passes.
              </div>
            </div>
          </div>

          {/* Modal */}
          {selectedReq && (
            <div className="fixed inset-0 z-50 bg-[#1E163B]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="saas-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE0E8]">
                  <div className="flex items-center gap-2">
                    {actionType === 'APPROVED' ? (
                      <span className="p-2 rounded-2xl bg-[#E8F7F0] text-emerald-700 font-bold">
                        <Award className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-2xl bg-[#FDEEF1] text-rose-700 font-bold">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-saas-textDark text-base">
                        {actionType === 'APPROVED' ? 'Grant Final HOD Sanction' : 'Reject Application'}
                      </h3>
                      <p className="text-[11px] text-saas-textMuted">{selectedReq.request_code}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReq(null)}
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
                        {selectedReq.student_name} (Reg: {selectedReq.registration_number || 'N/A'}{(selectedReq.phone || selectedReq.student_phone) ? ` • Mob: ${selectedReq.phone || selectedReq.student_phone}` : ''})
                      </div>
                      <div className="text-saas-textDark mt-1 italic bg-white p-3 rounded-xl border border-[#EAE0E8]">
                        "{selectedReq.reason}"
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-saas-textDark mb-1">
                        HOD Official Sanction Remarks {actionType === 'REJECTED' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add HOD sanction order note..."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReq(null)}
                        className="saas-pill-btn-outline text-xs px-4 py-2"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={handleExecuteSanction}
                        className={`px-5 py-2 font-bold text-white rounded-full shadow-xs transition disabled:opacity-50 text-xs ${
                          actionType === 'APPROVED'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {submitting
                          ? 'Generating Pass...'
                          : actionType === 'APPROVED'
                          ? 'Sanction & Issue Digital Pass'
                          : 'Confirm Rejection'}
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

export default HODDashboard;

