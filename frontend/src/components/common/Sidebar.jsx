import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Compass,
  FilePlus,
  Files,
  Activity,
  CheckSquare,
  Users,
  Building,
  Building2,
  Sliders,
  BarChart3,
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
          { to: '/student', label: 'Overview', icon: Compass, exact: true },
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
          { to: '/hod', label: 'Department Overview', icon: Compass, exact: true },
          { to: '/hod/sanctions', label: 'Final Sanctions', icon: Award },
          { to: '/hod/analytics', label: 'Analytics & Reports', icon: BarChart3 },
          { to: '/hod/faculty', label: 'Faculty & Mentors', icon: Users }
        ];
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Admin Dashboard', icon: Compass, exact: true },
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
    <aside className="w-56 sm:w-60 p-4 sm:p-6 shrink-0 relative z-10">
      <nav className="space-y-3.5">
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                isActive
                  ? 'bg-[#6B9FA3] text-white shadow-md shadow-[#6B9FA3]/25 font-bold border border-[#5E9CA0]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/80 shadow-xs hover:shadow-sm'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 -mr-1">
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
