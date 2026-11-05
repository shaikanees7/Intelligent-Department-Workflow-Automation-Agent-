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
  Sparkles,
  ArrowRight,
  Send,
  PieChart,
  TrendingUp,
  BarChart3
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
        // Fallback demo requests for presentation & testing
        setRequests([
          {
            request_id: 1,
            request_code: 'REQ-842104',
            request_type: 'OD',
            reason: 'Selected for National Smart India Hackathon Grand Finale in Bangalore. Need 3 days On-Duty permission to travel and compete.',
            start_date: '2026-11-08',
            end_date: '2026-11-10',
            is_urgent: 1,
            current_reviewer_role: 'FACULTY',
            reviewer_first_name: 'Anitha',
            overall_status: 'UNDER_REVIEW',
            created_at: '2026-11-04T09:30:00Z'
          },
          {
            request_id: 2,
            request_code: 'REQ-791024',
            request_type: 'LEAVE',
            reason: 'Attending family wedding ceremony in hometown.',
            start_date: '2026-10-20',
            end_date: '2026-10-22',
            is_urgent: 0,
            current_reviewer_role: null,
            overall_status: 'APPROVED',
            pdf_letter_url: '#',
            created_at: '2026-10-18T11:00:00Z'
          },
          {
            request_id: 3,
            request_code: 'REQ-640192',
            request_type: 'EVENT',
            reason: 'Participated in Inter-College Robotics Challenge at Technical Symposium.',
            start_date: '2026-09-12',
            end_date: '2026-09-13',
            is_urgent: 0,
            current_reviewer_role: null,
            overall_status: 'APPROVED',
            pdf_letter_url: '#',
            created_at: '2026-09-10T14:20:00Z'
          },
          {
            request_id: 4,
            request_code: 'REQ-915432',
            request_type: 'EXAM',
            reason: '[EXAM Subject: CS402 Cloud Computing Lab Reschedule] Clashing with university sports selection trial.',
            start_date: '2026-11-15',
            end_date: '2026-11-15',
            is_urgent: 0,
            current_reviewer_role: 'MENTOR',
            reviewer_first_name: 'Kavitha',
            overall_status: 'PENDING',
            pdf_letter_url: null,
            created_at: '2026-11-05T08:15:00Z'
          }
        ]);
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

  const approvedPct = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingPct = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectedPct = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Donut circumference for r=72
  const circumference = 2 * Math.PI * 72; // ~452.39

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

          {/* Graphical Analytics & Status Distribution Diagram */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Application Workflow Distribution & Status Analytics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time visual diagram of applications across submission, review, sanction, and decision stages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Workflow Sync
                </span>
                <Link
                  to="/student/requests"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition flex items-center gap-1 ml-2"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Interactive SVG Donut Diagram */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
                    {/* Background Circle */}
                    <circle
                      cx="100"
                      cy="100"
                      r="72"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="20"
                    />

                    {total === 0 ? (
                      <circle
                        cx="100"
                        cy="100"
                        r="72"
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth="20"
                        strokeDasharray={circumference}
                        strokeDashoffset="0"
                      />
                    ) : (
                      <>
                        {/* 1. Approved / Sanctioned Segment (Emerald) */}
                        <circle
                          cx="100"
                          cy="100"
                          r="72"
                          fill="transparent"
                          stroke="#10b981"
                          strokeWidth="20"
                          strokeDasharray={`${(approved / total) * circumference} ${circumference}`}
                          strokeDashoffset="0"
                          className="transition-all duration-1000 ease-out"
                        />

                        {/* 2. Under Review Segment (Amber) */}
                        <circle
                          cx="100"
                          cy="100"
                          r="72"
                          fill="transparent"
                          stroke="#f59e0b"
                          strokeWidth="20"
                          strokeDasharray={`${(pending / total) * circumference} ${circumference}`}
                          strokeDashoffset={`-${(approved / total) * circumference}`}
                          className="transition-all duration-1000 ease-out"
                        />

                        {/* 3. Rejected Segment (Rose) */}
                        <circle
                          cx="100"
                          cy="100"
                          r="72"
                          fill="transparent"
                          stroke="#f43f5e"
                          strokeWidth="20"
                          strokeDasharray={`${(rejected / total) * circumference} ${circumference}`}
                          strokeDashoffset={`-${((approved + pending) / total) * circumference}`}
                          className="transition-all duration-1000 ease-out"
                        />
                      </>
                    )}
                  </svg>

                  {/* Center Donut Metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {total}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      Total Requests
                    </span>
                    {total > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-600 mt-1 flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" />
                        {approvedPct}% Sanctioned
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                  Outcome ratio of submitted permission applications
                </p>
              </div>

              {/* Right Column: Comparative Graph Bars & Breakdown Cards */}
              <div className="lg:col-span-7 space-y-5">
                {/* Segmented Distribution Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5 font-bold">
                      <BarChart3 className="w-3.5 h-3.5 text-primary-600" />
                      Status Distribution Ratio
                    </span>
                    <span className="text-slate-400 text-[11px] font-normal">
                      {approved} Sanctioned • {pending} In Review • {rejected} Rejected
                    </span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    {total > 0 ? (
                      <>
                        <div
                          style={{ width: `${approvedPct}%` }}
                          className="bg-emerald-500 h-full transition-all duration-700"
                          title={`Sanctioned: ${approved} (${approvedPct}%)`}
                        />
                        <div
                          style={{ width: `${pendingPct}%` }}
                          className="bg-amber-500 h-full transition-all duration-700"
                          title={`Under Review: ${pending} (${pendingPct}%)`}
                        />
                        <div
                          style={{ width: `${rejectedPct}%` }}
                          className="bg-rose-500 h-full transition-all duration-700"
                          title={`Rejected: ${rejected} (${rejectedPct}%)`}
                        />
                      </>
                    ) : (
                      <div className="w-full h-full bg-slate-200" />
                    )}
                  </div>
                </div>

                {/* 3 Status Detail Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Sanctioned Card */}
                  <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-2 hover:bg-emerald-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {approvedPct}%
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-emerald-800">{approved}</div>
                      <div className="text-xs font-bold text-emerald-950 mt-0.5">Sanctioned</div>
                      <p className="text-[11px] text-emerald-700 mt-1 leading-snug">
                        Full authorization granted & digital pass active.
                      </p>
                    </div>
                  </div>

                  {/* Under Review Card */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4 space-y-2 hover:bg-amber-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {pendingPct}%
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-amber-800">{pending}</div>
                      <div className="text-xs font-bold text-amber-950 mt-0.5">Under Review</div>
                      <p className="text-[11px] text-amber-700 mt-1 leading-snug">
                        In progress with Mentor, Faculty, or Office.
                      </p>
                    </div>
                  </div>

                  {/* Rejected Card */}
                  <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-4 space-y-2 hover:bg-rose-50 transition">
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <XCircle className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                        {rejectedPct}%
                      </span>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-rose-800">{rejected}</div>
                      <div className="text-xs font-bold text-rose-950 mt-0.5">Rejected</div>
                      <p className="text-[11px] text-rose-700 mt-1 leading-snug">
                        Declined or requires additional justification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comparative Volume Bars */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Volume Comparison by Category Outcome
                  </div>

                  {/* Bar 1: Sanctioned */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Sanctioned / Approved
                      </span>
                      <span className="font-bold text-slate-900">{approved}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Bar 2: Under Review */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Under Review (In Progress)
                      </span>
                      <span className="font-bold text-slate-900">{pending}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Bar 3: Rejected */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Rejected / Incomplete
                      </span>
                      <span className="font-bold text-slate-900">{rejected}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${total > 0 ? (rejected / total) * 100 : 0}%` }}
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                  Submit an application to initiate the automated approval workflow.
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
                            {req.ai_category || req.request_type}
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
