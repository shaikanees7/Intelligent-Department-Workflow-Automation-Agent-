import React from 'react';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';

const StudentDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="STUDENT" />
        <main className="flex-1 p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">Student Permission Portal</h2>
            <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              + New Permission Request
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Total Requests</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">12</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Under Review</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">2</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Approved</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">9</h3>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Rejected</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">1</h3>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
