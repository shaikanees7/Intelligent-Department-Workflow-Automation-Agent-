import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import api from '../../services/api';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Send,
  Search,
  Filter,
  Check,
  X,
  FileText,
  User,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';

const OfficeDashboard = () => {
  const { user } = useContext(AuthContext);
  const { fetchNotifications } = useContext(NotificationContext);

  const [offices, setOffices] = useState([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState(user?.office_id || 1);
  const [officeData, setOfficeData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total_routed: 0,
    pending_count: 0,
    accepted_count: 0,
    processed_count: 0,
    forwarded_count: 0
  });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [activeModalReq, setActiveModalReq] = useState(null);
  const [actionType, setActionType] = useState('ACCEPT'); // 'ACCEPT' | 'FORWARD' | 'APPROVE' | 'REJECT'
  const [remarks, setRemarks] = useState('');
  const [targetOfficeId, setTargetOfficeId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch available offices
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/offices');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setOffices(res.data.data);
          if (!user?.office_id && res.data.data.length > 0) {
            setSelectedOfficeId(res.data.data[0].office_id);
          }
        }
      } catch (err) {
        console.warn('[OfficeDashboard] Failed to fetch offices:', err.message);
      }
    };
    fetchOffices();
  }, [user]);

  // 2. Fetch specific office details & applications
  const fetchOfficeDetails = async () => {
    if (!selectedOfficeId) return;
    try {
      setLoading(true);
      const [detailsRes, statsRes] = await Promise.allSettled([
        api.get(`/offices/${selectedOfficeId}`),
        api.get(`/offices/${selectedOfficeId}/stats`)
      ]);

      if (detailsRes.status === 'fulfilled' && detailsRes.value.data?.success) {
        const d = detailsRes.value.data.data;
        setOfficeData(d.office);
        setApplications(d.applications || []);
      }

      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }
    } catch (err) {
      console.warn('[OfficeDashboard] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeDetails();
  }, [selectedOfficeId]);

  // Handle Action Execution
  const handleExecuteAction = async () => {
    if (!activeModalReq) return;
    try {
      setSubmitting(true);
      const payload = {
        request_id: activeModalReq.request_id,
        assignment_id: activeModalReq.assignment_id,
        action: actionType,
        remarks: remarks,
        target_office_id: actionType === 'FORWARD' ? parseInt(targetOfficeId) : undefined
      };

      const res = await api.post(`/offices/${selectedOfficeId}/action`, payload);
      if (res.data?.success) {
        setSuccessMsg(`Action '${actionType}' completed successfully.`);
        fetchNotifications();
        setTimeout(() => {
          setActiveModalReq(null);
          setSuccessMsg('');
          fetchOfficeDetails();
        }, 1200);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to execute office action.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.request_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.permission_category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={user?.role === 'ADMIN' ? 'ADMIN' : 'OFFICE_ADMIN'} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                University Administrative Section Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {officeData?.name || 'University Office Review Desk'}
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {officeData?.description || 'Automated AI routing of student permission applications.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                <span><strong>Officer:</strong> {officeData?.responsible_officer}</span>
                <span>•</span>
                <span><strong>Location:</strong> {officeData?.location}</span>
                <span>•</span>
                <span><strong>Email:</strong> {officeData?.contact_email}</span>
              </div>
            </div>

            {/* Office Switcher for Admin/Reviewers */}
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 w-full md:w-72">
              <label className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">
                Select Administrative Office
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/20 rounded-xl text-xs text-white font-semibold focus:ring-2 focus:ring-sky-400"
              >
                {offices.map((o) => (
                  <option key={o.office_id} value={o.office_id} className="bg-slate-900 text-white">
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Office Quick Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Routed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total_routed || applications.length}</h3>
              <span className="text-[10px] text-slate-400 mt-1 block">AI-routed to this desk</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Action</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending_count || 0}</h3>
              <span className="text-[10px] text-amber-700/80 mt-1 block">Pending initial review</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">In Processing</p>
              <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.accepted_count || 0}</h3>
              <span className="text-[10px] text-indigo-700/80 mt-1 block">Accepted by office staff</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Processed & Sanctioned</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.processed_count || 0}</h3>
              <span className="text-[10px] text-emerald-700/80 mt-1 block">Decisions formalized</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, ID, reason, or AI category..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Action</option>
                <option value="ACCEPTED">Accepted / In Progress</option>
                <option value="PROCESSED">Processed & Sanctioned</option>
                <option value="FORWARDED">Forwarded</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Applications Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Routed Applications Queue ({filteredApplications.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Applications categorized and routed to this university office by Groq AI (openai/gpt-oss-120b)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading office applications...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold text-slate-600">No applications found in this queue</p>
                <p>New applications routed by Groq AI will automatically appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Request ID</th>
                      <th className="py-3.5 px-6">Student Information</th>
                      <th className="py-3.5 px-6">AI Classification & Confidence</th>
                      <th className="py-3.5 px-6">Reason Excerpt</th>
                      <th className="py-3.5 px-6">Duration</th>
                      <th className="py-3.5 px-6">Office Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredApplications.map((app) => (
                      <tr key={app.assignment_id || app.request_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          {app.request_code}
                          {Boolean(app.is_urgent) && (
                            <span className="block mt-1 text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded border border-red-200 text-center">
                              URGENT
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{app.student_name}</div>
                          <div className="text-[11px] text-slate-500">
                            {app.registration_number} • Sec {app.section}
                          </div>
                          <div className="text-[10px] text-slate-400">{app.department_name}</div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-bold text-[11px] border border-sky-200">
                            <Sparkles className="w-3 h-3 text-sky-600" />
                            {app.permission_category || 'General Permission'}
                          </div>
                          {app.ai_confidence && (
                            <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                              Match: {(app.ai_confidence * 100).toFixed(0)}% Confidence
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 max-w-xs truncate" title={app.reason}>
                          "{app.reason}"
                        </td>

                        <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                          {new Date(app.start_date).toLocaleDateString()} - {new Date(app.end_date).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              app.status === 'ACCEPTED'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : app.status === 'PROCESSED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'FORWARDED'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : app.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {app.status || 'PENDING'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                          {app.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setActiveModalReq(app);
                                setActionType('ACCEPT');
                                setRemarks('Accepted by office administrator for departmental verification.');
                              }}
                              className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                            >
                              Accept
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveModalReq(app);
                              setActionType('FORWARD');
                              setRemarks('');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition"
                          >
                            Forward
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalReq(app);
                              setActionType('APPROVE');
                              setRemarks(`Approved by ${officeData?.name || 'Office'}. Official clearance granted.`);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalReq(app);
                              setActionType('REJECT');
                              setRemarks('');
                            }}
                            className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition"
                          >
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

          {/* Action Modal */}
          {activeModalReq && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 font-bold">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {actionType === 'ACCEPT' && 'Accept Application for Review'}
                        {actionType === 'FORWARD' && 'Forward to Another University Office'}
                        {actionType === 'APPROVE' && 'Approve & Sanction Permission'}
                        {actionType === 'REJECT' && 'Reject Application'}
                      </h3>
                      <p className="text-[11px] text-slate-500">{activeModalReq.request_code}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModalReq(null)} className="text-slate-400 hover:text-slate-600 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-center font-bold">
                    {successMsg}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* AI Info Preview */}
                    <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-900">AI Routing Classification</span>
                        <span className="text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-300">
                          {activeModalReq.permission_category}
                        </span>
                      </div>
                      <p className="text-sky-800 text-[11px] mt-1 leading-relaxed">
                        Student: <strong>{activeModalReq.student_name}</strong> • "{activeModalReq.reason}"
                      </p>
                    </div>

                    {/* Forward Target Selection */}
                    {actionType === 'FORWARD' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Destination University Office <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={targetOfficeId}
                          onChange={(e) => setTargetOfficeId(e.target.value)}
                          required
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">-- Choose Target Office --</option>
                          {offices
                            .filter((o) => o.office_id !== selectedOfficeId)
                            .map((o) => (
                              <option key={o.office_id} value={o.office_id}>
                                {o.name} ({o.responsible_officer})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}

                    {/* Remarks Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Office Review Remarks {actionType === 'REJECT' && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add office verification notes and instructions..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveModalReq(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submitting || (actionType === 'FORWARD' && !targetOfficeId)}
                        onClick={handleExecuteAction}
                        className={`px-5 py-2 font-bold text-white rounded-xl shadow-sm transition disabled:opacity-50 ${
                          actionType === 'REJECT'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : actionType === 'APPROVE'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {submitting ? 'Executing...' : 'Confirm Action'}
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

export default OfficeDashboard;
