import React from 'react';
import Navbar from '../../components/common/Navbar';

const MentorDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Mentor Verification Workspace</h2>
        <p className="text-sm text-slate-600">First-level review and verification for assigned mentee permission applications.</p>
      </div>
    </div>
  );
};

export default MentorDashboard;
