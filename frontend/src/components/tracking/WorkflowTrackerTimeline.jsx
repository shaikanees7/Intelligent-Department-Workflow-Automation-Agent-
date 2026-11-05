import React from 'react';

const WorkflowTrackerTimeline = ({ steps, currentStepOrder, overallStatus }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-base font-bold text-slate-800 mb-6">Approval Journey Timeline</h3>
      <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
        {steps.map((step, idx) => {
          const isDone = step.step_order < currentStepOrder || overallStatus === 'APPROVED';
          const isCurrent = step.step_order === currentStepOrder && overallStatus !== 'APPROVED' && overallStatus !== 'REJECTED';
          return (
            <div key={idx} className="relative">
              <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 ${
                isDone ? 'bg-emerald-500 border-emerald-500' : isCurrent ? 'bg-amber-500 border-amber-500 animate-pulse' : 'bg-white border-slate-300'
              }`} />
              <div>
                <p className="font-semibold text-slate-800">{step.step_name}</p>
                <p className="text-xs text-slate-500">Reviewing Authority: {step.required_role}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowTrackerTimeline;
