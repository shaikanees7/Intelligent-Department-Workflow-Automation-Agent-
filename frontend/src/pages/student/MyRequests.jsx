import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import {
  Files,
  Search,
  Filter,
  Activity,
  Download,
  Calendar,
  AlertCircle,
  FilePlus,
  ArrowUpDown,
  ArrowRight
} from 'lucide-react';
import DukeButton from '../../components/duke/DukeButton';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await api.get('/requests/my');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setRequests(res.data.data);
        }
      } catch (err) {
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

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.request_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(r.overall_status)) ||
      r.overall_status === statusFilter;

    const matchesType = typeFilter === 'ALL' || r.request_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-900 gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                My Permission Applications
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Full history of On-Duty, Leave, and Event permission requests with live verification tracking
              </p>
            </div>
            <DukeButton to="/student/new-request" size="sm" icon={FilePlus}>
              New Application
            </DukeButton>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-zinc-950/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by code or reason..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900/80 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3.5 py-2 bg-zinc-900/80 border border-white/15 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
              >
                <option value="ALL" className="bg-zinc-900 text-white">All Categories</option>
                <option value="OD" className="bg-zinc-900 text-white">On-Duty (OD)</option>
                <option value="LEAVE" className="bg-zinc-900 text-white">Student Leave</option>
                <option value="EVENT" className="bg-zinc-900 text-white">Event Participation</option>
                <option value="EXAM" className="bg-zinc-900 text-white">Exam Permission</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 bg-zinc-900/80 border border-white/15 rounded-xl text-xs text-slate-200 font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition"
              >
                <option value="ALL" className="bg-zinc-900 text-white">All Statuses</option>
                <option value="PENDING" className="bg-zinc-900 text-white">Pending / Review</option>
                <option value="APPROVED" className="bg-zinc-900 text-white">Approved</option>
                <option value="REJECTED" className="bg-zinc-900 text-white">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-zinc-950/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Files className="w-10 h-10 text-slate-500 mx-auto" />
                <p className="font-serif text-base font-bold text-white">No applications match your criteria</p>
                <p className="text-xs text-slate-400">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-4 px-6">Request ID</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Subject / Reason</th>
                      <th className="py-4 px-6">Date Span</th>
                      <th className="py-4 px-6">Current Step</th>
                      <th className="py-4 px-6">Decision</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {filteredRequests.map((req) => (
                      <tr key={req.request_id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-white">
                          {req.request_code}
                          {Boolean(req.is_urgent) && (
                            <span className="ml-2 px-2 py-0.5 text-[9px] font-bold bg-rose-950/70 text-rose-300 rounded-full border border-rose-500/30">
                              Urgent
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold px-2.5 py-1 rounded-full text-[11px] bg-zinc-900 border border-white/10 text-blue-300">
                            {req.ai_category || req.request_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 max-w-sm">
                          <p className="truncate text-slate-300" title={req.reason}>
                            {req.reason}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                          {new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-200">
                            {req.overall_status === 'APPROVED'
                              ? 'Fully Sanctioned'
                              : req.overall_status === 'REJECTED'
                              ? 'Rejected'
                              : `${req.current_reviewer_role || 'Mentor'} Review`}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <StatusBadge status={req.overall_status} size="sm" />
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                          <Link
                            to={`/student/track/${req.request_id}`}
                            className="inline-flex items-center gap-1 font-bold text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            Track
                          </Link>
                          {req.overall_status === 'APPROVED' && req.pdf_letter_url && (
                            <a
                              href={`http://localhost:5000${req.pdf_letter_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-xs text-emerald-400 hover:text-emerald-300 transition-colors ml-2"
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

export default MyRequests;
