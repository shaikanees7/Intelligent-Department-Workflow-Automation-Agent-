import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  AlertTriangle,
  Download,
  FileText,
  Landmark,
  Building2,
  ShieldCheck,
  MapPin,
  Sparkles
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const WorkflowTrackerTimeline = ({ request, history = [], assignedOffice = null, aiRouting = null }) => {
  if (!request) return null;

  // Resolve assigned university office details
  const office = assignedOffice || request.assigned_office;
  const officeName = office?.office_name || office?.name || request.routed_office_name || request.office_name;
  const officeCode = office?.office_code || office?.code || request.routed_office_code || request.office_code;
  const responsibleOfficer = office?.responsible_officer || request.routed_responsible_officer;
  const officeLocation = office?.location || request.routed_office_location;

  const isAssignedToSpecialOffice = Boolean(officeName && officeCode !== 'DEPT_OFFICE');

  // Dynamic 4-step workflow sequence:
  // Step 1: Submission (Student)
  // Step 2: Mentor Verification (Academic Mentor)
  // Step 3: Faculty Coordinator Approval (Department Faculty)
  // Step 4: Final Sanction (Routes to Assigned University Office e.g. Academic Office, Hostel Office, Exam Cell, Sports Dept, etc. instead of HOD!)
  const stages = [
    {
      stepOrder: 1,
      name: 'Application Submission',
      role: 'STUDENT',
      icon: GraduationCap,
      description: 'Submitted by student with justification and supporting documents'
    },
    {
      stepOrder: 2,
      name: 'Mentor Verification',
      role: 'MENTOR',
      icon: UserCheck,
      description: 'First-level academic authenticity & attendance verification'
    },
    {
      stepOrder: 3,
      name: 'Faculty Coordinator Approval',
      role: 'FACULTY',
      icon: Building,
      description: 'Departmental review & verification of institutional policy'
    },
    {
      stepOrder: 4,
      name: isAssignedToSpecialOffice
        ? `${officeName} Final Sanction`
        : 'HOD Final Sanction',
      role: isAssignedToSpecialOffice
        ? (officeCode || 'OFFICE')
        : 'HOD',
      icon: isAssignedToSpecialOffice ? Landmark : CheckCircle2,
      description: isAssignedToSpecialOffice
        ? `Final institutional authorization and digital gate pass sanction by ${responsibleOfficer ? `${responsibleOfficer} (${officeName})` : officeName}${officeLocation ? ` • ${officeLocation}` : ''}`
        : 'Final institutional authorization and digital gate pass sanction by Head of Department'
    }
  ];

  const isRejected = request.overall_status === 'REJECTED';
  const isApproved = request.overall_status === 'APPROVED';
  const currentStep = request.current_step_order || 1;

  // Helper to find history for a specific step or action
  const findHistoryForStep = (stepOrder) => {
    return history.find((h) => h.step_order === stepOrder) || null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Application Tracker: {request.request_code}
            </h3>
            <StatusBadge status={request.overall_status} />
            {Boolean(request.is_urgent) && <StatusBadge status="URGENT" />}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Type: <span className="font-semibold text-slate-700">{request.request_type} Request</span> •{' '}
            {isAssignedToSpecialOffice && (
              <>
                Routed Authority:{' '}
                <span className="font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-200">
                  {officeName}
                </span>{' '}
                •{' '}
              </>
            )}
            Submitted: <span className="font-semibold text-slate-700">{new Date(request.created_at).toLocaleDateString()}</span> •{' '}
            Duration: <span className="font-semibold text-slate-700">{new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}</span>
          </p>
        </div>

        {/* PDF Pass Download if approved */}
        {isApproved && (
          <a
            href={request.pdf_letter_url ? `http://localhost:5000${request.pdf_letter_url}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download Digital Gate Pass (PDF)
          </a>
        )}
      </div>

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-900">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Application Rejected</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              This request was rejected and will not progress further through the department workflow.
              Please check reviewer remarks below.
            </p>
          </div>
        </div>
      )}

      {/* Visual Step Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-10 my-4">
        {stages.map((stage) => {
          const stepHist = findHistoryForStep(stage.stepOrder);
          const isDone = isApproved || stage.stepOrder < currentStep || (stage.stepOrder === 1);
          const isCurrent = !isApproved && !isRejected && stage.stepOrder === currentStep;
          const isStoppedHere = isRejected && stage.stepOrder === currentStep;

          let nodeStyle = 'bg-white border-slate-300 text-slate-400';

          if (isDone) {
            nodeStyle = 'bg-emerald-500 border-emerald-500 text-white';
          } else if (isCurrent) {
            nodeStyle = 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 animate-pulse';
          } else if (isStoppedHere) {
            nodeStyle = 'bg-rose-500 border-rose-500 text-white ring-4 ring-rose-100';
          }

          const StageIcon = stage.icon;

          return (
            <div key={stage.stepOrder} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-[37px] sm:-left-[45px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-xs transition ${nodeStyle}`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isStoppedHere ? (
                  <XCircle className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <StageIcon className="w-4 h-4" />
                )}
              </div>

              {/* Step Card */}
              <div className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-4 border border-slate-200/80 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Step {stage.stepOrder}: {stage.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      stage.stepOrder === 4 && isAssignedToSpecialOffice
                        ? 'bg-sky-100 text-sky-800 border border-sky-200 font-mono'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stage.role}
                    </span>
                  </div>

                  <div className="text-xs">
                    {isDone ? (
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {stage.stepOrder === 4 && isAssignedToSpecialOffice ? `Sanctioned by ${officeName}` : 'Completed'}
                      </span>
                    ) : isCurrent ? (
                      <span className="font-semibold text-amber-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {stage.stepOrder === 4 && isAssignedToSpecialOffice ? `Pending ${officeName} Review` : 'Pending Review'}
                      </span>
                    ) : isStoppedHere ? (
                      <span className="font-semibold text-rose-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Rejected at this stage
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {stage.stepOrder === 4 && isAssignedToSpecialOffice ? `Upcoming (${officeName})` : 'Upcoming Stage'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-1">{stage.description}</p>

                {/* Audit Details if step has reviewer entry */}
                {stepHist && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 bg-white/70 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium">
                        Reviewed by: <strong className="text-slate-800">{stepHist.first_name} {stepHist.last_name}</strong>{' '}
                        <span className="text-slate-500">
                          ({stage.stepOrder === 4 && isAssignedToSpecialOffice ? officeName : stepHist.role})
                        </span>
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {new Date(stepHist.action_timestamp).toLocaleString()}
                      </span>
                    </div>
                    {stepHist.remarks && (
                      <div className="mt-2 text-slate-700 bg-slate-100/80 p-2.5 rounded border border-slate-200 italic">
                        "{stepHist.remarks}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Reason & Attached Details */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          Request Justification & Documentation
        </h4>
        <p className="text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
          "{request.reason}"
        </p>
      </div>
    </div>
  );
};

export default WorkflowTrackerTimeline;
