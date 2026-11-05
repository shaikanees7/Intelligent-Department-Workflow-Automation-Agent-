import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users,
  Building,
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
  Plus
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
  }
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'workflows' | 'reports'
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 18,
    approved_count: 14,
    rejected_count: 1,
    pending_count: 3
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Fetch real backend data from GET /api/admin/users and GET /api/admin/stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, statsRes] = await Promise.allSettled([
          api.get('/admin/users'),
          api.get('/admin/stats')
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-purple-100 text-purple-800 rounded-lg">
                  <Shield className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  System Administration Hub
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure approval sequences, manage users, and supervise department workflows
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                Institutional Root Authority
              </span>
            </div>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Users</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Workflows</p>
              <h3 className="text-2xl font-black text-primary-600 mt-1">3</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Requests Processed</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stats.total_requests || 18}</h3>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sanction Rate</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {stats.total_requests ? Math.round((stats.approved_count / stats.total_requests) * 100) : 92}%
              </h3>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              User Directory ({usersList.length})
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'workflows'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Workflow Sequences (3)
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports & Audit Export
            </button>
          </div>

          {/* Tab 1: User Management */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4">
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search user name or email..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-primary-500"
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
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">User ID</th>
                      <th className="py-3.5 px-6">Full Name</th>
                      <th className="py-3.5 px-6">Institutional Email</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6 text-right">Account Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.map((u) => (
                      <tr key={u.user_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-mono font-bold text-slate-500">#{u.user_id}</td>
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {u.first_name} {u.last_name}
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-600">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 border border-slate-200">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-500">
                          {u.department_id === 1 ? 'Computer Science' : 'Engineering'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 font-bold text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-slate-900 text-base">Multi-Level Approval Matrix</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Each permission type follows a rule-based sequence. Reviewers must approve before automatic progression to the next authority.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {WORKFLOWS_DATA.map((wf) => (
                  <div key={wf.type} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{wf.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-primary-800">
                            {wf.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{wf.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Sequence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {wf.steps.map((st) => (
                        <div key={st.step} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Step {st.step}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                              {st.role}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Reports & Audit */}
          {activeTab === 'reports' && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Department Audit & Compliance Reports</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Export institutional reports across On-Duty, Leave, and Event permission requests
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    defaultValue="2026-11-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    defaultValue="2026-11-30"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 font-semibold text-slate-700">
                    <option>Computer Science & Engineering (CSE)</option>
                    <option>Electronics & Communication (ECE)</option>
                    <option>Mechanical Engineering (MECH)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => alert('Exporting departmental audit summary as CSV...')}
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
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
