import React from 'react';
import { Link } from 'react-router-dom';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';

const NotFound = () => (
  <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center font-sans text-saas-textDark">
    <BlueprintWatermark />
    <div className="saas-card rounded-3xl p-8 max-w-md w-full relative z-10 space-y-4">
      <h1 className="text-6xl font-black text-saas-navy">404</h1>
      <h2 className="text-xl font-bold text-saas-textDark">Page Not Found</h2>
      <p className="text-xs text-saas-textMuted leading-relaxed">
        The requested university portal address does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Link to="/login" className="saas-pill-btn-primary inline-flex text-xs px-6 py-2.5">
          Return to Portal
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
