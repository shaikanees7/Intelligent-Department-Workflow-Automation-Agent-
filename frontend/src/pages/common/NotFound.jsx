import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-5xl font-extrabold text-slate-800">404</h1>
    <p className="text-lg text-slate-600 mt-2">Page Not Found</p>
    <Link to="/login" className="mt-4 text-primary-600 font-semibold underline">Return to Login</Link>
  </div>
);

export default NotFound;
