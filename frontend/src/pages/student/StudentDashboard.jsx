import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FilePlus,
  Files,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Download,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/requests/my');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setRequests(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load permission requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const total = requests.length;
  const approved = requests.filter((r) => r.overall_status === 'APPROVED').length;
  const rejected = requests.filter((r) => r.overall_status === 'REJECTED').length;
  const pending = requests.filter((r) => ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(r.overall_status)).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 rounded-2xl p-6 lg:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                Student Workflow Portal
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.first_name || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Department of {user?.department_name || 'Engineering'} • Section {user?.section || 'A'} •
                Reg: {user?.registration_number || 'N/A'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/student/new-request"
                className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition"
              >
                <FilePlus className="w-4 h-4" />
                Submit Permission Request
              </Link>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{total}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Files className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Under Review</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{pending}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sanctioned / Approved</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{approved}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">Rejected</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">{rejected}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Submission Cards for 3 Types */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Request Types & Permissions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                to="/student/new-request?type=OD"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-primary-400 hover:shadow-md transition group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-primary-700 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-primary-700 transition">
                  On-Duty (OD) Request
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Academic competitions, external hackathons, industrial visits, and conference attendance.
                </p>
                <div className="text-xs font-bold text-primary-600 flex items-center gap-1">
                  Apply OD <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                to="/student/new-request?type=LEAVE"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-primary-400 hover:shadow-md transition group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition">
                  Student Leave Request
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Personal emergencies, family obligations, and medical leave with doctor certificate.
                </p>
                <div className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                  Apply Leave <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                to="/student/new-request?type=EVENT"
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-primary-400 hover:shadow-md transition group space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-slate-900 group-hover:text-purple-700 transition">
                  Event Participation
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  College fest coordination, sports tournaments, technical workshops, and club activities.
                </p>
                <div className="text-xs font-bold text-purple-600 flex items-center gap-1">
                  Apply Event <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Applications List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recent Permission Applications</h3>
                <p className="text-xs text-slate-500">Track current review authority and decision status</p>
              </div>
              <Link
                to="/student/requests"
                className="text-xs font-bold text-primary-600 hover:text-primary-800"
              >
                View All ({requests.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading your applications...</div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Send className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No applications submitted yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Submit an On-Duty, Leave, or Event permission request to initiate the automated approval workflow.
                </p>
                <Link
                  to="/student/new-request"
                  className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Create Your First Request
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-6">Request ID</th>
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6">Reason / Subject</th>
                      <th className="py-3.5 px-6">Duration</th>
                      <th className="py-3.5 px-6">Current Reviewer</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.request_id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {req.request_code}
                          {Boolean(req.is_urgent) && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded border border-red-200">
                              Urgent
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-800">
                            {req.request_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 max-w-xs truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                          {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          {req.overall_status === 'APPROVED' ? (
                            <span className="text-emerald-700 font-semibold">Completed</span>
                          ) : req.overall_status === 'REJECTED' ? (
                            <span className="text-rose-600 font-semibold">Stopped</span>
                          ) : (
                            <span className="font-semibold text-slate-800">
                              {req.current_reviewer_role || 'Mentor'}
                              {req.reviewer_first_name && ` (${req.reviewer_first_name})`}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <StatusBadge status={req.overall_status} size="sm" />
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                          <Link
                            to={`/student/track/${req.request_id}`}
                            className="inline-flex items-center gap-1 font-bold text-xs text-primary-600 hover:text-primary-800"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            Track
                          </Link>
                          {req.overall_status === 'APPROVED' && req.pdf_letter_url && (
                            <a
                              href={`http://localhost:5000${req.pdf_letter_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-xs text-emerald-600 hover:text-emerald-800"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Pass
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
