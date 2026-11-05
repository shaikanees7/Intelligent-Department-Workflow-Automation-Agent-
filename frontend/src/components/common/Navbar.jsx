import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-primary-700 text-white rounded-lg flex items-center justify-center font-bold">
          WA
        </div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Workflow Automation Agent
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-slate-600">
          {user?.first_name} {user?.last_name} ({user?.role})
        </span>
        <button
          onClick={logout}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded border border-slate-300 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
