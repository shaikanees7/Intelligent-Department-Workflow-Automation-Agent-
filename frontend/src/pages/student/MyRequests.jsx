import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import {
  Files,
  Search,
  Activity,
  Download,
  FilePlus,
  ArrowRight,
  Filter,
  ExternalLink,
  Calendar
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#F6EFF2] text-[#261B50] font-sans relative selection:bg-[#B95BD5] selection:text-white overflow-x-hidden">
      <BlueprintWatermark />
      <Navbar />

      <div className="flex flex-col md:flex-row relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role="STUDENT" />

        <main className="flex-1 w-full space-y-6">
          <div className="bg-white/95 rounded-3xl border border-[#EAE0E8] shadow-card-soft p-6 sm:p-8 space-y-6 backdrop-blur-xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#F0E8EE] gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#261B50] tracking-tight">
                  My Permission Applications
                </h1>
                <p className="text-xs text-[#7C7390] mt-1">
                  Full history of On-Duty, Leave, and Event permission requests with live verification tracking
                </p>
              </div>
              <Link
                to="/student/new-request"
                className="saas-pill-btn-primary"
              >
                <FilePlus className="w-4 h-4" />
                <span>New Application</span>
              </Link>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-[#FAF5F7] p-4 rounded-3xl border border-[#EAE0E8] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#837B96] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by request code or reason..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE0E8] rounded-full text-xs focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] text-[#261B50] font-medium transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#EAE0E8] rounded-full text-xs text-[#261B50] font-bold focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] transition cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="OD">On-Duty (OD)</option>
                  <option value="LEAVE">Student Leave</option>
                  <option value="EVENT">Event Participation</option>
                  <option value="EXAM">Exam Permission</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-[#EAE0E8] rounded-full text-xs text-[#261B50] font-bold focus:ring-2 focus:ring-[#B95BD5]/30 focus:border-[#B95BD5] transition cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending / In Review</option>
                  <option value="APPROVED">Approved & Sanctioned</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* Requests Table */}
            <div className="border border-[#EAE0E8] rounded-3xl overflow-hidden shadow-card-soft bg-white">
              {loading ? (
                <div className="p-16 text-center text-xs font-bold text-[#837B96] space-y-2">
                  <div className="w-7 h-7 border-2 border-[#B95BD5] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading application records...</p>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="p-16 text-center text-xs text-[#7C7390] space-y-3">
                  <Files className="w-12 h-12 text-[#D8B8E8] mx-auto" />
                  <p className="font-bold text-[#261B50] text-sm">No applications match your filter.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('ALL');
                      setTypeFilter('ALL');
                    }}
                    className="saas-pill-btn-outline text-xs"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF5F7] text-[#837B96] font-bold border-b border-[#F0E8EE] uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-4 px-6">Request ID</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Purpose / Remarks</th>
                        <th className="py-4 px-6">Validity Dates</th>
                        <th className="py-4 px-6">Workflow Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0E8EE] text-[#4F4665]">
                      {filteredRequests.map((req) => (
                        <tr key={req.request_id} className="hover:bg-[#FAF5F7] transition">
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="font-mono font-bold text-[#261B50]">
                              {req.request_code}
                            </span>
                            {Boolean(req.is_urgent) && (
                              <span className="block mt-1 text-[9px] font-black text-[#E04F69] bg-[#FDEEF1] px-2 py-0.5 rounded-full border border-[#F9CAD3] text-center w-max">
                                URGENT
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="font-bold px-3 py-1 rounded-full text-[10px] bg-[#F4EBF7] text-[#8E32A8] border border-[#E8D1ED]">
                              {req.request_type}
                            </span>
                          </td>
                          <td className="py-4 px-6 max-w-sm">
                            <p className="line-clamp-2 font-medium text-[#261B50] leading-relaxed">
                              {req.reason}
                            </p>
                            <span className="text-[10px] text-[#837B96] block mt-1">
                              Submitted: {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap text-[#7C7390] font-medium">
                            {new Date(req.start_date).toLocaleDateString()} – {new Date(req.end_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <StatusBadge status={req.overall_status} size="sm" />
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap space-x-2">
                            <Link
                              to={`/student/track/${req.request_id}`}
                              className="inline-flex items-center gap-1 font-bold text-xs bg-[#F7EDFA] hover:bg-[#F3E8F6] text-[#B95BD5] px-3.5 py-1.5 rounded-full border border-[#E8D1ED] transition"
                            >
                              <Activity className="w-3.5 h-3.5" />
                              <span>Track Live</span>
                            </Link>

                            {req.overall_status === 'APPROVED' && req.pdf_letter_url && (
                              <a
                                href={req.pdf_letter_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-xs bg-[#E8F7F0] hover:bg-[#D2F2E3] text-[#1E9A68] px-3.5 py-1.5 rounded-full border border-[#B7E8D3] transition"
                                title="Download Official Permission Gate Pass"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Pass</span>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyRequests;
