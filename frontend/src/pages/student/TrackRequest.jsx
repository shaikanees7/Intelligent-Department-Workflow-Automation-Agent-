import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import WorkflowTrackerTimeline from '../../components/tracking/WorkflowTrackerTimeline';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Activity,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Building2,
  HelpCircle,
  Send,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  User,
  MapPin,
  RefreshCw,
  X
} from 'lucide-react';

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
    <div className="min-h-screen bg-transparent text-saas-textDark font-sans relative selection:bg-saas-primary selection:text-white overflow-x-hidden">
      <BlueprintWatermark />
      <Navbar />

      <div className="flex flex-col md:flex-row relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-6 gap-6 items-start">
        <Sidebar role={user?.role || 'STUDENT'} />

        <main className="flex-1 w-full space-y-6">
          <div className="saas-card rounded-3xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#EAE0E8] gap-3">
              <div className="flex items-center gap-3">
                <Link
                  to={user?.role === 'STUDENT' ? '/student/requests' : user?.role === 'OFFICE_ADMIN' ? '/office' : '/admin'}
                  className="p-2.5 bg-white hover:bg-saas-canvas rounded-full border border-[#EAE0E8] text-saas-textDark shadow-xs transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-extrabold text-saas-textDark tracking-tight">
                      Application Journey Tracker
                    </h1>
                    <span className="badge-pill bg-[#EAE0F0] text-saas-navy text-[11px] font-bold">
                      Live Audit Trail
                    </span>
                  </div>
                  <p className="text-xs text-saas-textMuted mt-0.5">
                    Real-time multi-level workflow verification & AI routing audit trail
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {id && (
                  <button
                    onClick={fetchTracking}
                    className="p-2.5 bg-white hover:bg-saas-canvas text-saas-textDark border border-[#EAE0E8] rounded-full shadow-xs transition hover:rotate-180 duration-300"
                    title="Refresh Audit Data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                )}
                {user?.role === 'STUDENT' ? (
                  <Link
                    to="/student/requests"
                    className="saas-pill-btn-outline text-xs px-4 py-2 inline-flex items-center gap-1.5"
                  >
                    <span>All Applications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>

            {/* If no ID in URL, show search / picker */}
            {!id && (
              <div className="bg-saas-canvas/60 p-6 sm:p-8 rounded-3xl border border-[#EAE0E8] space-y-6 text-center">
                <div className="w-12 h-12 bg-saas-primary/10 text-saas-primary border border-saas-primary/20 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-saas-textDark">Select an Application to Track</h3>
                  <p className="text-xs text-saas-textMuted mt-1">
                    Select an application from your recent submissions below to inspect its workflow step progress.
                  </p>
                </div>

                {recentList.length > 0 ? (
                  <div className="max-w-md mx-auto divide-y divide-[#F1E8EE] border border-[#EAE0E8] rounded-2xl overflow-hidden text-left text-xs bg-white shadow-xs">
                    {recentList.map((r) => (
                      <button
                        key={r.request_id}
                        onClick={() => navigate(`/student/track/${r.request_id}`)}
                        className="w-full p-3.5 hover:bg-saas-canvas/60 flex items-center justify-between transition group"
                      >
                        <div>
                          <div className="font-mono font-bold text-saas-textDark group-hover:text-saas-primary transition">
                            {r.request_code} ({r.request_type})
                          </div>
                          <div className="text-[11px] text-saas-textMuted truncate max-w-xs">{r.reason}</div>
                        </div>
                        <span className="badge-pill bg-saas-primary/10 text-saas-primary font-bold flex items-center gap-1 group-hover:bg-saas-primary group-hover:text-white transition">
                          Track <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-saas-textMuted">No applications found to track.</div>
                )}
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="p-12 text-center text-xs text-saas-textMuted flex flex-col items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-saas-primary" />
                <span>Fetching tracking audit trail...</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="bg-[#FDEEF1] border border-[#F5C2CB] rounded-2xl p-5 flex items-start gap-3 text-[#A8253E] text-xs">
                <AlertCircle className="w-5 h-5 text-[#D65B70] shrink-0" />
                <div>
                  <span className="font-bold text-sm block">Tracking Unavailable</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {data && (
              <div className="space-y-6">
                {/* 1. AI Routing & Assigned Office Intelligence Card (Deep Navy-Purple SaaS Featured) */}
                {aiRouting && (
                  <div className="saas-dark-card rounded-3xl p-6 sm:p-7 space-y-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-saas-primary/25 to-transparent blur-2xl pointer-events-none -mr-20 -mt-20"></div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-saas-primary/20 text-saas-accent rounded-2xl border border-saas-primary/30 shadow-xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-white">
                              AI Classification & Office Routing
                            </h3>
                            <span className="badge-pill bg-saas-primary/25 text-saas-accent border border-saas-primary/40 text-[10px] font-bold">
                              {aiRouting.confidence_score ? `${Math.round(aiRouting.confidence_score * 100)}% Match` : 'Neural'}
                            </span>
                          </div>
                          <p className="text-[11px] text-white/60">
                            Classified using Groq AI (openai/gpt-oss-120b) • Mapped against university departments
                          </p>
                        </div>
                      </div>

                      {/* Manual Re-Route Button for Admin / Office Staff */}
                      {(user?.role === 'ADMIN' || user?.role === 'OFFICE_ADMIN') && (
                        <button
                          onClick={() => setIsReRouteModalOpen(true)}
                          className="saas-pill-btn-outline text-xs px-4 py-2 border-white/20 text-white hover:bg-white/10 self-start sm:self-auto inline-flex items-center gap-1.5"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          Re-Route Office
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                      {/* Assigned Office Box */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 backdrop-blur-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-saas-accent block">
                          Assigned University Office
                        </span>
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-saas-primary/20 flex items-center justify-center text-saas-accent">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">
                              {assignedOffice?.office_name || aiRouting.primary_office || 'University Office'}
                            </div>
                            {assignedOffice?.office_code && (
                              <span className="text-[10px] font-mono text-saas-accent">[{assignedOffice.office_code}]</span>
                            )}
                          </div>
                        </div>

                        {assignedOffice && (
                          <div className="text-[11px] text-white/70 space-y-1 pt-2 border-t border-white/10">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-saas-accent" />
                              <span>{assignedOffice.responsible_officer}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-saas-accent" />
                              <span>{assignedOffice.location}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Classification & Reason Box */}
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-2 backdrop-blur-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-saas-accent block">
                          AI Routing Reasoning & Justification
                        </span>
                        {aiRouting.permission_category && !['OD', 'OD REQUEST'].includes(aiRouting.permission_category.trim().toUpperCase()) && (
                          <div className="text-xs font-semibold text-emerald-300">
                            {aiRouting.permission_category}
                          </div>
                        )}
                        <p className="text-[11px] text-white/80 leading-relaxed italic">
                          "{aiRouting.reason || 'Automatically routed based on university desk responsibility mapping.'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Interactive Clarification Widget */}
                {needsClarification && (
                  <div className="bg-[#FEF6EB] border border-[#F7E1B5] rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-[#FDE9C6] text-[#B87A18] rounded-2xl shrink-0 mt-0.5">
                        <HelpCircle className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-amber-950 text-base">
                            AI Agent Clarification Required
                          </h4>
                          <span className="badge-pill bg-[#FDE9C6] text-amber-900 text-[10px] font-bold">
                            Awaiting Student Response
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 leading-relaxed">
                          The AI routing engine detected ambiguous or incomplete information in your submission. Please
                          answer the question below to route your application to the correct university desk:
                        </p>
                      </div>
                    </div>

                    {/* Clarification Question Prompt */}
                    <div className="bg-white p-4 rounded-2xl border border-amber-200 text-xs font-medium text-amber-950 shadow-xs">
                      <span className="font-bold block text-[11px] text-amber-800 uppercase tracking-wider mb-1">
                        Clarification Question:
                      </span>
                      <p className="text-sm font-semibold">
                        "{aiRouting?.clarification_question || 'Could you please specify the purpose of your permission? Is it related to academics, examinations, hostel outing, or another university activity?'}"
                      </p>
                    </div>

                    {clarifySuccessMsg ? (
                      <div className="bg-[#E8F7F0] border border-[#B3E8CE] text-emerald-900 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{clarifySuccessMsg}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleClarificationSubmit} className="space-y-3">
                        {clarifyError && (
                          <div className="bg-[#FDEEF1] text-[#A8253E] p-3 rounded-xl text-xs">{clarifyError}</div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-amber-950 mb-1">
                            Your Explanation & Response:
                          </label>
                          <textarea
                            rows="3"
                            required
                            value={clarificationResponse}
                            onChange={(e) => setClarificationResponse(e.target.value)}
                            placeholder="Provide the requested details here (e.g., mention whether this is for exam fee clearance, semester lab practical, hostel night out, sports tournament, etc.)..."
                            className="w-full px-4 py-3 bg-white border border-amber-300 rounded-2xl text-xs text-saas-textDark placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none transition shadow-xs"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={clarifying || !clarificationResponse.trim()}
                          className="saas-pill-btn-primary text-xs px-6 py-2.5 inline-flex items-center gap-2 shadow-xs"
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
                  <div className="saas-card rounded-3xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-saas-textDark font-bold text-xs">
                      <MessageSquare className="w-4 h-4 text-saas-primary" />
                      <span>Clarification History ({clarifications.length})</span>
                    </div>
                    <div className="divide-y divide-[#F1E8EE] text-xs">
                      {clarifications.map((c) => (
                        <div key={c.clarification_id} className="py-3 space-y-1.5">
                          <div className="flex items-center justify-between text-saas-textMuted text-[10px]">
                            <span className="font-semibold text-amber-700">Question Asked</span>
                            <span>{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                          <p className="font-semibold text-saas-textDark text-xs">"{c.question_text}"</p>
                          {c.student_response && (
                            <div className="mt-1.5 pl-3 border-l-2 border-saas-primary bg-saas-canvas/60 p-3 rounded-xl text-saas-textDark">
                              <span className="text-[10px] font-bold text-saas-primary block mb-0.5">
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
              <div className="fixed inset-0 z-50 bg-[#1E163B]/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="saas-card rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EAE0E8] pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-saas-primary" />
                      <h3 className="font-bold text-saas-textDark text-sm">Manual Office Re-Route</h3>
                    </div>
                    <button
                      onClick={() => setIsReRouteModalOpen(false)}
                      className="p-1.5 text-saas-textMuted hover:text-saas-textDark rounded-full hover:bg-saas-canvas transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleManualRouteSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-saas-textDark mb-1">Select Target University Office:</label>
                      <select
                        value={targetOfficeId}
                        onChange={(e) => setTargetOfficeId(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#EAE0E8] rounded-xl bg-white focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                      >
                        {allOffices.map((off) => (
                          <option key={off.office_id} value={off.office_id}>
                            {off.name} [{off.code}] - {off.category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-saas-textDark mb-1">Reason for Re-Routing:</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Request requires examination clearance rather than academic waiver."
                        value={reRouteReason}
                        onChange={(e) => setReRouteReason(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-[#EAE0E8] rounded-xl focus:ring-2 focus:ring-saas-primary/20 focus:border-saas-primary focus:outline-none transition"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAE0E8]">
                      <button
                        type="button"
                        onClick={() => setIsReRouteModalOpen(false)}
                        className="saas-pill-btn-outline text-xs px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={reRouting}
                        className="saas-pill-btn-primary text-xs px-5 py-2 disabled:opacity-50"
                      >
                        {reRouting ? 'Re-routing...' : 'Confirm Re-Route'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TrackRequest;
