import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'UNDER_REVIEW':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-300';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
