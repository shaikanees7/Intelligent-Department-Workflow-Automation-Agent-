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
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Send,
  ExternalLink,
  Search,
  Filter,
  Check,
  X,
  FileCheck2,
  Phone
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('APPROVED'); // 'APPROVED' | 'REJECTED'
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchFacultyQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/pending');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setQueue(res.data.data);
      }
    } catch (err) {
      console.warn('[FacultyDashboard] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyQueue();
  }, []);

  const handleOpenActionModal = (req, type) => {
    setSelectedRequest(req);
    setActionType(type);
    setRemarks(type === 'APPROVED' ? 'Approved by department coordinator. Forwarded to HOD for final sanction.' : '');
    setActionSuccess('');
  };

  const handleExecuteAction = async () => {
    if (!selectedRequest) return;
    if (actionType === 'REJECTED' && !remarks.trim()) {
      alert('Remarks are required when rejecting an application.');
      return;
    }

    try {
      setSubmitting(true);
      // Calls real backend API
      await api.post(`/requests/${selectedRequest.request_id}/action`, {
        action: actionType,
        remarks: remarks
      });

      setActionSuccess(`Application ${selectedRequest.request_code} successfully marked as ${actionType}.`);
      fetchNotifications();
      setTimeout(() => {
        setSelectedRequest(null);
        setActionSuccess('');
        fetchFacultyQueue();
      }, 1500);
    } catch (err) {
      setActionSuccess(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingRequests = queue.filter((r) => r.overall_status === 'UNDER_REVIEW' || r.overall_status === 'PENDING');
  const processedRequests = queue.filter((r) => r.overall_status === 'APPROVED' || r.overall_status === 'REJECTED');

  const displayedList = (activeTab === 'pending' ? pendingRequests : processedRequests).filter(
    (r) =>
      r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.request_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="FACULTY" />

        <main className="flex-1 min-w-0 w-full space-y-6">
          {/* Header */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-saas-primary/15 text-saas-primary rounded-2xl shadow-xs">
                  <CheckSquare className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-saas-textDark tracking-tight">
                      Faculty Review & Sanction Desk
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-saas-navy text-[11px] font-bold">
                      Step 2 of 4
                    </span>
                  </div>
                  <p className="text-xs text-saas-textMuted mt-0.5">
                    Welcome, {user?.first_name || 'Faculty Coordinator'} • Department of Computer Science & Engineering
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="badge-pill bg-[#FEF6EB] text-amber-900 border border-[#F7E1B5] text-xs font-bold py-1.5 px-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                {pendingRequests.length} Pending Actions
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="saas-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Awaiting Verification</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingRequests.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF6EB] text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Approved & Forwarded</p>
                <h3 className="text-3xl font-black text-emerald-600 mt-1">
                  {queue.filter((r) => r.overall_status === 'APPROVED').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#E8F7F0] text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="saas-card rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Rejected</p>
                <h3 className="text-3xl font-black text-rose-600 mt-1">
                  {queue.filter((r) => r.overall_status === 'REJECTED').length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FDEEF1] text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Tabs & Search */}
          <div className="saas-card rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'pending'
                    ? 'bg-saas-navy text-white shadow-xs'
                    : 'bg-saas-canvas text-saas-textDark hover:bg-[#EAE0F0]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Pending Verification ({pendingRequests.length})
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'bg-saas-navy text-white shadow-xs'
                    : 'bg-saas-canvas text-saas-textDark hover:bg-[#EAE0F0]'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                Processed History ({processedRequests.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-saas-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student or request..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
              />
            </div>
          </div>

          {/* Applications List */}
          <div className="saas-card rounded-3xl overflow-hidden">
            {displayedList.length === 0 ? (
              <div className="p-12 text-center text-xs text-saas-textMuted">
                No applications in this view.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[720px] lg:min-w-0">
                  <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3.5 lg:px-4">Request ID</th>
                      <th className="py-3 px-3.5 lg:px-4">Student Details</th>
                      <th className="py-3 px-3.5 lg:px-4">Category</th>
                      <th className="py-3 px-3.5 lg:px-4">Purpose / Remarks</th>
                      <th className="py-3 px-3.5 lg:px-4">Dates</th>
                      <th className="py-3 px-3.5 lg:px-4">Status</th>
                      <th className="py-3 px-3.5 lg:px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                    {displayedList.map((req) => (
                      <tr key={req.request_id} className="hover:bg-saas-canvas/40 transition">
                        <td className="py-3.5 px-3.5 lg:px-4 font-bold text-saas-textDark whitespace-nowrap">
                          {req.request_code}
                          {Boolean(req.is_urgent) && (
                            <span className="block mt-1 text-[9px] font-bold text-rose-700 bg-[#FDEEF1] px-2 py-0.5 rounded-full border border-rose-200 text-center">
                              URGENT
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 lg:px-4 whitespace-nowrap">
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
                        <td className="py-3.5 px-3.5 lg:px-4">
                          <span className="badge-pill font-bold px-2 py-0.5 bg-saas-canvas text-saas-navy border border-[#EAE0E8]">
                            {req.request_type}
                          </span>
                        </td>
                        <td className="py-3.5 px-3.5 lg:px-4 max-w-[180px] lg:max-w-xs">
                          <p className="text-saas-textDark font-medium truncate" title={req.reason}>
                            "{req.reason}"
                          </p>
                          {req.mentor_remarks && (
                            <p className="text-[11px] text-saas-primary mt-1 truncate" title={req.mentor_remarks}>
                              ↳ {req.mentor_remarks}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 lg:px-4 text-saas-textMuted whitespace-nowrap text-[11px]">
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3.5 lg:px-4 whitespace-nowrap">
                          <StatusBadge status={req.overall_status} size="sm" />
                        </td>
                        <td className="py-3.5 px-3.5 lg:px-4 text-right whitespace-nowrap space-x-1.5">
                          {activeTab === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleOpenActionModal(req, 'APPROVED')}
                                className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full shadow-2xs transition cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(req, 'REJECTED')}
                                className="inline-flex items-center gap-1 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-full shadow-2xs transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-saas-textMuted font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Faculty Analytics Pie Charts & Images */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Faculty Review & Clearance Distribution"
              subtitle="Live breakdown of student applications routed to Faculty Review Desk"
              total={queue.length}
              totalLabel="Requests"
              badge="Faculty Queue"
              items={[
                {
                  label: 'Approved & Forwarded to HOD',
                  count: queue.filter((r) => r.overall_status === 'APPROVED').length,
                  color: '#238B62'
                },
                {
                  label: 'Awaiting Coordinator Action',
                  count: pendingRequests.length,
                  color: '#D69B35'
                },
                {
                  label: 'Rejected',
                  count: queue.filter((r) => r.overall_status === 'REJECTED').length,
                  color: '#D65B70'
                }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Requests by Academic Purpose"
              subtitle="Distribution of student permission categories verified by department"
              total={queue.length}
              totalLabel="Categories"
              badge={`${user?.department_name || 'CSE'} Department`}
              items={[
                { label: 'On-Duty (OD)', count: queue.filter(r => r.request_type === 'OD').length, color: '#B95BD5' },
                { label: 'Student Leave & Medical', count: queue.filter(r => r.request_type === 'LEAVE' || r.request_type === 'MEDICAL').length, color: '#261B50' },
                { label: 'Event & Workshop', count: queue.filter(r => r.request_type !== 'OD' && r.request_type !== 'LEAVE' && r.request_type !== 'MEDICAL').length, color: '#D8B8E8' }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Action Review Modal */}
          {selectedRequest && (
            <div className="fixed inset-0 z-50 bg-[#1E163B]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="saas-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE0E8]">
                  <div className="flex items-center gap-2">
                    {actionType === 'APPROVED' ? (
                      <span className="p-2 rounded-2xl bg-[#E8F7F0] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-2xl bg-[#FDEEF1] text-rose-700 font-bold">
                        <XCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h3 className="font-bold text-saas-textDark text-base">
                        {actionType === 'APPROVED' ? 'Approve & Forward Request' : 'Reject Request'}
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

                {actionSuccess ? (
                  <div className="p-4 bg-[#E8F7F0] border border-[#B3E8CE] rounded-2xl text-xs text-emerald-800 text-center font-bold">
                    {actionSuccess}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-saas-canvas/60 rounded-2xl border border-[#EAE0E8] space-y-1">
                      <div className="font-bold text-saas-textDark">
                        {selectedRequest.student_name} (Reg: {selectedRequest.registration_number || 'N/A'}{(selectedRequest.phone || selectedRequest.student_phone) ? ` • Mob: ${selectedRequest.phone || selectedRequest.student_phone}` : ''})
                      </div>
                      <div className="text-saas-textMuted">
                        Type: {selectedRequest.request_type} • Section {selectedRequest.section}
                      </div>
                      <div className="text-saas-textDark mt-2 italic bg-white p-3 rounded-xl border border-[#EAE0E8]">
                        "{selectedRequest.reason}"
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-saas-textDark mb-1">
                        Coordinator Remarks / Decision Notes {actionType === 'REJECTED' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks or justification..."
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
                        onClick={handleExecuteAction}
                        className={`px-5 py-2 font-bold text-white rounded-full shadow-xs transition disabled:opacity-50 text-xs ${
                          actionType === 'APPROVED'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                      >
                        {submitting
                          ? 'Submitting...'
                          : actionType === 'APPROVED'
                          ? 'Confirm Approval & Forward'
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

export default FacultyDashboard;
