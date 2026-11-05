import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-5 space-y-6">
      <div className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Navigation</div>
      <nav className="space-y-1 text-sm">
        <NavLink to="/student" className="block px-3 py-2 rounded hover:bg-slate-800 text-slate-200 font-medium">
          Dashboard
        </NavLink>
        <NavLink to="/student/requests" className="block px-3 py-2 rounded hover:bg-slate-800 text-slate-400">
          Permission Requests
        </NavLink>
        <NavLink to="/student/history" className="block px-3 py-2 rounded hover:bg-slate-800 text-slate-400">
          History & Downloads
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
