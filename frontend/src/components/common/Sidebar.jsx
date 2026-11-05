import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  Activity,
  CheckSquare,
  Users,
  Building,
  Building2,
  Sliders,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const getLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { to: '/student', label: 'Overview', icon: LayoutDashboard, exact: true },
          { to: '/student/new-request', label: 'Submit New Request', icon: FilePlus },
          { to: '/student/requests', label: 'My Applications', icon: Files },
          { to: '/student/track', label: 'Live Tracking', icon: Activity }
        ];
      case 'FACULTY':
        return [
          { to: '/faculty', label: 'Review Desk', icon: CheckSquare, exact: true },
          { to: '/faculty/history', label: 'Processed History', icon: Files },
          { to: '/faculty/analytics', label: 'Department OD Stats', icon: BarChart3 }
        ];
      case 'MENTOR':
        return [
          { to: '/mentor', label: 'Mentee Verification', icon: ShieldCheck, exact: true },
          { to: '/mentor/mentees', label: 'Assigned Mentees', icon: Users },
          { to: '/mentor/history', label: 'Verification Logs', icon: BookOpen }
        ];
      case 'HOD':
        return [
          { to: '/hod', label: 'Department Overview', icon: LayoutDashboard, exact: true },
          { to: '/hod/sanctions', label: 'Final Sanctions', icon: Award },
          { to: '/hod/analytics', label: 'Analytics & Reports', icon: BarChart3 },
          { to: '/hod/faculty', label: 'Faculty & Mentors', icon: Users }
        ];
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard, exact: true },
          { to: '/admin/offices', label: 'University Offices', icon: Building2 },
          { to: '/admin/users', label: 'User Directory', icon: Users },
          { to: '/admin/workflows', label: 'Workflow Config', icon: Sliders },
          { to: '/admin/departments', label: 'Departments', icon: Building },
          { to: '/admin/reports', label: 'Audit Reports', icon: BarChart3 }
        ];
      case 'OFFICE_ADMIN':
        return [
          { to: '/office', label: 'Office Review Desk', icon: Building2, exact: true },
          { to: '/office?tab=processed', label: 'Processed Applications', icon: Files }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-61px)] flex flex-col justify-between p-4 shrink-0 border-r border-slate-800">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {role} Portal
          </div>
          <nav className="mt-3 space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Institutional Info Card */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50">
          <div className="flex items-center gap-2 text-sky-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-xs font-bold">Smart Campus Agent</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Automating approvals, tracking gate passes, and audit trails digitally.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
        IDWAA System v1.0 • Academic Year 2025-2026
      </div>
    </aside>
  );
};

export default Sidebar;
