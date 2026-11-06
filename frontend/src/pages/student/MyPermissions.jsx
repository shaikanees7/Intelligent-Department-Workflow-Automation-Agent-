import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatusBadge from '../../components/common/StatusBadge';
import PermissionDetailsModal from '../../components/pass/PermissionDetailsModal';
import DigitalPassModal from '../../components/pass/DigitalPassModal';
import api from '../../services/api';
import {
  BadgeCheck,
  QrCode,
  Search,
  Filter,
  FilePlus,
  Calendar,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

const MyPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    activePasses: 0,
    expiredPasses: 0,
    revokedPasses: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, APPROVED, PENDING, REJECTED, EXPIRED_REVOKED
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal states
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/permission-passes/my');
      if (res.data?.success && res.data?.data) {
        setPermissions(res.data.data.permissions || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      console.warn('API fetch failed, checking requests fallback...', err);
      // Fallback: try /requests/my
      try {
        const fallbackRes = await api.get('/requests/my');
        if (fallbackRes.data?.success && Array.isArray(fallbackRes.data?.data)) {
          const reqs = fallbackRes.data.data;
          setPermissions(reqs);
          setStats({
            total: reqs.length,
            approved: reqs.filter(r => r.overall_status === 'APPROVED').length,
            pending: reqs.filter(r => ['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(r.overall_status)).length,
            rejected: reqs.filter(r => r.overall_status === 'REJECTED').length,
            activePasses: reqs.filter(r => r.overall_status === 'APPROVED').length,
            expiredPasses: 0,
            revokedPasses: 0
          });
        }
      } catch (e) {
        console.error('All fetches failed', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = (perm) => {
    setSelectedPermission(perm);
    setIsDetailsOpen(true);
  };

  const handleOpenPass = (perm) => {
    setSelectedPass(perm);
    setIsPassModalOpen(true);
  };

  // Filter permissions according to tab, search term, and category filter
  const filteredPermissions = permissions.filter((perm) => {
    // 1. Tab filter
    if (activeTab === 'APPROVED' && perm.overall_status !== 'APPROVED') return false;
    if (activeTab === 'PENDING' && !['SUBMITTED', 'PENDING', 'UNDER_REVIEW'].includes(perm.overall_status)) return false;
    if (activeTab === 'REJECTED' && perm.overall_status !== 'REJECTED') return false;
    if (activeTab === 'EXPIRED_REVOKED') {
      const isExpired = perm.pass_status === 'EXPIRED';
      const isRevoked = perm.pass_status === 'REVOKED';
      if (!isExpired && !isRevoked) return false;
    }

    // 2. Category filter
    if (typeFilter !== 'ALL' && perm.request_type !== typeFilter) return false;

    // 3. Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      const code = (perm.request_code || '').toLowerCase();
      const passRef = (perm.pass_reference || '').toLowerCase();
      const reason = (perm.reason || '').toLowerCase();
      const type = (perm.request_type || '').toLowerCase();
      if (!code.includes(q) && !passRef.includes(q) && !reason.includes(q) && !type.includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF5F7] text-[#261B50] flex flex-col font-sans relative antialiased selection:bg-[#B95BD5] selection:text-white">
      <BlueprintWatermark />
      <Navbar />

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 sm:gap-8 items-start relative z-10">
        <Sidebar role="STUDENT" />

        <main className="flex-1 space-y-6 sm:space-y-8 min-w-0 w-full overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-white border border-[#EAE0E8] text-[#B95BD5] shadow-xs">
                  <BadgeCheck className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#261B50] tracking-tight">
                  My Permissions & Digital Passes
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#837B96] mt-1 pl-1">
                Access your institutional sanctions, view real-time approval trails, and present verified QR passes.
              </p>
            </div>

            <Link
              to="/student/new-request"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#261B50] hover:bg-[#34265F] text-white shadow-md shadow-[#261B50]/20 transition-all hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto shrink-0"
            >
              <FilePlus className="w-4 h-4 text-[#B95BD5]" />
              New Permission Request
            </Link>
          </div>

          {/* Top Live Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* 1. Total Requests */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EAE0E8] shadow-xs hover:border-[#D8B8E8] transition-all">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#837B96] block">
                Total Permissions
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#261B50] mt-1.5">
                {stats.total}
              </div>
              <span className="text-[11px] text-[#837B96] mt-1 block">
                All submitted records
              </span>
            </div>

            {/* 2. Approved */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EAE0E8] shadow-xs hover:border-[#B7E8D3] transition-all">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1E9A68] block flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#1E9A68]" />
                Approved
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#1E9A68] mt-1.5">
                {stats.approved}
              </div>
              <span className="text-[11px] text-[#837B96] mt-1 block">
                Sanctioned by HOD
              </span>
            </div>

            {/* 3. Pending */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EAE0E8] shadow-xs hover:border-[#FCE1C2] transition-all">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#E58B24] block flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#E58B24]" />
                Pending
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#E58B24] mt-1.5">
                {stats.pending}
              </div>
              <span className="text-[11px] text-[#837B96] mt-1 block">
                In approval queue
              </span>
            </div>

            {/* 4. Rejected */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EAE0E8] shadow-xs hover:border-[#F9CAD3] transition-all">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#E04F69] block flex items-center gap-1">
                <XCircle className="w-3 h-3 text-[#E04F69]" />
                Rejected
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#E04F69] mt-1.5">
                {stats.rejected}
              </div>
              <span className="text-[11px] text-[#837B96] mt-1 block">
                Declined requests
              </span>
            </div>

            {/* 5. Active Digital Passes */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#261B50] to-[#34265F] text-white shadow-md border border-[#3E2E6B] col-span-2 sm:col-span-1">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#D8B8E8] block flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-[#B95BD5]" />
                Active QR Passes
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white mt-1.5">
                {stats.activePasses}
              </div>
              <span className="text-[11px] text-[#D8B8E8]/80 mt-1 block">
                Scannable digital passes
              </span>
            </div>
          </div>

          {/* Section Filter Tabs & Search Controls */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Organized Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Permissions', count: stats.total },
                  { id: 'APPROVED', label: 'Approved', count: stats.approved },
                  { id: 'PENDING', label: 'Pending Review', count: stats.pending },
                  { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
                  { id: 'EXPIRED_REVOKED', label: 'Expired / Revoked', count: (stats.expiredPasses || 0) + (stats.revokedPasses || 0) }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? 'bg-[#261B50] text-white shadow-xs'
                        : 'bg-white text-[#4F4665] hover:text-[#261B50] hover:bg-[#FAF5F7] border border-[#EAE0E8]'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      activeTab === tab.id ? 'bg-[#B95BD5] text-white' : 'bg-[#FAF5F7] text-[#837B96]'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search & Category Filter */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-4 h-4 text-[#837B96] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by code or reason..."
                    className="w-full pl-9 pr-3 py-2 rounded-full text-xs bg-white border border-[#EAE0E8] focus:border-[#B95BD5] focus:outline-none text-[#261B50] placeholder-[#837B96]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="pl-3 pr-8 py-2 rounded-full text-xs font-bold bg-white border border-[#EAE0E8] focus:border-[#B95BD5] focus:outline-none text-[#261B50] appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="OD">On-Duty (OD)</option>
                    <option value="LEAVE">Leave</option>
                    <option value="EVENT">Event</option>
                    <option value="EXAM">Exam</option>
                  </select>
                  <Filter className="w-3.5 h-3.5 text-[#837B96] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Permission Cards Grid */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#EAE0E8] shadow-xs">
                <div className="inline-block w-8 h-8 border-3 border-[#B95BD5] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-[#837B96] mt-3">Loading your institutional records...</p>
              </div>
            ) : filteredPermissions.length === 0 ? (
              /* Empty State */
              <div className="p-10 sm:p-16 text-center bg-white rounded-3xl border border-[#EAE0E8] shadow-xs space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#FAF5F7] border border-[#EAE0E8] flex items-center justify-center mx-auto text-[#B95BD5]">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#261B50]">
                    You haven't submitted any permission requests yet.
                  </h3>
                  <p className="text-xs sm:text-sm text-[#837B96] max-w-md mx-auto mt-1">
                    When you apply for On-Duty (OD), Leave, Event, or Exam permissions, your application progress and scannable digital passes will appear here.
                  </p>
                </div>
                <Link
                  to="/student/new-request"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#261B50] hover:bg-[#34265F] text-white shadow-md shadow-[#261B50]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <FilePlus className="w-4 h-4 text-[#B95BD5]" />
                  Create Your First Request
                </Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredPermissions.map((item) => {
                  const hasActivePass = item.overall_status === 'APPROVED' && item.pass_reference;

                  return (
                    <div
                      key={item.request_id}
                      className="p-5 rounded-3xl bg-white border border-[#EAE0E8] hover:border-[#D8B8E8] shadow-xs hover:shadow-sm transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-black text-[#261B50] px-2.5 py-0.5 rounded-full bg-[#FAF5F7] border border-[#E8DDE6]">
                            {item.request_code}
                          </span>

                          <span className="text-xs font-black text-[#B95BD5] px-2.5 py-0.5 rounded-full bg-[#FAF5F7] border border-[#E8D5EC]">
                            {item.request_type}
                          </span>

                          <StatusBadge status={item.overall_status} size="sm" />

                          {item.pass_status && (
                            <StatusBadge status={item.pass_status} size="sm" />
                          )}

                          {item.is_urgent === 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#FDEEF1] text-[#E04F69] text-[10px] font-bold border border-[#F9CAD3]">
                              Urgent
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-[#261B50] line-clamp-2 leading-relaxed">
                          {item.reason}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#837B96] pt-1">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#B95BD5]" />
                            Validity: {new Date(item.start_date).toLocaleDateString()} &rarr; {new Date(item.end_date).toLocaleDateString()}
                          </span>

                          <span>
                            Submitted: {new Date(item.submission_date || item.created_at).toLocaleDateString()}
                          </span>

                          {item.pass_reference && (
                            <span className="font-mono font-bold text-[#4F4665] flex items-center gap-1">
                              <QrCode className="w-3 h-3 text-[#B95BD5]" />
                              {item.pass_reference}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F0E6EE] shrink-0">
                        <button
                          onClick={() => handleOpenDetails(item)}
                          className="px-4 py-2 rounded-full text-xs font-bold bg-[#FAF5F7] hover:bg-[#F3EAF1] text-[#4F4665] hover:text-[#261B50] border border-[#EAE0E8] transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#837B96]" />
                          View Details
                        </button>

                        {hasActivePass ? (
                          <button
                            onClick={() => handleOpenPass(item)}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] text-white shadow-md shadow-[#261B50]/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#B95BD5]" />
                            View QR Pass
                          </button>
                        ) : (
                          <Link
                            to={`/student/track/${item.request_id}`}
                            className="px-4 py-2 rounded-full text-xs font-bold text-[#837B96] hover:text-[#261B50] hover:bg-[#FAF5F7] border border-transparent hover:border-[#EAE0E8] transition-colors flex items-center gap-1"
                          >
                            Track Live
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Permission Details Popup Modal */}
      <PermissionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        permission={selectedPermission}
        onViewPass={(perm) => {
          setSelectedPass(perm);
          setIsPassModalOpen(true);
        }}
      />

      {/* Digital Permission Pass Modal */}
      <DigitalPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        pass={selectedPass}
      />
    </div>
  );
};

export default MyPermissions;
