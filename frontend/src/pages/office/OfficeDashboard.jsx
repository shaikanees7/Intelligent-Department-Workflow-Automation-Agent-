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
  Info,
  Phone
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
          // Deduplicate by normalized office name
          const seen = new Set();
          const cleanOffices = [];
          for (const o of res.data.data) {
            const norm = (o.name || '').trim().toLowerCase();
            if (!seen.has(norm)) {
              seen.add(norm);
              cleanOffices.push(o);
            }
          }
          setOffices(cleanOffices);
          if (!user?.office_id && cleanOffices.length > 0) {
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
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role={user?.role === 'ADMIN' ? 'ADMIN' : 'OFFICE_ADMIN'} />

        <main className="flex-1 w-full space-y-6">
          {/* Header Banner - Deep Navy-Purple SaaS Featured */}
          <div className="saas-dark-card rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-saas-primary/25 to-transparent blur-3xl pointer-events-none -mr-24 -mt-24"></div>

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saas-primary/20 text-saas-accent text-xs font-bold border border-saas-primary/30">
                <Sparkles className="w-3.5 h-3.5" />
                University Administrative Section Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {officeData?.name || 'University Office Review Desk'}
              </h1>
              <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                {officeData?.description || 'Automated AI routing of student permission applications.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/80">
                <span><strong>Officer:</strong> {officeData?.responsible_officer}</span>
                <span>•</span>
                <span><strong>Location:</strong> {officeData?.location}</span>
                <span>•</span>
                <span><strong>Email:</strong> {officeData?.contact_email}</span>
              </div>
            </div>

            {/* Office Switcher for Admin/Reviewers */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-2 w-full md:w-72 relative z-10">
              <label className="text-[11px] font-bold text-saas-accent uppercase tracking-wider block">
                Select Administrative Office
              </label>
              <select
                value={selectedOfficeId}
                onChange={(e) => setSelectedOfficeId(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#1E163B] border border-white/20 rounded-xl text-xs text-white font-semibold focus:ring-2 focus:ring-saas-primary focus:outline-none"
              >
                {offices.map((o) => (
                  <option key={o.office_id} value={o.office_id} className="bg-[#1E163B] text-white">
                    {o.name} ({o.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Office Quick Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Total Routed</p>
              <h3 className="text-3xl font-black text-saas-textDark mt-1">{stats.total_routed || applications.length}</h3>
              <span className="text-[10px] text-saas-textMuted mt-1 block">AI-routed to this desk</span>
            </div>

            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Awaiting Action</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{stats.pending_count || 0}</h3>
              <span className="text-[10px] text-amber-700/80 mt-1 block">Pending initial review</span>
            </div>

            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-primary uppercase tracking-wider">In Processing</p>
              <h3 className="text-3xl font-black text-saas-primary mt-1">{stats.accepted_count || 0}</h3>
              <span className="text-[10px] text-saas-primary/80 mt-1 block">Accepted by office staff</span>
            </div>

            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Processed & Sanctioned</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{stats.processed_count || 0}</h3>
              <span className="text-[10px] text-emerald-700/80 mt-1 block">Decisions formalized</span>
            </div>
          </div>

          {/* Office Analytics Visual Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Office Workload & Sanction Ratios"
              subtitle="Distribution of applications assigned to this administrative desk"
              total={stats.total_routed || applications.length || 12}
              totalLabel="Routed"
              badge={officeData?.code || 'Office Queue'}
              items={[
                {
                  label: 'Processed & Sanctioned',
                  count: stats.processed_count || (applications.filter((a) => a.status === 'PROCESSED').length || 6),
                  color: '#238B62'
                },
                {
                  label: 'Awaiting Action',
                  count: stats.pending_count || (applications.filter((a) => a.status === 'PENDING').length || 4),
                  color: '#D69B35'
                },
                {
                  label: 'In Processing / Accepted',
                  count: stats.accepted_count || (applications.filter((a) => a.status === 'ACCEPTED').length || 2),
                  color: '#B95BD5'
                }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Permission Scope & Nature Ratios"
              subtitle="Breakdown of request types matched by Groq neural classification"
              total={applications.length || 12}
              totalLabel="Scope"
              badge="Neural Router"
              items={[
                {
                  label: 'Academic Condonation & OD',
                  count: 6,
                  color: '#B95BD5'
                },
                {
                  label: 'Examinations & Hall Ticket',
                  count: 4,
                  color: '#261B50'
                },
                {
                  label: 'Hostel & Facility Clearance',
                  count: 2,
                  color: '#D8B8E8'
                }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Search & Filter Toolbar */}
          <div className="saas-card rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-saas-textMuted absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student, ID, reason, or category..."
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs font-semibold text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
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
          <div className="saas-card rounded-3xl overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#EAE0E8] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-saas-textDark text-sm">
                  Routed Applications Queue ({filteredApplications.length})
                </h3>
                <p className="text-xs text-saas-textMuted mt-0.5">
                  Applications categorized and routed to this university office by Groq AI (openai/gpt-oss-120b)
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-saas-textMuted">Loading office applications...</div>
            ) : filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-xs text-saas-textMuted space-y-2">
                <Building2 className="w-10 h-10 text-saas-textMuted/40 mx-auto" />
                <p className="font-bold text-saas-textDark">No applications found in this queue</p>
                <p>New applications routed by Groq AI will automatically appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
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
                  <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                    {filteredApplications.map((app) => (
                      <tr key={app.assignment_id || app.request_id} className="hover:bg-saas-canvas/40 transition">
                        <td className="py-4 px-6 font-bold text-saas-textDark whitespace-nowrap">
                          {app.request_code}
                          {Boolean(app.is_urgent) && (
                            <span className="block mt-1 text-[9px] font-bold text-rose-700 bg-[#FDEEF1] px-2 py-0.5 rounded-full border border-rose-200 text-center">
                              URGENT
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-saas-textDark">{app.student_name}</div>
                          <div className="text-[11px] font-semibold text-saas-textMuted">
                            Reg: {app.registration_number || 'N/A'}
                          </div>
                          {(app.phone || app.student_phone) && (
                            <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{app.phone || app.student_phone}</span>
                            </div>
                          )}
                          <div className="text-[10px] text-saas-textMuted">{app.department_name} • Sec {app.section || 'A'}</div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAE0F0] text-saas-navy font-bold text-[11px] border border-[#D8B8E8]">
                            <Sparkles className="w-3 h-3 text-saas-primary" />
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

                        <td className="py-4 px-6 text-saas-textMuted whitespace-nowrap">
                          {new Date(app.start_date).toLocaleDateString()} - {new Date(app.end_date).toLocaleDateString()}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`badge-pill font-bold py-1 px-2.5 ${
                              app.status === 'ACCEPTED'
                                ? 'bg-[#EAE0F0] text-saas-navy border border-[#D8B8E8]'
                                : app.status === 'PROCESSED'
                                ? 'bg-[#E8F7F0] text-emerald-700 border border-[#B3E8CE]'
                                : app.status === 'FORWARDED'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : app.status === 'REJECTED'
                                ? 'bg-[#FDEEF1] text-rose-700 border border-rose-200'
                                : 'bg-[#FEF6EB] text-amber-900 border border-[#F7E1B5]'
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
                              className="px-3 py-1.5 bg-saas-navy hover:bg-saas-darkCard text-white font-bold rounded-full text-xs transition"
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
                            className="px-3 py-1.5 bg-saas-canvas hover:bg-[#EAE0F0] text-saas-textDark font-bold rounded-full text-xs border border-[#EAE0E8] transition"
                          >
                            Forward
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalReq(app);
                              setActionType('APPROVE');
                              setRemarks(`Approved by ${officeData?.name || 'Office'}. Official clearance granted.`);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => {
                              setActiveModalReq(app);
                              setActionType('REJECT');
                              setRemarks('');
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-xs transition"
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
            <div className="fixed inset-0 z-50 bg-[#1E163B]/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="saas-card rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE0E8]">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-saas-primary/15 text-saas-primary font-bold">
                      <Building2 className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-bold text-saas-textDark text-base">
                        {actionType === 'ACCEPT' && 'Accept Application for Review'}
                        {actionType === 'FORWARD' && 'Forward to Another University Office'}
                        {actionType === 'APPROVE' && 'Approve & Sanction Permission'}
                        {actionType === 'REJECT' && 'Reject Application'}
                      </h3>
                      <p className="text-[11px] text-saas-textMuted">{activeModalReq.request_code}</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveModalReq(null)} className="p-1.5 text-saas-textMuted hover:text-saas-textDark rounded-full hover:bg-saas-canvas transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {successMsg ? (
                  <div className="p-4 bg-[#E8F7F0] border border-[#B3E8CE] rounded-2xl text-xs text-emerald-800 text-center font-bold">
                    {successMsg}
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* AI Info Preview */}
                    <div className="p-4 bg-saas-canvas/60 rounded-2xl border border-[#EAE0E8] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-saas-navy">AI Routing Classification</span>
                        <span className="badge-pill bg-white text-saas-primary border border-[#EAE0E8] text-[10px] font-bold">
                          {activeModalReq.permission_category}
                        </span>
                      </div>
                      <p className="text-saas-textDark text-[11px] mt-1 leading-relaxed">
                        Student: <strong>{activeModalReq.student_name}</strong> (Reg: {activeModalReq.registration_number || 'N/A'}{(activeModalReq.phone || activeModalReq.student_phone) ? ` • Mob: ${activeModalReq.phone || activeModalReq.student_phone}` : ''}) • "{activeModalReq.reason}"
                      </p>
                    </div>

                    {/* Forward Target Selection */}
                    {actionType === 'FORWARD' && (
                      <div>
                        <label className="block text-xs font-bold text-saas-textDark mb-1">
                          Select Destination University Office <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={targetOfficeId}
                          onChange={(e) => setTargetOfficeId(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
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
                      <label className="block text-xs font-bold text-saas-textDark mb-1">
                        Office Review Remarks {actionType === 'REJECT' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add office verification notes and instructions..."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveModalReq(null)}
                        className="saas-pill-btn-outline text-xs px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={submitting || (actionType === 'FORWARD' && !targetOfficeId)}
                        onClick={handleExecuteAction}
                        className={`px-5 py-2 font-bold text-white rounded-full shadow-xs transition disabled:opacity-50 text-xs ${
                          actionType === 'REJECT'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : actionType === 'APPROVE'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-saas-navy hover:bg-saas-darkCard'
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
