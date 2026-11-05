import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Send, ShieldCheck } from 'lucide-react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  switch (normalized) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    case 'UNDER_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
          Under Review
        </span>
      );
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Pending
        </span>
      );
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
          <Send className="w-3.5 h-3.5 text-sky-600" />
          Submitted
        </span>
      );
    case 'VERIFIED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          Verified
        </span>
      );
    case 'URGENT':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-300 animate-pulse ${sizeClasses}`}>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          Urgent
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status || 'Unknown'}
        </span>
      );
  }
};

export default StatusBadge;
