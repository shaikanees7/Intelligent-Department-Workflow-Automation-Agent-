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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role={user?.role || 'STUDENT'} />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Link
                to={user?.role === 'STUDENT' ? '/student/requests' : user?.role === 'OFFICE_ADMIN' ? '/office' : '/admin'}
                className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Application Journey Tracker
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time multi-level workflow verification & AI routing audit trail
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {id && (
                <button
                  onClick={fetchTracking}
                  className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition"
                  title="Refresh Audit Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              )}
              {user?.role === 'STUDENT' ? (
                <Link
                  to="/student/requests"
                  className="text-xs font-bold text-primary-600 hover:text-primary-800"
                >
                  All Applications →
                </Link>
              ) : null}
            </div>
          </div>

          {/* If no ID in URL, show search / picker */}
          {!id && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
              <div className="w-12 h-12 bg-sky-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Track an Application</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select an application from your recent list below to inspect its approval stage.
                </p>
              </div>

              {recentList.length > 0 ? (
                <div className="max-w-md mx-auto divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-left text-xs">
                  {recentList.map((r) => (
                    <button
                      key={r.request_id}
                      onClick={() => navigate(`/student/track/${r.request_id}`)}
                      className="w-full p-3.5 hover:bg-slate-50 flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{r.request_code} ({r.request_type})</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{r.reason}</div>
                      </div>
                      <span className="font-bold text-primary-600">Track →</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400">No applications to track.</div>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Fetching tracking audit trail...
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Tracking Unavailable</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* 1. AI Routing & Assigned Office Intelligence Card */}
              {aiRouting && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary-500/20 text-sky-400 rounded-xl border border-primary-500/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-white">
                            AI Permission Classification & Office Routing
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                            {aiRouting.confidence_score ? `${Math.round(aiRouting.confidence_score * 100)}% Match` : 'Neural'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Classified using Groq AI (openai/gpt-oss-120b) • Matched against registered university offices
                        </p>
                      </div>
                    </div>

                    {/* Manual Re-Route Button for Admin / Office Staff */}
                    {(user?.role === 'ADMIN' || user?.role === 'OFFICE_ADMIN') && (
                      <button
                        onClick={() => setIsReRouteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition self-start sm:self-auto"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        Re-Route Office
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned Office Box */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned University Office:
                      </span>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-sky-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white text-sm">
                            {assignedOffice?.office_name || aiRouting.primary_office || 'University Office'}
                          </div>
                          {assignedOffice?.office_code && (
                            <span className="text-[10px] font-mono text-sky-300">[{assignedOffice.office_code}]</span>
                          )}
                        </div>
                      </div>

                      {assignedOffice && (
                        <div className="text-[11px] text-slate-300 space-y-1 pt-1 border-t border-white/10">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{assignedOffice.responsible_officer}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{assignedOffice.location}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Classification & Reason Box */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
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
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-200 text-amber-900 rounded-xl shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-amber-950 text-sm sm:text-base">
                          AI Agent Clarification Required
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          Awaiting Student Input
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        The AI routing engine detected ambiguous or incomplete information in your submission. Please
                        answer the question below to route your application to the correct university desk:
                      </p>
                    </div>
                  </div>

                  {/* Clarification Question Prompt */}
                  <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs font-medium text-amber-950 shadow-xs">
                    <span className="font-bold block text-[11px] text-amber-700 uppercase tracking-wider mb-1">
                      Clarification Question:
                    </span>
                    <p className="text-sm font-semibold">
                      "{aiRouting?.clarification_question || 'Could you please specify the purpose of your permission? Is it related to academics, examinations, hostel outing, or another university activity?'}"
                    </p>
                  </div>

                  {clarifySuccessMsg ? (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{clarifySuccessMsg}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleClarificationSubmit} className="space-y-3">
                      {clarifyError && (
                        <div className="bg-rose-100 text-rose-800 p-3 rounded-lg text-xs">{clarifyError}</div>
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
                          className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={clarifying || !clarificationResponse.trim()}
                        className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
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
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-primary-600" />
                    <span>Clarification History ({clarifications.length})</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {clarifications.map((c) => (
                      <div key={c.clarification_id} className="py-3 space-y-1.5">
                        <div className="flex items-center justify-between text-slate-400 text-[10px]">
                          <span className="font-semibold text-amber-700">Question Asked</span>
                          <span>{new Date(c.created_at).toLocaleString()}</span>
                        </div>
                        <p className="font-semibold text-slate-800 text-xs">"{c.question_text}"</p>
                        {c.student_response && (
                          <div className="mt-1.5 pl-3 border-l-2 border-primary-500 bg-slate-50 p-2.5 rounded text-slate-700">
                            <span className="text-[10px] font-bold text-primary-600 block mb-0.5">
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
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Manual Office Re-Route</h3>
                  </div>
                  <button
                    onClick={() => setIsReRouteModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleManualRouteSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Target University Office:</label>
                    <select
                      value={targetOfficeId}
                      onChange={(e) => setTargetOfficeId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      {allOffices.map((off) => (
                        <option key={off.office_id} value={off.office_id}>
                          {off.name} [{off.code}] - {off.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Reason for Re-Routing:</label>
                    <textarea
                      rows="2"
                      placeholder="e.g. Request requires examination clearance rather than academic waiver."
                      value={reRouteReason}
                      onChange={(e) => setReRouteReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsReRouteModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={reRouting}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      {reRouting ? 'Re-routing...' : 'Confirm Re-Route'}
                    </button>
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
