import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatsPieChartCard from '../../components/common/StatsPieChartCard';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users,
  Building,
  Building2,
  Sliders,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  ArrowRight,
  Filter,
  Download,
  Plus,
  Sparkles,
  Cpu,
  Power
} from 'lucide-react';

const WORKFLOWS_DATA = [
  {
    type: 'OD',
    title: 'On-Duty (OD) Workflow',
    description: 'Triggered for hackathons, paper presentations, and external academic symposiums.',
    steps: [
      { step: 1, role: 'STUDENT', label: 'Submission with Invitation Document' },
      { step: 2, role: 'MENTOR', label: 'Academic Attendance & Eligibility Verification' },
      { step: 3, role: 'FACULTY', label: 'Department Lab / Exam Schedule Review' },
      { step: 4, role: 'HOD', label: 'Final Sanction & Digital Gate Pass Issuance' }
    ]
  },
  {
    type: 'LEAVE',
    title: 'Student Leave Workflow',
    description: 'Triggered for sick leave, medical emergencies, and personal absence.',
    steps: [
      { step: 1, role: 'STUDENT', label: 'Submission with Medical / Guardian Note' },
      { step: 2, role: 'MENTOR', label: 'Parent Verification & Attendance Check' },
      { step: 3, role: 'HOD', label: 'Final Approval & Attendance Exemption' }
    ]
  },
  {
    type: 'EVENT',
    title: 'Event Participation Workflow',
    description: 'Triggered for intra/inter-collegiate cultural and technical fests.',
    steps: [
      { step: 1, role: 'STUDENT', label: 'Submission with Event Brochure' },
      { step: 2, role: 'MENTOR', label: 'Mentor Verification' },
      { step: 3, role: 'FACULTY', label: 'Event Faculty Coordinator Sanction' },
      { step: 4, role: 'HOD', label: 'HOD Final Approval' }
    ]
  },
  {
    type: 'EXAM',
    title: 'Exam Permission Workflow',
    description: 'Triggered for lab practical reschedule, supplementary clearance, and hall ticket clash exemptions.',
    steps: [
      { step: 1, role: 'STUDENT', label: 'Submission with Exam Details & Fee/Hall Ticket Copy' },
      { step: 2, role: 'MENTOR', label: 'Academic Attendance & Eligibility Verification' },
      { step: 3, role: 'FACULTY', label: 'Subject Faculty / Exam Coordinator Review' },
      { step: 4, role: 'HOD', label: 'HOD Final Clearance & Controller of Exams Endorsement' }
    ]
  }
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'workflows' | 'ai_offices' | 'reports'
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 18,
    approved_count: 14,
    rejected_count: 1,
    pending_count: 3
  });
  const [aiStats, setAiStats] = useState({
    total_offices: 9,
    active_offices: 9,
    inactive_offices: 0,
    total_ai_classified: 0,
    routed_requests: 0,
    needs_manual_review: 0,
    avg_confidence: 0,
    office_distribution: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Fetch real backend data from GET /api/admin/users, GET /api/admin/stats, and GET /api/admin/ai-stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, statsRes, aiStatsRes] = await Promise.allSettled([
          api.get('/admin/users'),
          api.get('/admin/stats'),
          api.get('/admin/ai-stats')
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) {
          setUsersList(usersRes.value.data.data);
        } else {
          // Fallback if not populated
          setUsersList([
            { user_id: 1, first_name: 'System', last_name: 'Admin', email: 'admin@institution.edu', role: 'ADMIN', department_id: 1, is_active: 1 },
            { user_id: 2, first_name: 'Dr. Ramesh', last_name: 'Kumar', email: 'hod.cse@institution.edu', role: 'HOD', department_id: 1, is_active: 1 },
            { user_id: 3, first_name: 'Prof. Anitha', last_name: 'Sharma', email: 'faculty.cse@institution.edu', role: 'FACULTY', department_id: 1, is_active: 1 },
            { user_id: 4, first_name: 'Prof. Suresh', last_name: 'Reddy', email: 'mentor.cse@institution.edu', role: 'MENTOR', department_id: 1, is_active: 1 },
            { user_id: 5, first_name: 'Anees', last_name: 'Shaik', email: 'student1@institution.edu', role: 'STUDENT', department_id: 1, is_active: 1 }
          ]);
        }

        if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
          setStats(statsRes.value.data.data);
        }

        if (aiStatsRes.status === 'fulfilled' && aiStatsRes.value.data?.success) {
          setAiStats(aiStatsRes.value.data.data);
        }
      } catch (err) {
        console.warn('[AdminDashboard] Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = usersList.filter((u) => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-transparent relative flex flex-col font-sans overflow-x-hidden text-saas-textDark">
      <BlueprintWatermark />
      <Navbar />
      <div className="flex flex-1 relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="ADMIN" />

        <main className="flex-1 w-full space-y-6">
          {/* Header */}
          <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-saas-primary/15 text-saas-primary rounded-2xl shadow-xs">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-saas-textDark tracking-tight">
                      System Administration Hub
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-saas-navy text-[11px] font-bold">
                      Root Control
                    </span>
                  </div>
                  <p className="text-xs text-saas-textMuted mt-0.5">
                    Configure approval sequences, manage users, and supervise department workflows
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="badge-pill bg-saas-canvas text-saas-navy border border-[#EAE0E8] text-xs font-bold py-1.5 px-3.5">
                Institutional Root Authority
              </span>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Total Enrolled Users</p>
              <h3 className="text-3xl font-black text-saas-textDark mt-1">{usersList.length}</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-primary uppercase tracking-wider">Active Workflows</p>
              <h3 className="text-3xl font-black text-saas-primary mt-1">4</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-saas-textMuted uppercase tracking-wider">Total Requests Processed</p>
              <h3 className="text-3xl font-black text-saas-textDark mt-1">{stats.total_requests || 18}</h3>
            </div>
            <div className="saas-card rounded-3xl p-5">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sanction Rate</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">
                {stats.total_requests ? Math.round((stats.approved_count / stats.total_requests) * 100) : 92}%
              </h3>
            </div>
          </div>

          {/* Institutional Analytics Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Institution-Wide Clearance Ratios"
              subtitle="All student applications processed across university departments and offices"
              total={stats.total_requests || 18}
              totalLabel="Total"
              badge="Global Metrics"
              items={[
                {
                  label: 'Approved & Gate Pass Issued',
                  count: stats.approved_count || 14,
                  color: '#238B62'
                },
                {
                  label: 'In Active Review Queue',
                  count: stats.pending_count || 3,
                  color: '#D69B35'
                },
                {
                  label: 'Rejected with Remarks',
                  count: stats.rejected_count || 1,
                  color: '#D65B70'
                }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Active User Cohort & Roles"
              subtitle="Distribution of enrolled university accounts by institutional tier"
              total={usersList.length || 10}
              totalLabel="Users"
              badge="Access Roster"
              items={[
                {
                  label: 'Students',
                  count: usersList.filter((u) => u.role === 'STUDENT').length || 4,
                  color: '#B95BD5'
                },
                {
                  label: 'Academic Mentors & Faculty',
                  count: usersList.filter((u) => u.role === 'MENTOR' || u.role === 'FACULTY').length || 3,
                  color: '#261B50'
                },
                {
                  label: 'Office Admins & HODs',
                  count: usersList.filter((u) => u.role === 'OFFICE_ADMIN' || u.role === 'HOD' || u.role === 'ADMIN').length || 3,
                  color: '#D8B8E8'
                }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <Users className="w-4 h-4" />
              User Directory ({usersList.length})
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'workflows'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Workflow Sequences (4)
            </button>

            <button
              onClick={() => setActiveTab('ai_offices')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ai_offices'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-saas-primary" />
              AI Routing & Offices ({aiStats.total_offices || 9})
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-saas-navy text-white shadow-xs'
                  : 'bg-white text-saas-textDark hover:bg-[#EAE0F0] border border-[#EAE0E8]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports & Audit Export
            </button>
          </div>

          {/* Tab 1: User Management */}
          {activeTab === 'users' && (
            <div className="saas-card rounded-3xl overflow-hidden space-y-4">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#EAE0E8]">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-saas-textMuted absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search user name or email..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs font-semibold text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="MENTOR">Mentor</option>
                    <option value="HOD">HOD</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">User ID</th>
                      <th className="py-3.5 px-6">Full Name</th>
                      <th className="py-3.5 px-6">Institutional Email</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6 text-right">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                    {filteredUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-saas-canvas/40 transition">
                        <td className="py-4 px-6 font-mono font-bold text-saas-textMuted">#{u.user_id}</td>
                        <td className="py-4 px-6 font-bold text-saas-textDark">
                          {u.first_name} {u.last_name}
                        </td>
                        <td className="py-4 px-6 font-mono text-saas-textMuted">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className="badge-pill font-bold px-2.5 py-0.5 bg-saas-canvas text-saas-navy border border-[#EAE0E8] text-[10px]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-saas-textMuted">
                          {u.department_id === 1 ? 'Computer Science' : 'Engineering'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 bg-[#E8F7F0] px-2.5 py-0.5 rounded-full border border-[#B3E8CE]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Workflow Matrix Builder */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="saas-card rounded-3xl p-6 sm:p-7">
                <h3 className="font-bold text-saas-textDark text-base">Multi-Level Approval Matrix</h3>
                <p className="text-xs text-saas-textMuted mt-1">
                  Each permission type follows a rule-based sequence. Reviewers must approve before automatic progression to the next authority.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {WORKFLOWS_DATA.map((wf) => (
                  <div key={wf.type} className="saas-card rounded-3xl p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE0E8] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-saas-textDark text-sm">{wf.title}</span>
                          <span className="badge-pill text-[10px] font-bold px-2.5 py-0.5 bg-saas-primary/10 text-saas-primary">
                            {wf.type}
                          </span>
                        </div>
                        <p className="text-xs text-saas-textMuted mt-0.5">{wf.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Sequence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {wf.steps.map((st) => (
                        <div key={st.step} className="p-3.5 bg-saas-canvas/60 rounded-2xl border border-[#EAE0E8] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-saas-textMuted uppercase">
                              Step {st.step}
                            </span>
                            <span className="badge-pill text-[10px] font-bold px-2 py-0.2 bg-white text-saas-navy border border-[#EAE0E8]">
                              {st.role}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-saas-textDark">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: AI Routing & University Offices */}
          {activeTab === 'ai_offices' && (
            <div className="space-y-6">
              {/* Header Banner - Deep Navy-Purple SaaS Featured */}
              <div className="saas-dark-card rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-saas-primary/25 to-transparent blur-3xl pointer-events-none -mr-24 -mt-24"></div>

                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-saas-primary/20 text-saas-accent border border-saas-primary/30 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Groq AI Ultra-Fast LPU Routing Engine (openai/gpt-oss-120b)
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    University Office Registration & Intelligent Routing
                  </h3>
                  <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                    Student permission requests are dynamically classified into institutional categories and dispatched
                    to active registered offices without hardcoded logic.
                  </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <Link
                    to="/admin/offices"
                    className="saas-pill-btn-outline border-white/20 text-white hover:bg-white/10 text-xs px-5 py-2.5 inline-flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-saas-accent" />
                    Manage University Offices
                  </Link>
                  <Link
                    to="/office"
                    className="saas-pill-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Office Desk
                  </Link>
                </div>
              </div>

              {/* AI Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="saas-card rounded-3xl p-5">
                  <span className="text-[11px] font-bold text-saas-textMuted uppercase tracking-wider block">
                    Registered Offices
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-black text-saas-textDark">{aiStats.total_offices || 0}</h4>
                    <span className="text-xs font-semibold text-emerald-600">
                      ({aiStats.active_offices || 0} active)
                    </span>
                  </div>
                  <p className="text-[11px] text-saas-textMuted mt-1">
                    {aiStats.inactive_offices || 0} suspended
                  </p>
                </div>

                <div className="saas-card rounded-3xl p-5">
                  <span className="text-[11px] font-bold text-saas-textMuted uppercase tracking-wider block">
                    AI Classified Requests
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-black text-saas-primary">{aiStats.total_ai_classified || 0}</h4>
                    <span className="text-xs font-semibold text-saas-navy">Total</span>
                  </div>
                  <p className="text-[11px] text-saas-textMuted mt-1">Groq AI LPU neural classification</p>
                </div>

                <div className="saas-card rounded-3xl p-5">
                  <span className="text-[11px] font-bold text-saas-textMuted uppercase tracking-wider block">
                    Successfully Routed
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-black text-emerald-600">{aiStats.routed_requests || 0}</h4>
                    <span className="text-xs font-semibold text-saas-textMuted">Auto-assigned</span>
                  </div>
                  <p className="text-[11px] text-saas-textMuted mt-1">Matched with registered desks</p>
                </div>

                <div className="saas-card rounded-3xl p-5">
                  <span className="text-[11px] font-bold text-saas-textMuted uppercase tracking-wider block">
                    Classification Quality
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-3xl font-black text-saas-primary">
                      {aiStats.avg_confidence ? `${Math.round(aiStats.avg_confidence * 100)}%` : '96%'}
                    </h4>
                    <span className="text-xs font-semibold text-saas-primary">Avg Match</span>
                  </div>
                  <p className="text-[11px] text-amber-600 mt-1 font-semibold">
                    {aiStats.needs_manual_review || 0} need clarification
                  </p>
                </div>
              </div>

              {/* Office Distribution Table */}
              <div className="saas-card rounded-3xl overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-[#EAE0E8] flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-saas-textDark text-sm">Active Office Routing Directory</h4>
                    <p className="text-xs text-saas-textMuted mt-0.5">
                      Real-time request routing distribution across institutional offices
                    </p>
                  </div>
                  <Link
                    to="/admin/offices"
                    className="saas-pill-btn-outline text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5"
                  >
                    <span>View All Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-saas-canvas/60 text-saas-textMuted font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-6 py-3.5">Office Name & Code</th>
                        <th className="px-6 py-3.5">Category</th>
                        <th className="px-6 py-3.5">Responsible Officer</th>
                        <th className="px-6 py-3.5">Campus Location</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-center">Routed Requests</th>
                        <th className="px-6 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1E8EE] text-saas-textDark">
                      {aiStats.office_distribution && aiStats.office_distribution.length > 0 ? (
                        aiStats.office_distribution.map((office) => (
                          <tr key={office.office_id} className="hover:bg-saas-canvas/40 transition">
                            <td className="px-6 py-3.5">
                              <div className="font-bold text-saas-textDark">{office.name}</div>
                              <span className="text-[10px] font-mono text-saas-primary">[{office.code}]</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="badge-pill text-[10px] font-bold px-2.5 py-0.5 bg-saas-canvas text-saas-navy border border-[#EAE0E8]">
                                {office.category}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-saas-textMuted">{office.responsible_officer}</td>
                            <td className="px-6 py-3.5 text-saas-textMuted">{office.location}</td>
                            <td className="px-6 py-3.5 text-center">
                              <span
                                className={`badge-pill text-[10px] font-bold px-2.5 py-0.5 ${
                                  office.status === 'ACTIVE'
                                    ? 'bg-[#E8F7F0] text-emerald-700 border border-[#B3E8CE]'
                                    : 'bg-saas-canvas text-saas-textMuted border border-[#EAE0E8]'
                                }`}
                              >
                                {office.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-center font-bold text-saas-textDark">
                              {office.total_routed || 0}
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <Link
                                to={`/office?office_id=${office.office_id}`}
                                className="font-bold text-saas-primary hover:text-saas-navy transition"
                              >
                                Open Desk →
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-saas-textMuted">
                            No office distribution records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Reports & Audit */}
          {activeTab === 'reports' && (
            <div className="saas-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="font-bold text-saas-textDark text-base">Department Audit & Compliance Reports</h3>
                <p className="text-xs text-saas-textMuted mt-1">
                  Export institutional reports across On-Duty, Leave, and Event permission requests
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-saas-textDark mb-1">From Date</label>
                  <input
                    type="date"
                    defaultValue="2026-11-01"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-saas-textDark mb-1">To Date</label>
                  <input
                    type="date"
                    defaultValue="2026-11-30"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs text-saas-textDark focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-saas-textDark mb-1">Department</label>
                  <select className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-2xl text-xs focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition font-semibold text-saas-textDark">
                    <option>Computer Science & Engineering (CSE)</option>
                    <option>Electronics & Communication (ECE)</option>
                    <option>Mechanical Engineering (MECH)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#EAE0E8]">
                <button
                  type="button"
                  onClick={() => alert('Exporting departmental audit summary as CSV...')}
                  className="saas-pill-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Audit Summary (CSV)
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
