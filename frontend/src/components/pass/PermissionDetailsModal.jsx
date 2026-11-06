import React, { useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  QrCode,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const PermissionDetailsModal = ({ isOpen, onClose, permission, onViewPass }) => {
  // Prevent background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !permission) return null;

  const isApproved = permission.overall_status === 'APPROVED';
  const isRejected = permission.overall_status === 'REJECTED';
  const isPending = !isApproved && !isRejected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#160E2E]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-[#EAE0E8] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#F0E6EE] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F6EEF8] border border-[#E8D5EC] flex items-center justify-center text-[#B95BD5]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-[#261B50]">
                  Permission Details
                </h3>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#FAF5F7] border border-[#E8DDE6] text-[#4F4665]">
                  {permission.request_code}
                </span>
              </div>
              <p className="text-xs text-[#837B96] mt-0.5">
                Submitted on {new Date(permission.submission_date || permission.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF5F7] hover:bg-[#F3EAF1] text-[#837B96] hover:text-[#261B50] flex items-center justify-center transition-colors border border-[#EAE0E8]"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          {/* Top Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB]">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-[#837B96]">
                Application Status
              </div>
              <div className="mt-1">
                <StatusBadge status={permission.overall_status} size="md" />
              </div>
            </div>

            {permission.pass_reference && (
              <div className="text-right">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#837B96]">
                  Digital Pass ID
                </div>
                <div className="mt-1 flex items-center justify-end gap-1.5 font-mono text-xs font-bold text-[#B95BD5]">
                  <QrCode className="w-3.5 h-3.5" />
                  {permission.pass_reference}
                </div>
              </div>
            )}
          </div>

          {/* 1. Permission Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#261B50]">
              <FileText className="w-4 h-4 text-[#B95BD5]" />
              Permission Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE0E8]">
                <span className="text-[#837B96] block text-[11px]">Permission Category</span>
                <span className="font-bold text-[#261B50] mt-0.5 block text-sm">
                  {permission.request_type} - {
                    permission.request_type === 'OD' ? 'On-Duty Institutional Permission' :
                    permission.request_type === 'LEAVE' ? 'Student Leave Application' :
                    permission.request_type === 'EVENT' ? 'Technical / Sports Event Participation' :
                    'Academic / Exam Rescheduling'
                  }
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE0E8]">
                <span className="text-[#837B96] block text-[11px]">Validity Dates</span>
                <span className="font-bold text-[#261B50] mt-0.5 block text-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#B95BD5]" />
                  {new Date(permission.start_date).toLocaleDateString()} &rarr; {new Date(permission.end_date).toLocaleDateString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#EAE0E8] sm:col-span-2">
                <span className="text-[#837B96] block text-[11px]">Stated Reason / Purpose</span>
                <p className="font-medium text-[#261B50] mt-1 leading-relaxed whitespace-pre-wrap">
                  {permission.reason}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Student Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#261B50]">
              <User className="w-4 h-4 text-[#B95BD5]" />
              Student Information
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB]">
                <span className="text-[#837B96] block text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-bold text-[#261B50] mt-0.5 block truncate">
                  {permission.first_name ? `${permission.first_name} ${permission.last_name || ''}` : 'Self (Authenticated)'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB]">
                <span className="text-[#837B96] block text-[10px] uppercase font-bold">Reg. Number</span>
                <span className="font-bold font-mono text-[#261B50] mt-0.5 block truncate">
                  {permission.registration_number || 'REG2024CSE001'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB]">
                <span className="text-[#837B96] block text-[10px] uppercase font-bold">Department</span>
                <span className="font-bold text-[#261B50] mt-0.5 block truncate">
                  {permission.department_name || permission.department_code || 'CSE'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB]">
                <span className="text-[#837B96] block text-[10px] uppercase font-bold">Section</span>
                <span className="font-bold text-[#261B50] mt-0.5 block">
                  Sec {permission.section || 'A'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Approval Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#261B50]">
              <ShieldCheck className="w-4 h-4 text-[#B95BD5]" />
              Approval Workflow Status
            </div>

            {isApproved ? (
              <div className="p-4 rounded-2xl bg-[#E8F7F0] border border-[#B7E8D3] flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1E9A68] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#1E9A68] text-sm">
                    Final Sanction Sanctioned & Recorded
                  </div>
                  <p className="text-[#2F7355] mt-1 leading-relaxed">
                    This request completed all departmental reviews (Mentor, Faculty Coordinator, and Head of Department). Official digital pass generated and ready for immediate verification.
                  </p>
                </div>
              </div>
            ) : isPending ? (
              <div className="p-4 rounded-2xl bg-[#F4EBF7] border border-[#E8D1ED] flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#8E32A8] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#8E32A8] text-sm">
                    Under Review by {permission.current_reviewer_role || 'Academic Authority'}
                  </div>
                  <p className="text-[#6D347E] mt-1 leading-relaxed">
                    Your application is currently under review. The digital permission pass will be available automatically after final institutional approval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FDEEF1] border border-[#F9CAD3] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#E04F69] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-[#E04F69] text-sm">
                    Request Rejected
                  </div>
                  <p className="text-[#962A3D] mt-1 leading-relaxed">
                    This permission application was rejected through the authorized approval process.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Digital Pass Information (If pass exists) */}
          {permission.pass_reference && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5F7] to-[#F5EDF8] border border-[#E8D5EC] space-y-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#261B50] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#B95BD5]" />
                  Digital Permission Pass
                </span>
                <StatusBadge status={permission.pass_status || 'ACTIVE'} size="sm" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[#837B96] text-[11px] block">Pass Reference</span>
                  <span className="font-mono font-bold text-[#261B50]">{permission.pass_reference}</span>
                </div>
                <div>
                  <span className="text-[#837B96] text-[11px] block">Validity Window</span>
                  <span className="font-bold text-[#261B50]">
                    {new Date(permission.pass_valid_from || permission.start_date).toLocaleDateString()} - {new Date(permission.pass_valid_until || permission.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[#837B96] text-[11px] block">Issued At</span>
                  <span className="font-bold text-[#261B50]">
                    {new Date(permission.pass_issued_at || permission.last_updated || new Date()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 border-t border-[#F0E6EE] bg-[#FAF5F7] rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-bold text-[#4F4665] hover:text-[#261B50] hover:bg-[#F3EAF1] border border-[#EAE0E8] transition-colors"
          >
            Close
          </button>

          {isApproved && permission.pass_reference ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onViewPass) onViewPass(permission);
              }}
              className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] text-white shadow-md shadow-[#261B50]/20 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <QrCode className="w-4 h-4 text-[#B95BD5]" />
              View Digital Permission Pass
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="text-xs text-[#837B96] italic">
              {isApproved ? 'Pass generation in progress' : 'Pass available upon approval'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionDetailsModal;
