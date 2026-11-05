import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import WorkflowTrackerTimeline from '../../components/tracking/WorkflowTrackerTimeline';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Activity,
  Search,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Building2,
  HelpCircle,
  Send,
  CheckCircle2,
  MessageSquare,
  Layers,
  ArrowRight,
  Clock,
  User,
  MapPin,
  RefreshCw,
  X
} from 'lucide-react';
import DukeButton from '../../components/duke/DukeButton';

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [inputCode, setInputCode] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentList, setRecentList] = useState([]);

  // Clarification state
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [clarifying, setClarifying] = useState(false);
  const [clarifySuccessMsg, setClarifySuccessMsg] = useState('');
  const [clarifyError, setClarifyError] = useState('');

  // Manual Re-Route state
  const [isReRouteModalOpen, setIsReRouteModalOpen] = useState(false);
  const [allOffices, setAllOffices] = useState([]);
  const [targetOfficeId, setTargetOfficeId] = useState('');
  const [reRouteReason, setReRouteReason] = useState('');
  const [reRouting, setReRouting] = useState(false);

  const fetchTracking = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/requests/${id}/track`);
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Unable to retrieve tracking data.');
      }
    } catch (err) {
      console.warn('[TrackRequest] Fetch error:', err.message);
      setError('Unable to load tracking details from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTracking();
    } else {
      // Fetch user's recent requests so they can pick one
      api.get('/requests/my')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            setRecentList(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [id]);

  // Load registered offices for manual routing if admin
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'OFFICE_ADMIN') {
      api.get('/offices')
        .then((res) => {
          if (res.data?.success && Array.isArray(res.data?.data)) {
            const seen = new Set();
            const cleanOffices = [];
            for (const o of res.data.data) {
              const norm = (o.name || '').trim().toLowerCase();
              if (!seen.has(norm)) {
                seen.add(norm);
                cleanOffices.push(o);
              }
            }
            setAllOffices(cleanOffices);
            if (cleanOffices.length > 0) {
              setTargetOfficeId(cleanOffices[0].office_id);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Submit student clarification
  const handleClarificationSubmit = async (e) => {
    e.preventDefault();
    if (!clarificationResponse.trim()) return;

    setClarifying(true);
    setClarifyError('');
    try {
      const res = await api.post(`/requests/${id}/clarify`, {
        response_text: clarificationResponse.trim()
      });

      if (res.data?.success) {
        setClarifySuccessMsg('Clarification response submitted! AI agent re-analyzed and routed your application.');
        setClarificationResponse('');
        setTimeout(() => {
          setClarifySuccessMsg('');
          fetchTracking();
        }, 1500);
      }
    } catch (err) {
      setClarifyError(err.response?.data?.message || 'Failed to submit clarification.');
    } finally {
      setClarifying(false);
    }
  };

  // Submit manual re-route
  const handleManualRouteSubmit = async (e) => {
    e.preventDefault();
    if (!targetOfficeId) return;

    setReRouting(true);
    try {
      const res = await api.post(`/requests/${id}/manual-route`, {
        target_office_id: parseInt(targetOfficeId),
        reason: reRouteReason.trim() || 'Manual administrative routing override.'
      });

      if (res.data?.success) {
        setIsReRouteModalOpen(false);
        setReRouteReason('');
        fetchTracking();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to re-route application.');
    } finally {
      setReRouting(false);
    }
  };

  const aiRouting = data?.ai_routing;
  const assignedOffice = data?.assigned_office;
  const clarifications = data?.clarifications || [];
  const request = data?.request;

  const needsClarification =
    request?.overall_status === 'AWAITING_CLARIFICATION' ||
    Boolean(aiRouting?.requires_clarification);

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={user?.role || 'STUDENT'} />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
            <div className="flex items-center gap-3.5">
              <Link
                to={user?.role === 'STUDENT' ? '/student/requests' : user?.role === 'OFFICE_ADMIN' ? '/office' : '/admin'}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl border border-white/15 transition backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Application Journey Tracker
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time multi-level workflow verification & AI routing audit trail
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {id && (
                <button
                  onClick={fetchTracking}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 rounded-2xl transition backdrop-blur-md"
                  title="Refresh Audit Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
              {user?.role === 'STUDENT' ? (
                <Link
                  to="/student/requests"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  All Applications →
                </Link>
              ) : null}
            </div>
          </div>

          {/* If no ID in URL, show search / picker */}
          {!id && (
            <div className="bg-zinc-950/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-center">
              <div className="w-14 h-14 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-600/20">
                <Activity className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-white">Track an Application</h3>
                <p className="text-xs text-slate-400">
                  Select an application from your recent list below to inspect its approval stage.
                </p>
              </div>

              {recentList.length > 0 ? (
                <div className="max-w-md mx-auto divide-y divide-white/5 border border-white/10 rounded-2xl overflow-hidden text-left text-xs bg-black/40">
                  {recentList.map((r) => (
                    <button
                      key={r.request_id}
                      onClick={() => navigate(`/student/track/${r.request_id}`)}
                      className="w-full p-4 hover:bg-white/[0.04] flex items-center justify-between transition-colors"
                    >
                      <div>
                        <div className="font-mono font-bold text-white">{r.request_code} ({r.request_type})</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{r.reason}</div>
                      </div>
                      <span className="font-bold text-blue-400 flex items-center gap-1">
                        Track <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500">No applications to track.</div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-zinc-950/80 backdrop-blur-xl p-12 rounded-3xl border border-white/10 text-center text-xs text-slate-400">
              Fetching tracking audit trail...
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-950/50 border border-rose-500/40 rounded-3xl p-6 flex items-start gap-3.5 text-rose-200 text-xs shadow-2xl">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-serif font-bold text-sm block text-white">Tracking Unavailable</span>
                <span className="text-rose-200/90">{error}</span>
              </div>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* 1. AI Routing & Assigned Office Intelligence Card */}
              {aiRouting && (
                <div className="bg-zinc-950/90 backdrop-blur-xl text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shadow-md">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-serif font-bold text-base sm:text-lg text-white">
                            AI Permission Classification & Office Routing
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/20 text-blue-300 border border-blue-400/30">
                            {aiRouting.confidence_score ? `${Math.round(aiRouting.confidence_score * 100)}% Match` : 'Neural'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Classified using Groq AI (openai/gpt-oss-120b) • Matched against registered university offices
                        </p>
                      </div>
                    </div>

                    {/* Manual Re-Route Button for Admin / Office Staff */}
                    {(user?.role === 'ADMIN' || user?.role === 'OFFICE_ADMIN') && (
                      <button
                        onClick={() => setIsReRouteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/15 transition self-start sm:self-auto active:scale-95"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        Re-Route Office
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned Office Box */}
                    <div className="bg-black/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned University Office:
                      </span>
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
                        <div>
                          <div className="font-serif font-bold text-white text-base">
                            {assignedOffice?.office_name || aiRouting.primary_office || 'University Office'}
                          </div>
                          {assignedOffice?.office_code && (
                            <span className="text-[10px] font-mono text-blue-300">[{assignedOffice.office_code}]</span>
                          )}
                        </div>
                      </div>

                      {assignedOffice && (
                        <div className="text-[11px] text-slate-300 space-y-1.5 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>{assignedOffice.responsible_officer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>{assignedOffice.location}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Classification & Reason Box */}
                    <div className="bg-black/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        AI Routing Reasoning & Justification:
                      </span>
                      {aiRouting.permission_category && !['OD', 'OD REQUEST'].includes(aiRouting.permission_category.trim().toUpperCase()) && (
                        <div className="text-xs font-semibold text-emerald-400">
                          {aiRouting.permission_category}
                        </div>
                      )}
                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                        "{aiRouting.reason || 'Automatically routed based on university desk responsibility mapping.'}"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Interactive Clarification Widget */}
              {needsClarification && (
                <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-2xl shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-serif font-bold text-white text-base sm:text-lg">
                          AI Agent Clarification Required
                        </h4>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          Awaiting Student Input
                        </span>
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        The AI routing engine detected ambiguous or incomplete information in your submission. Please
                        answer the question below to route your application to the correct university desk:
                      </p>
                    </div>
                  </div>

                  {/* Clarification Question Prompt */}
                  <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/30 text-xs font-medium text-amber-100 shadow-inner">
                    <span className="font-bold block text-[11px] text-amber-400 uppercase tracking-wider mb-1">
                      Clarification Question:
                    </span>
                    <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                      "{aiRouting?.clarification_question || 'Could you please specify the purpose of your permission? Is it related to academics, examinations, hostel outing, or another university activity?'}"
                    </p>
                  </div>

                  {clarifySuccessMsg ? (
                    <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{clarifySuccessMsg}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleClarificationSubmit} className="space-y-3">
                      {clarifyError && (
                        <div className="bg-rose-950/60 border border-rose-500/40 text-rose-200 p-3 rounded-xl text-xs">{clarifyError}</div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-amber-200 mb-1.5">
                          Your Explanation & Response:
                        </label>
                        <textarea
                          rows="3"
                          required
                          value={clarificationResponse}
                          onChange={(e) => setClarificationResponse(e.target.value)}
                          placeholder="Provide the requested details here (e.g., mention whether this is for exam fee clearance, semester lab practical, hostel night out, sports tournament, etc.)..."
                          className="w-full px-4 py-2.5 bg-black/60 border border-amber-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 focus:outline-none leading-relaxed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={clarifying || !clarificationResponse.trim()}
                        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-lg shadow-amber-600/30 transition active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {clarifying ? 'Submitting & Re-routing with AI...' : 'Submit Clarification'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* 3. Clarification History Log */}
              {clarifications.length > 0 && (
                <div className="bg-zinc-950/85 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl space-y-3">
                  <div className="flex items-center gap-2 text-white font-serif font-bold text-sm">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Clarification History ({clarifications.length})</span>
                  </div>
                  <div className="divide-y divide-white/5 text-xs">
                    {clarifications.map((c) => (
                      <div key={c.clarification_id} className="py-3.5 space-y-1.5">
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="font-semibold text-amber-400">Question Asked</span>
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="font-semibold text-slate-200 text-xs">"{c.question_text}"</p>
                        {c.student_response && (
                          <div className="mt-2 pl-3 border-l-2 border-blue-500 bg-black/40 p-3 rounded-xl text-slate-300">
                            <span className="text-[10px] font-bold text-blue-400 block mb-0.5">
                              Student Answer:
                            </span>
                            {c.student_response}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Workflow Timeline Stages */}
              <WorkflowTrackerTimeline
                request={data.request}
                history={data.history}
                assignedOffice={assignedOffice}
                aiRouting={aiRouting}
              />
            </div>
          )}

          {/* Manual Re-Route Modal */}
          {isReRouteModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-zinc-950 rounded-3xl shadow-2xl border border-white/15 w-full max-w-md p-6 sm:p-8 space-y-5 text-white animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    <h3 className="font-serif font-bold text-white text-base">Manual Office Re-Route</h3>
                  </div>
                  <button
                    onClick={() => setIsReRouteModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleManualRouteSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Select Target University Office:</label>
                    <select
                      value={targetOfficeId}
                      onChange={(e) => setTargetOfficeId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-white/15 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none transition"
                    >
                      {allOffices.map((off) => (
                        <option key={off.office_id} value={off.office_id} className="bg-zinc-900 text-white">
                          {off.name} [{off.code}] - {off.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">Reason for Re-Routing:</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Request requires examination clearance rather than academic waiver."
                      value={reRouteReason}
                      onChange={(e) => setReRouteReason(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-white/15 rounded-2xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:outline-none transition leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsReRouteModalOpen(false)}
                      className="px-5 py-2.5 border border-white/15 rounded-full font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      Cancel
                    </button>
                    <DukeButton
                      type="submit"
                      disabled={reRouting}
                      loading={reRouting}
                      size="sm"
                    >
                      {reRouting ? 'Re-routing...' : 'Confirm Re-Route'}
                    </DukeButton>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TrackRequest;
