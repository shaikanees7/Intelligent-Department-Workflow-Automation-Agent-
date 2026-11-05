import React from 'react';
import Navbar from '../../components/common/Navbar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Department Administration & Workflow Settings</h2>
        <p className="text-sm text-slate-600">Configure sequential multi-level approval chains, audit trails, and student assignments.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
