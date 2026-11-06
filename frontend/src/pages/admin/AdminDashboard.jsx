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
  Power,
  KeyRound,
  Edit3,
  Copy,
  Check,
  X,
  UserCheck,
  UserX,
  FileText,
  AlertTriangle,
  GraduationCap,
  ShieldAlert,
  Loader2
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

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'allocations' | 'workflows' | 'ai_offices' | 'audit'
  const [usersList, setUsersList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [offices, setOffices] = useState([]);
  const [assignments, setAssignments] = useState({ section_mentors: [], faculty_roster: [], office_staff: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_count: 0,
    total_users: 0,
    total_students: 0,
    total_hods: 0,
    total_mentors: 0,
    total_faculty: 0,
    total_office_staff: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showSectionAssignModal, setShowSectionAssignModal] = useState(false);
  const [sectionAssignForm, setSectionAssignForm] = useState({
    department_id: '1',
    section: 'A',
    mentor_user_id: ''
  });

  // Staff creation form state
  const [staffForm, setStaffForm] = useState({
    role: 'HOD',
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    departmentId: '1',
    designation: '',
    assignedResponsibilities: '',
    assignedSections: ['A'],
    officeId: '1'
  });
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [staffFormError, setStaffFormError] = useState('');

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes, deptRes, assignRes, auditRes, officesRes] = await Promise.allSettled([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/departments'),
        api.get('/admin/assignments'),
        api.get('/admin/audit-logs'),
        api.get('/offices')
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value.data?.success) {
        setUsersList(usersRes.value.data.data);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.data?.success) {
        setStats(statsRes.value.data.data);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value.data?.success) {
        setDepartments(deptRes.value.data.data);
      }
      if (assignRes.status === 'fulfilled' && assignRes.value.data?.success) {
        setAssignments(assignRes.value.data.data);
      }
      if (auditRes.status === 'fulfilled' && auditRes.value.data?.success) {
        setAuditLogs(auditRes.value.data.data);
      }
      if (officesRes.status === 'fulfilled' && officesRes.value.data?.success) {
        setOffices(officesRes.value.data.data);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const empId = (u.employee_id || '').toLowerCase();
    const regNo = (u.registration_number || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(query) || email.includes(query) || empId.includes(query) || regNo.includes(query);

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'STAFF' && ['HOD', 'MENTOR', 'FACULTY', 'OFFICE_ADMIN', 'OFFICE_STAFF'].includes(u.role)) ||
      u.role === roleFilter;

    const matchesDept = deptFilter === 'ALL' || String(u.department_id) === String(deptFilter);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.is_active === 1) ||
      (statusFilter === 'INACTIVE' && u.is_active === 0);

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  // Handle staff creation submit
  const handleCreateStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffFormError('');
    setCreatingStaff(true);

    try {
      const payload = {
        role: staffForm.role,
        fullName: staffForm.fullName.trim(),
        email: staffForm.email.trim(),
        phone: staffForm.phone.trim(),
        employeeId: staffForm.employeeId.trim(),
        departmentId: parseInt(staffForm.departmentId),
        designation: staffForm.designation.trim(),
        assignedResponsibilities: staffForm.assignedResponsibilities.trim(),
        assignedSections: staffForm.assignedSections,
        officeId: parseInt(staffForm.officeId)
      };

      const res = await api.post('/admin/users/staff', payload);

      if (res.data?.success && res.data?.data) {
        setCreatedCredentials(res.data.data.credentials);
        setShowCreateModal(false);
        setShowCredentialsModal(true);
        // Refresh users list & stats
        loadData();
      } else {
        setStaffFormError(res.data?.message || 'Failed to create staff account.');
      }
    } catch (err) {
      console.error('[CreateStaff] Error:', err);
      setStaffFormError(err.response?.data?.message || 'Error creating staff account. Please verify details.');
    } finally {
      setCreatingStaff(false);
    }
  };

  // Toggle user status
  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.user_id}/status`, {
        is_active: user.is_active ? 0 : 1
      });
      loadData();
    } catch (err) {
      alert('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  // Reset user password
  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.first_name} ${user.last_name} (${user.email})? A secure temporary password will be generated.`)) {
      return;
    }

    try {
      const res = await api.post(`/admin/users/${user.user_id}/reset-password`);
      if (res.data?.success) {
        setCreatedCredentials({
          ...res.data.data,
          role: user.role,
          employee_id: user.employee_id
        });
        setShowCredentialsModal(true);
      }
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
    }
  };

  // Copy credentials helper
  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `IDWAA Institutional Account Credentials:\nRole: ${createdCredentials.role}\nEmail: ${createdCredentials.email}\nEmployee ID: ${createdCredentials.employee_id || 'N/A'}\nTemporary Password: ${createdCredentials.temporary_password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Section assignment submit
  const handleSectionAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/assignments/mentor-section', sectionAssignForm);
      setShowSectionAssignModal(false);
      loadData();
    } catch (err) {
      alert('Failed to assign section: ' + (err.response?.data?.message || err.message));
    }
  };

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
                <span className="p-2.5 bg-[#F4EBF7] text-[#B95BD5] rounded-2xl shadow-xs">
                  <Shield className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black text-[#261B50] tracking-tight">
                      University Administration & User Hub
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-[#261B50] text-[11px] font-bold">
                      Root Controller
                    </span>
                  </div>
                  <p className="text-xs text-[#7C7390] mt-0.5">
                    Centralized account provisioning, role enforcement, department mapping, and audit governance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setStaffFormError('');
                  setShowCreateModal(true);
                }}
                className="saas-pill-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Provision Staff Account</span>
              </button>
            </div>
          </div>

          {/* System Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-[#7C7390] uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-black text-[#261B50] mt-1">{stats.total_users || usersList.length}</h3>
            </div>
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-[#B95BD5] uppercase tracking-wider">Students</p>
              <h3 className="text-2xl font-black text-[#B95BD5] mt-1">{stats.total_students || 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-[#261B50] uppercase tracking-wider">Mentors</p>
              <h3 className="text-2xl font-black text-[#261B50] mt-1">{stats.total_mentors || 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-[#261B50] uppercase tracking-wider">Faculty</p>
              <h3 className="text-2xl font-black text-[#261B50] mt-1">{stats.total_faculty || 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-[#261B50] uppercase tracking-wider">HODs</p>
              <h3 className="text-2xl font-black text-[#261B50] mt-1">{stats.total_hods || 0}</h3>
            </div>
            <div className="saas-card rounded-3xl p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Office Staff</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.total_office_staff || 0}</h3>
            </div>
          </div>

          {/* Institutional Analytics Pie Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatsPieChartCard
              title="Institution-Wide Application Clearances"
              subtitle="All student permission applications evaluated by AI and university workflow"
              total={stats.total_requests || 0}
              totalLabel="Total"
              badge="Live Status"
              items={[
                { label: 'Sanctioned & Generated', count: stats.approved_count || 0, color: '#238B62' },
                { label: 'In Review Queue', count: stats.pending_count || 0, color: '#D69B35' },
                { label: 'Rejected with Remarks', count: stats.rejected_count || 0, color: '#D65B70' }
              ]}
              showWaveform={true}
            />

            <StatsPieChartCard
              title="Verified User Roster by Institutional Role"
              subtitle="Breakdown of enrolled university accounts managed centrally"
              total={stats.total_users || usersList.length}
              totalLabel="Accounts"
              badge="RBAC Distribution"
              items={[
                { label: 'Students', count: stats.total_students || 0, color: '#B95BD5' },
                { label: 'Mentors & Faculty', count: (stats.total_mentors || 0) + (stats.total_faculty || 0), color: '#261B50' },
                { label: 'HODs & Offices', count: (stats.total_hods || 0) + (stats.total_office_staff || 0), color: '#D8B8E8' }
              ]}
              showWaveform={true}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <Users className="w-4 h-4" />
              User Management ({usersList.length})
            </button>

            <button
              onClick={() => setActiveTab('allocations')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'allocations'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <Layers className="w-4 h-4" />
              Section & Mentor Mappings ({assignments.section_mentors?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'workflows'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Workflow Sequences (4)
            </button>

            <button
              onClick={() => setActiveTab('ai_offices')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'ai_offices'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#B95BD5]" />
              University Offices ({offices.length || 10})
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'bg-white text-[#261B50] hover:bg-[#F4EBF7] border border-[#EAE0E8]'
              }`}
            >
              <FileText className="w-4 h-4" />
              Security Audit Trail ({auditLogs.length})
            </button>
          </div>

          {/* TAB 1: User Management */}
          {activeTab === 'users' && (
            <div className="saas-card rounded-3xl overflow-hidden space-y-4">
              {/* Filter & Search Bar */}
              <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[#EAE0E8]">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#837B96] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search name, email, Employee ID, or Reg No..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5]/20 focus:border-[#B95BD5] focus:outline-none transition"
                  />
                </div>

                <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs font-semibold text-[#261B50] focus:outline-none"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="STAFF">All Staff Members</option>
                    <option value="STUDENT">Students</option>
                    <option value="MENTOR">Mentors</option>
                    <option value="FACULTY">Faculty Members</option>
                    <option value="HOD">Heads of Department (HOD)</option>
                    <option value="OFFICE_ADMIN">Office Staff</option>
                    <option value="ADMIN">University Admins</option>
                  </select>

                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs font-semibold text-[#261B50] focus:outline-none"
                  >
                    <option value="ALL">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-[#EAE0E8] rounded-full text-xs font-semibold text-[#261B50] focus:outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Accounts</option>
                    <option value="INACTIVE">Deactivated Accounts</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-6">Role & Designation</th>
                      <th className="py-3.5 px-6">Department / Office</th>
                      <th className="py-3.5 px-6">ID & Academic Info</th>
                      <th className="py-3.5 px-6 text-center">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => (
                        <tr key={u.user_id} className="hover:bg-[#FAF5F8]/60 transition">
                          <td className="py-4 px-6">
                            <div className="font-bold text-[#261B50]">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-[11px] font-mono text-[#837B96]">{u.email}</div>
                            {u.phone && <div className="text-[10px] text-[#837B96]">{u.phone}</div>}
                          </td>

                          <td className="py-4 px-6">
                            <span className="badge-pill font-bold px-2.5 py-0.5 bg-[#FAF5F8] text-[#261B50] border border-[#EAE0E8] text-[10px]">
                              {u.role}
                            </span>
                            {u.designation && (
                              <div className="text-[11px] text-[#7C7390] mt-0.5">{u.designation}</div>
                            )}
                          </td>

                          <td className="py-4 px-6">
                            <div className="font-semibold text-[#261B50]">
                              {u.office_name || u.department_name || 'Central Administration'}
                            </div>
                            {u.department_code && (
                              <span className="text-[10px] text-[#837B96]">[{u.department_code}]</span>
                            )}
                          </td>

                          <td className="py-4 px-6 font-mono text-xs">
                            {u.role === 'STUDENT' ? (
                              <div>
                                <span className="font-bold text-[#B95BD5]">{u.registration_number || 'N/A'}</span>
                                <div className="text-[10px] text-[#837B96]">Section {u.section || 'A'} • Sem {u.semester || 6}</div>
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-[#261B50]">{u.employee_id || 'N/A'}</span>
                                {u.must_change_password === 1 && (
                                  <div className="text-[10px] text-[#E58B24] font-semibold">Temp Password</div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(u)}
                              title="Click to toggle account status"
                              className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full border cursor-pointer transition ${
                                u.is_active
                                  ? 'text-emerald-700 bg-[#E8F7F0] border-[#B3E8CE] hover:bg-[#D4F3E4]'
                                  : 'text-rose-700 bg-[#FDEEF1] border-[#F9CAD3] hover:bg-[#FADDE3]'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              {u.is_active ? 'Active' : 'Deactivated'}
                            </button>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              {u.role !== 'STUDENT' && (
                                <button
                                  type="button"
                                  onClick={() => handleResetPassword(u)}
                                  title="Reset staff password"
                                  className="p-1.5 rounded-xl hover:bg-[#FAF5F8] text-[#837B96] hover:text-[#B95BD5] transition cursor-pointer"
                                >
                                  <KeyRound className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUser(u);
                                  setShowEditModal(true);
                                }}
                                title="Edit user details"
                                className="p-1.5 rounded-xl hover:bg-[#FAF5F8] text-[#837B96] hover:text-[#261B50] transition cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#837B96]">
                          No user records match the selected search and filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Section & Mentor Mappings */}
          {activeTab === 'allocations' && (
            <div className="space-y-6">
              <div className="saas-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#261B50] text-base">Department & Section Mentor Allocations</h3>
                  <p className="text-xs text-[#7C7390] mt-1">
                    When students submit applications, the system automatically binds them to their assigned section mentor from the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSectionAssignModal(true)}
                  className="saas-pill-btn-primary text-xs px-4 py-2 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Mentor to Section</span>
                </button>
              </div>

              <div className="saas-card rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Department</th>
                      <th className="py-3.5 px-6">Section</th>
                      <th className="py-3.5 px-6">Assigned Mentor</th>
                      <th className="py-3.5 px-6">Contact Email</th>
                      <th className="py-3.5 px-6 text-center">Enrolled Students</th>
                      <th className="py-3.5 px-6 text-right">Academic Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                    {assignments.section_mentors && assignments.section_mentors.length > 0 ? (
                      assignments.section_mentors.map((sm) => (
                        <tr key={sm.assignment_id} className="hover:bg-[#FAF5F8]/60 transition">
                          <td className="py-4 px-6 font-bold text-[#261B50]">
                            {sm.department_name} ({sm.department_code})
                          </td>
                          <td className="py-4 px-6">
                            <span className="badge-pill font-mono font-black text-xs px-3 py-1 bg-[#FAF5F8] text-[#B95BD5] border border-[#EAE0E8]">
                              Section {sm.section}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-[#261B50]">
                            {sm.mentor_first_name} {sm.mentor_last_name}
                          </td>
                          <td className="py-4 px-6 font-mono text-[#837B96]">{sm.mentor_email}</td>
                          <td className="py-4 px-6 text-center font-bold text-[#261B50]">{sm.student_count || 0}</td>
                          <td className="py-4 px-6 text-right font-mono text-[#837B96]">{sm.academic_year || '2025-2026'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#837B96]">
                          No section mentor mappings configured yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Workflow Sequences */}
          {activeTab === 'workflows' && (
            <div className="space-y-6">
              <div className="saas-card rounded-3xl p-6 sm:p-7">
                <h3 className="font-bold text-[#261B50] text-base">Multi-Level Institutional Approval Sequences</h3>
                <p className="text-xs text-[#7C7390] mt-1">
                  Each permission type executes an automated multi-tier approval chain. Applications dynamically flow from Student → Mentor → Faculty → HOD or University Office.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {WORKFLOWS_DATA.map((wf) => (
                  <div key={wf.type} className="saas-card rounded-3xl p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#EAE0E8] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#261B50] text-sm">{wf.title}</span>
                          <span className="badge-pill text-[10px] font-bold px-2.5 py-0.5 bg-[#F4EBF7] text-[#B95BD5]">
                            {wf.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#7C7390] mt-0.5">{wf.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Sequence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      {wf.steps.map((st) => (
                        <div key={st.step} className="p-3.5 bg-[#FAF5F8] rounded-2xl border border-[#EAE0E8] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#837B96] uppercase">Step {st.step}</span>
                            <span className="badge-pill text-[10px] font-bold px-2 py-0.2 bg-white text-[#261B50] border border-[#EAE0E8]">
                              {st.role}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#261B50]">{st.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: University Offices */}
          {activeTab === 'ai_offices' && (
            <div className="space-y-6">
              <div className="saas-dark-card rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#B95BD5]/20 text-[#D8B8E8] border border-[#B95BD5]/30 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> Groq AI Ultra-Fast LPU Routing Engine
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    University Office Desks & AI Neural Routing
                  </h3>
                  <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                    Student applications with specialized intents (Transport, Exam Cell, Hostel, Finance, Placements) are automatically classified and dispatched to these registered office desks.
                  </p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <Link
                    to="/admin/offices"
                    className="saas-pill-btn-outline border-white/20 text-white hover:bg-white/10 text-xs px-5 py-2.5 inline-flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-[#D8B8E8]" />
                    Manage University Offices
                  </Link>
                  <Link
                    to="/office"
                    className="saas-pill-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Open Office Desk
                  </Link>
                </div>
              </div>

              <div className="saas-card rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-6 py-3.5">Office Name & Code</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Responsible Officer</th>
                      <th className="px-6 py-3.5">Campus Location</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                    {offices.map((office) => (
                      <tr key={office.office_id} className="hover:bg-[#FAF5F8]/60 transition">
                        <td className="px-6 py-3.5">
                          <div className="font-bold text-[#261B50]">{office.name}</div>
                          <span className="text-[10px] font-mono text-[#B95BD5]">[{office.code}]</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="badge-pill text-[10px] font-bold px-2.5 py-0.5 bg-[#FAF5F8] text-[#261B50] border border-[#EAE0E8]">
                            {office.category}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[#7C7390]">{office.responsible_officer}</td>
                        <td className="px-6 py-3.5 text-[#7C7390]">{office.location}</td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="badge-pill text-[10px] font-bold px-2.5 py-0.5 bg-[#E8F7F0] text-emerald-700 border border-[#B3E8CE]">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            to={`/office?office_id=${office.office_id}`}
                            className="font-bold text-[#B95BD5] hover:text-[#261B50] transition"
                          >
                            Open Desk →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Security Audit Trail */}
          {activeTab === 'audit' && (
            <div className="saas-card rounded-3xl overflow-hidden space-y-4">
              <div className="p-5 border-b border-[#EAE0E8]">
                <h3 className="font-bold text-[#261B50] text-base">Cryptographic & Security Audit Trail</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  Permanent institutional log of user logins, account creations, workflow decisions, and security modifications
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF5F8] text-[#837B96] font-bold border-b border-[#EAE0E8] uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-6">Timestamp</th>
                      <th className="py-3 px-6">Actor</th>
                      <th className="py-3 px-6">Action</th>
                      <th className="py-3 px-6">Entity</th>
                      <th className="py-3 px-6">Details</th>
                      <th className="py-3 px-6 text-right">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1E8EE] text-[#261B50]">
                    {auditLogs.length > 0 ? (
                      auditLogs.map((log) => (
                        <tr key={log.log_id} className="hover:bg-[#FAF5F8]/60 transition">
                          <td className="py-3.5 px-6 font-mono text-[11px] text-[#7C7390]">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="font-bold text-[#261B50]">
                              {log.first_name ? `${log.first_name} ${log.last_name || ''}` : `User #${log.user_id || 'System'}`}
                            </span>
                            {log.role && <span className="text-[10px] text-[#837B96] block">{log.role}</span>}
                          </td>
                          <td className="py-3.5 px-6">
                            <span className="font-mono font-bold text-[11px] text-[#B95BD5] bg-[#F4EBF7] px-2 py-0.5 rounded-md border border-[#EAE0E8]">
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-[11px] text-[#7C7390]">
                            {log.entity_type} #{log.entity_id || ''}
                          </td>
                          <td className="py-3.5 px-6 text-[11px] text-[#4F4665] max-w-xs truncate">
                            {typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || '—')}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono text-[11px] text-[#837B96]">
                            {log.ip_address || '127.0.0.1'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-[#837B96]">
                          No audit trail records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: Dynamic Staff Account Creation Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 text-[#261B50] shadow-2xl border border-[#EAE0E8] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F4EBF7] text-[#B95BD5]">
                  Centralized Staff Provisioning
                </span>
                <h3 className="text-xl font-black text-[#261B50] mt-1">Provision Institutional Staff Account</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  The backend will automatically generate a secure temporary password and unique employee credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#FAF5F8] text-[#837B96] hover:text-[#261B50] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {staffFormError && (
              <div className="p-3.5 bg-[#FDEEF1] border border-[#F9CAD3] rounded-2xl text-xs font-bold text-[#E04F69]">
                {staffFormError}
              </div>
            )}

            <form onSubmit={handleCreateStaffSubmit} className="space-y-4">
              {/* Role Selection Pills */}
              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1.5">Designated Institutional Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { role: 'HOD', label: 'Head of Department' },
                    { role: 'MENTOR', label: 'Academic Mentor' },
                    { role: 'FACULTY', label: 'Faculty Coordinator' },
                    { role: 'OFFICE_ADMIN', label: 'University Office Staff' }
                  ].map((r) => (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => setStaffForm({ ...staffForm, role: r.role })}
                      className={`p-2.5 rounded-2xl border text-center text-xs font-bold transition cursor-pointer ${
                        staffForm.role === r.role
                          ? 'bg-[#261B50] text-white border-[#261B50] shadow-xs'
                          : 'bg-[#FAF5F8] text-[#261B50] border-[#EAE0E8] hover:bg-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Fields: Name, Email, Phone, Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={staffForm.fullName}
                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">Official Institutional Email *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    required
                    placeholder="e.g. rajesh.sharma@institution.edu"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">Employee ID (Optional / Auto-Gen)</label>
                  <input
                    type="text"
                    value={staffForm.employeeId}
                    onChange={(e) => setStaffForm({ ...staffForm, employeeId: e.target.value })}
                    placeholder="e.g. EMP-CSE-045"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] font-mono focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] focus:ring-2 focus:ring-[#B95BD5] focus:outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Fields based on Role */}
              {/* DYNAMIC CASE 1: HOD */}
              {staffForm.role === 'HOD' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF5F8] border border-[#EAE0E8]">
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Assigned Department *</label>
                    <select
                      value={staffForm.departmentId}
                      onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] font-semibold"
                    >
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Official Designation</label>
                    <input
                      type="text"
                      value={staffForm.designation}
                      onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                      placeholder="Head of Department & Professor"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50]"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC CASE 2: MENTOR */}
              {staffForm.role === 'MENTOR' && (
                <div className="space-y-4 p-4 rounded-2xl bg-[#FAF5F8] border border-[#EAE0E8]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1">Department *</label>
                      <select
                        value={staffForm.departmentId}
                        onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] font-semibold"
                      >
                        {departments.map((d) => (
                          <option key={d.department_id} value={d.department_id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#261B50] mb-1">Designation</label>
                      <input
                        type="text"
                        value={staffForm.designation}
                        onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                        placeholder="Senior Assistant Professor"
                        className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1.5">
                      Assigned Student Sections (Select all that apply)
                    </label>
                    <div className="flex gap-2">
                      {['A', 'B', 'C', 'D'].map((sec) => {
                        const isSelected = staffForm.assignedSections.includes(sec);
                        return (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => {
                              const next = isSelected
                                ? staffForm.assignedSections.filter((s) => s !== sec)
                                : [...staffForm.assignedSections, sec];
                              setStaffForm({ ...staffForm, assignedSections: next });
                            }}
                            className={`w-12 h-10 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#B95BD5] text-white border-[#B95BD5]'
                                : 'bg-white text-[#261B50] border-[#EAE0E8] hover:bg-[#FAF5F8]'
                            }`}
                          >
                            Sec {sec}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-[#7C7390] mt-1">
                      Students in these sections will automatically have their permission applications routed to this mentor.
                    </p>
                  </div>
                </div>
              )}

              {/* DYNAMIC CASE 3: FACULTY */}
              {staffForm.role === 'FACULTY' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF5F8] border border-[#EAE0E8]">
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Department *</label>
                    <select
                      value={staffForm.departmentId}
                      onChange={(e) => setStaffForm({ ...staffForm, departmentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] font-semibold"
                    >
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Subjects / Responsibilities</label>
                    <input
                      type="text"
                      value={staffForm.assignedResponsibilities}
                      onChange={(e) => setStaffForm({ ...staffForm, assignedResponsibilities: e.target.value })}
                      placeholder="e.g. Distributed Systems Lab Coordinator"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50]"
                    />
                  </div>
                </div>
              )}

              {/* DYNAMIC CASE 4: UNIVERSITY OFFICE STAFF */}
              {staffForm.role === 'OFFICE_ADMIN' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF5F8] border border-[#EAE0E8]">
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Assigned University Office *</label>
                    <select
                      value={staffForm.officeId}
                      onChange={(e) => setStaffForm({ ...staffForm, officeId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50] font-semibold"
                    >
                      {offices.map((off) => (
                        <option key={off.office_id} value={off.office_id}>
                          {off.name} ({off.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#261B50] mb-1">Office Designation</label>
                    <input
                      type="text"
                      value={staffForm.designation}
                      onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                      placeholder="e.g. Transport Manager / Chief Warden"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#EAE0E8] rounded-xl text-xs text-[#261B50]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#F0E8EE] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="saas-pill-btn-outline text-xs px-5 py-2.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStaff}
                  className="saas-pill-btn-primary text-xs px-6 py-2.5 cursor-pointer flex items-center gap-2"
                >
                  {creatingStaff ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4" />}
                  <span>Generate Account & Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: One-Time Credentials Reveal Screen */}
      {showCredentialsModal && createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 text-[#261B50] shadow-2xl border border-[#B7E8D3]">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F7F0] text-emerald-700 border border-[#B3E8CE] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E8F7F0] text-emerald-700">
                  Account Ready & Active
                </span>
                <h3 className="text-xl font-black text-[#261B50] mt-1">Temporary Credentials Generated</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  Share these credentials securely with the staff member. They will be required to change this temporary password on their first login.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#FAF5F8] border border-[#EAE0E8] rounded-2xl space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#F0E8EE]">
                <span className="text-[#837B96] font-sans font-bold">Assigned Role:</span>
                <span className="font-bold text-[#B95BD5]">{createdCredentials.role}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#F0E8EE]">
                <span className="text-[#837B96] font-sans font-bold">Official Email:</span>
                <span className="font-bold text-[#261B50]">{createdCredentials.email}</span>
              </div>
              {createdCredentials.employee_id && (
                <div className="flex justify-between items-center py-1 border-b border-[#F0E8EE]">
                  <span className="text-[#837B96] font-sans font-bold">Employee ID:</span>
                  <span className="font-bold text-[#261B50]">{createdCredentials.employee_id}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1 bg-white p-2 rounded-xl border border-[#B95BD5]/30">
                <span className="text-[#837B96] font-sans font-bold">Temporary Password:</span>
                <span className="font-black text-[#B95BD5] text-sm select-all">{createdCredentials.temporary_password}</span>
              </div>
            </div>

            <div className="p-3 bg-[#FEF6EB] border border-[#FCE1C2] rounded-xl text-xs text-[#A06C1C] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Security Alert:</strong> For cybersecurity compliance, this temporary password will never be displayed in plain-text again. Please copy and record it now.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="saas-pill-btn-outline text-xs px-4 py-2 cursor-pointer inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCredentialsModal(false);
                  setCreatedCredentials(null);
                }}
                className="saas-pill-btn-primary text-xs px-5 py-2 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Assign Mentor to Section */}
      {showSectionAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-[#261B50] shadow-2xl border border-[#EAE0E8]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-[#261B50]">Map Mentor to Section</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">
                  Connect a student section directly to an academic mentor for automated workflow routing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSectionAssignModal(false)}
                className="p-1 rounded-xl text-[#837B96] hover:text-[#261B50]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSectionAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Department</label>
                <select
                  value={sectionAssignForm.department_id}
                  onChange={(e) => setSectionAssignForm({ ...sectionAssignForm, department_id: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Section</label>
                <select
                  value={sectionAssignForm.section}
                  onChange={(e) => setSectionAssignForm({ ...sectionAssignForm, section: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs font-bold"
                >
                  {['A', 'B', 'C', 'D', 'E'].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Academic Mentor</label>
                <select
                  value={sectionAssignForm.mentor_user_id}
                  onChange={(e) => setSectionAssignForm({ ...sectionAssignForm, mentor_user_id: e.target.value })}
                  required
                  className="w-full px-3.5 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs font-semibold"
                >
                  <option value="">Select an Academic Mentor...</option>
                  {usersList
                    .filter((u) => u.role === 'MENTOR')
                    .map((m) => (
                      <option key={m.user_id} value={m.user_id}>
                        {m.first_name} {m.last_name} ({m.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSectionAssignModal(false)}
                  className="saas-pill-btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="saas-pill-btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  Save Section Mapping
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit User Details */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 space-y-5 text-[#261B50] shadow-2xl border border-[#EAE0E8]">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-black text-[#261B50]">Edit User Information</h3>
                <p className="text-xs text-[#7C7390] mt-0.5">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-xl text-[#837B96] hover:text-[#261B50]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api.put(`/admin/users/${editingUser.user_id}`, editingUser);
                  setShowEditModal(false);
                  loadData();
                } catch (err) {
                  alert('Error updating user: ' + (err.response?.data?.message || err.message));
                }
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingUser.first_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#261B50] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.last_name || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Phone</label>
                <input
                  type="text"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#261B50] mb-1">Department</label>
                <select
                  value={editingUser.department_id || 1}
                  onChange={(e) => setEditingUser({ ...editingUser, department_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF5F8] border border-[#EAE0E8] rounded-xl text-xs font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="saas-pill-btn-outline text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="saas-pill-btn-primary text-xs px-5 py-2 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
