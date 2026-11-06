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
  BookOpen,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const location = useLocation();

  const getLinks = () => {
    switch (role) {
      case 'STUDENT':
        return [
          { to: '/student', label: 'Overview', icon: Compass, exact: true },
          { to: '/student/new-request', label: 'Submit Request', icon: FilePlus },
          { to: '/student/requests', label: 'My Applications', icon: Files },
          { to: '/student/track', label: 'Live Tracking', icon: Activity }
        ];
      case 'FACULTY':
        return [
          { to: '/faculty', label: 'Review Desk', icon: CheckSquare, exact: true },
          { to: '/faculty/history', label: 'Processed History', icon: Files },
          { to: '/faculty/analytics', label: 'Department Stats', icon: BarChart3 }
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
    <aside className="w-56 sm:w-64 p-4 sm:p-6 shrink-0 relative z-10 hidden md:block">
      <div className="space-y-6">
        <div className="text-[11px] font-black text-[#837B96] uppercase tracking-wider px-3">
          Navigation
        </div>

        <nav className="space-y-2.5">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 sm:px-5 py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none group ${
                  isActive
                    ? 'bg-[#261B50] text-white shadow-md shadow-[#261B50]/20 font-bold border border-[#34265F]'
                    : 'bg-white/90 hover:bg-white text-[#4F4665] hover:text-[#261B50] border border-[#EAE0E8] shadow-xs hover:border-[#D8B8E8] hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#B95BD5]' : 'text-[#837B96] group-hover:text-[#B95BD5]'
                  }`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B95BD5] shadow-xs" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Small Ambient Status Box */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1E163B] to-[#2B1D50] text-white shadow-xl border border-[#3A2A69] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#D8B8E8] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#B95BD5]" />
              Groq AI Agent
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-[#D4CEE4] leading-relaxed">
            Neural office routing & policy validation active
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
