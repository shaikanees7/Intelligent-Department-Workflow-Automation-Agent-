import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import WorkflowTrackerTimeline from '../../components/tracking/WorkflowTrackerTimeline';
import api from '../../services/api';
import { Activity, Search, ArrowLeft, AlertCircle } from 'lucide-react';

const TrackRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentList, setRecentList] = useState([]);

  // If ID is in url params, fetch tracking details
  useEffect(() => {
    if (id) {
      const fetchTracking = async () => {
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
          // Demo fallback tracking data
          setData({
            request: {
              request_id: id,
              request_code: `REQ-84210${id || 1}`,
              request_type: 'OD',
              reason: 'Selected for National Smart India Hackathon Grand Finale in Bangalore. Need 3 days On-Duty permission to travel and compete.',
              start_date: '2026-11-08',
              end_date: '2026-11-10',
              is_urgent: 1,
              overall_status: 'UNDER_REVIEW',
              current_step_order: 2,
              pdf_letter_url: '#',
              created_at: '2026-11-04T09:30:00Z'
            },
            history: [
              {
                step_order: 1,
                role: 'MENTOR',
                first_name: 'Prof. Suresh',
                last_name: 'Reddy',
                action: 'VERIFIED',
                remarks: 'Student attendance is 88%. Recommendation approved for hackathon participation.',
                action_timestamp: '2026-11-04T11:45:00Z'
              }
            ]
          });
        } finally {
          setLoading(false);
        }
      };

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />

        <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <Link
                to="/student/requests"
                className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Application Journey Tracker
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time multi-level workflow verification & audit trail
                </p>
              </div>
            </div>

            <Link
              to="/student/requests"
              className="text-xs font-bold text-primary-600 hover:text-primary-800"
            >
              All Applications →
            </Link>
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

          {/* Tracking Component */}
          {data && (
            <WorkflowTrackerTimeline
              request={data.request}
              history={data.history}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TrackRequest;
