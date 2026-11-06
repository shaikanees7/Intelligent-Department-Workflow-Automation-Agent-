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
        ? `Final authorization processed by ${officeName} (${responsibleOfficer || 'University Officer'})`
        : 'Final institutional authorization and digital gate pass sanction'
    }
  ];

  const currentStep = request.current_step_order || 1;
  const isApproved = request.overall_status === 'APPROVED';
  const isRejected = request.overall_status === 'REJECTED';

  const findHistoryForStep = (stepOrder) => {
    return history.find((h) => h.step_order === stepOrder);
  };

  return (
    <div className="space-y-6">
      {/* Request Header Banner */}
      <div className="bg-[#FAF5F7] rounded-3xl p-6 border border-[#EAE0E8] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-black text-[#261B50] bg-white px-3 py-1 rounded-full border border-[#EAE0E8] shadow-2xs">
              {request.request_code}
            </span>
            <span className="font-bold px-3 py-1 rounded-full text-xs bg-[#F4EBF7] text-[#8E32A8] border border-[#E8D1ED]">
              {request.request_type}
            </span>
            {Boolean(request.is_urgent) && (
              <span className="font-black px-2.5 py-0.5 rounded-full text-[10px] bg-[#FDEEF1] text-[#E04F69] border border-[#F9CAD3] animate-pulse">
                URGENT
              </span>
            )}
            <StatusBadge status={request.overall_status} size="sm" />
          </div>

          <h2 className="text-xl font-black text-[#261B50] tracking-tight">
            {request.reason}
          </h2>

          <p className="text-xs text-[#7C7390] mt-1.5 leading-relaxed">
            Student: <span className="font-bold text-[#261B50]">{request.student_name}</span>
            {request.registration_number && (
              <> • Reg: <span className="font-bold text-[#261B50] font-mono">{request.registration_number}</span></>
            )}
            {(request.phone || request.student_phone) && (
              <> • Phone: <span className="font-bold text-[#1E9A68]">{request.phone || request.student_phone}</span></>
            )}
            {' '}•{' '}
            {isAssignedToSpecialOffice && (
              <>
                Routed Authority:{' '}
                <span className="font-bold text-[#8E32A8] bg-[#F4EBF7] px-2.5 py-0.5 rounded-full border border-[#E8D1ED]">
                  {officeName}
                </span>{' '}
                •{' '}
              </>
            )}
            Submitted: <span className="font-bold text-[#261B50]">{new Date(request.created_at).toLocaleDateString()}</span> •{' '}
            Validity: <span className="font-bold text-[#261B50]">{new Date(request.start_date).toLocaleDateString()} to {new Date(request.end_date).toLocaleDateString()}</span>
          </p>
        </div>

        {/* PDF Pass Download if approved */}
        {isApproved && (
          <a
            href={request.pdf_letter_url ? `http://localhost:5000${request.pdf_letter_url}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="saas-pill-btn-primary whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download Gate Pass (PDF)</span>
          </a>
        )}
      </div>

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="bg-[#FDEEF1] border border-[#F9CAD3] rounded-3xl p-5 flex items-start gap-3.5 text-[#E04F69]">
          <XCircle className="w-5 h-5 text-[#E04F69] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-sm">Application Rejected</h4>
            <p className="text-xs text-[#B7334C] mt-0.5 leading-relaxed">
              This request was rejected and will not progress further through the department workflow.
              Please check reviewer remarks below.
            </p>
          </div>
        </div>
      )}

      {/* Visual Step Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#EAE0E8] space-y-8 my-4 ml-3">
        {stages.map((stage) => {
          const stepHist = findHistoryForStep(stage.stepOrder);
          const isDone = isApproved || stage.stepOrder < currentStep || (stage.stepOrder === 1);
          const isCurrent = !isApproved && !isRejected && stage.stepOrder === currentStep;
          const isStoppedHere = isRejected && stage.stepOrder === currentStep;

          let nodeStyle = 'bg-white border-[#EAE0E8] text-[#837B96]';

          if (isDone) {
            nodeStyle = 'bg-[#1E9A68] border-[#1E9A68] text-white shadow-xs';
          } else if (isCurrent) {
            nodeStyle = 'bg-[#B95BD5] border-[#B95BD5] text-white ring-4 ring-[#F4EBF7] animate-pulse';
          } else if (isStoppedHere) {
            nodeStyle = 'bg-[#E04F69] border-[#E04F69] text-white ring-4 ring-[#FDEEF1]';
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
              <div className="bg-[#FAF5F7] hover:bg-white rounded-3xl p-5 border border-[#EAE0E8] hover:border-[#D8B8E8] shadow-card-soft hover:shadow-card-hover transition-all duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#261B50]">
                      Step {stage.stepOrder}: {stage.name}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      stage.stepOrder === 4 && isAssignedToSpecialOffice
                        ? 'bg-[#F4EBF7] text-[#8E32A8] border border-[#E8D1ED] font-mono'
                        : 'bg-white text-[#7C7390] border border-[#EAE0E8]'
                    }`}>
                      {stage.role}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isDone
                      ? 'text-[#1E9A68] bg-[#E8F7F0] border border-[#B7E8D3]'
                      : isCurrent
                      ? 'text-[#E58B24] bg-[#FEF6EB] border border-[#FCE1C2]'
                      : isStoppedHere
                      ? 'text-[#E04F69] bg-[#FDEEF1] border border-[#F9CAD3]'
                      : 'text-[#837B96] bg-white border border-[#EAE0E8]'
                  }`}>
                    {isDone
                      ? 'Completed'
                      : isCurrent
                      ? 'Under Review'
                      : isStoppedHere
                      ? 'Rejected at this stage'
                      : 'Upcoming Stage'}
                  </span>
                </div>

                <p className="text-xs text-[#7C7390] mt-1.5">{stage.description}</p>

                {/* Audit remarks from reviewer */}
                {stepHist && (
                  <div className="mt-3 p-3.5 bg-white rounded-2xl border border-[#EAE0E8] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px] text-[#7C7390]">
                      <span className="font-bold text-[#261B50] flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#B95BD5]" />
                        {stepHist.reviewer_name || 'Department Officer'} ({stepHist.action})
                      </span>
                      <span className="font-medium">{new Date(stepHist.action_timestamp || stepHist.created_at).toLocaleString()}</span>
                    </div>
                    {stepHist.remarks && (
                      <p className="text-xs font-medium text-[#4F4665] italic bg-[#FAF5F7] p-2.5 rounded-xl border border-[#F0E8EE]">
                        "{stepHist.remarks}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Request Justification & Document Box */}
      <div className="bg-[#FAF5F7] rounded-3xl p-6 border border-[#EAE0E8] space-y-3">
        <h4 className="font-black text-sm text-[#261B50] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#B95BD5]" />
          Request Justification & Documentation
        </h4>
        <div className="p-4 bg-white rounded-2xl border border-[#EAE0E8] text-xs text-[#4F4665] leading-relaxed font-medium">
          "{request.reason}"
        </div>
      </div>
    </div>
  );
};

export default WorkflowTrackerTimeline;
