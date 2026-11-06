import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Send, ShieldCheck, HelpCircle } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs';

  switch (normalized) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'APPROVED AND VALID':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#E8F7F0] text-[#1E9A68] border border-[#B7E8D3] shadow-2xs ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9A68]" />
          {normalized === 'ACTIVE' ? 'Active Pass' : normalized === 'APPROVED AND VALID' ? 'Approved & Valid' : 'Approved'}
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FDEEF1] text-[#E04F69] border border-[#F9CAD3] shadow-2xs ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-[#E04F69]" />
          Rejected
        </span>
      );
    case 'EXPIRED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#F4F1F6] text-[#7E7492] border border-[#DDD5E5] shadow-2xs ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-[#7E7492]" />
          Expired
        </span>
      );
    case 'REVOKED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FDE8EC] text-[#C92A4B] border border-[#F5B4C2] shadow-2xs ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-[#C92A4B]" />
          Revoked
        </span>
      );
    case 'INVALID QR':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FDE8EC] text-[#C92A4B] border border-[#F5B4C2] shadow-2xs ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-[#C92A4B]" />
          Invalid QR
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FEF6EB] text-[#E58B24] border border-[#FCE1C2] shadow-2xs ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-[#E58B24] animate-spin" style={{ animationDuration: '4s' }} />
          Under Review
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#F4EBF7] text-[#8E32A8] border border-[#E8D1ED] shadow-2xs ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-[#8E32A8]" />
          Pending
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#EEF2FC] text-[#4F6FB7] border border-[#D1DDF9] shadow-2xs ${sizeClasses}`}>
          <Send className="w-3.5 h-3.5 text-[#4F6FB7]" />
          Submitted
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#F5EDFA] text-[#A847C5] border border-[#EAD1F3] shadow-2xs ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-[#A847C5]" />
          Verified
        </span>
      );
    case 'URGENT':
      return (
        <span className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FDEEF1] text-[#E04F69] border border-[#E04F69] shadow-2xs animate-pulse ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-[#E04F69]" />
          Urgent
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-[#F8F3F6] text-[#7C7390] border border-[#EAE0E8] ${sizeClasses}`}>
          <HelpCircle className="w-3.5 h-3.5 text-[#7C7390]" />
          {status || 'Unknown'}
        </span>
      );
  }
};

export default StatusBadge;
