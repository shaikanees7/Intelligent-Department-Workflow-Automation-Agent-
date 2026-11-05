import React from 'react';
import Navbar from '../../components/common/Navbar';
import WorkflowTrackerTimeline from '../../components/tracking/WorkflowTrackerTimeline';

const TrackRequest = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Application Live Tracking</h2>
        <WorkflowTrackerTimeline
          steps={[
            { step_order: 1, step_name: 'Mentor Verification', required_role: 'MENTOR' },
            { step_order: 2, step_name: 'Faculty Department Sanction', required_role: 'FACULTY' },
            { step_order: 3, step_name: 'HOD Final Approval', required_role: 'HOD' }
          ]}
          currentStepOrder={2}
          overallStatus="UNDER_REVIEW"
        />
      </div>
    </div>
  );
};

export default TrackRequest;
