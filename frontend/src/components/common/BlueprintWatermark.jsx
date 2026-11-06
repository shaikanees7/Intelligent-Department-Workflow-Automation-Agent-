import React from 'react';

/**
 * SaaSAmbientBackground - Atmospheric subtle blush, warm off-white, and pale lavender glow.
 * Matches the reference SaaS design language with soft, sophisticated lighting.
 */
const SaaSAmbientBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-gradient-to-br from-[#F8F2F4] via-[#F5EDF1] to-[#EFE7ED]"
    >
      {/* Subtle soft lavender ambient glow in top-left */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#B95BD5]/6 blur-3xl" />

      {/* Warm blush ambient glow in top-right */}
      <div className="absolute top-10 right-0 w-[500px] h-[500px] rounded-full bg-[#EAD4EB]/30 blur-3xl" />

      {/* Deep gentle plum radial in bottom-center */}
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[#34265F]/4 blur-3xl" />

      {/* Ultra-subtle dot grid texture */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.25]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="saas-ambient-dots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#B95BD5" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#saas-ambient-dots)" />
      </svg>
    </div>
  );
};

export default SaaSAmbientBackground;
