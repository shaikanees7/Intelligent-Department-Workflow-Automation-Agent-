import React from 'react';

/**
 * BlueprintWatermark - Institutional architectural schematic floorplan watermark
 * Renders behind post-login dashboard routes as seen in the reference design.
 */
const BlueprintWatermark = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.14] select-none"
    >
      <svg
        className="w-full h-full text-slate-600"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="blueprint-subgrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
          </pattern>
          <pattern id="blueprint-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <rect width="120" height="120" fill="url(#blueprint-subgrid)" />
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
          </pattern>
        </defs>

        {/* Global Grid */}
        <rect width="100%" height="100%" fill="url(#blueprint-grid)" />

        {/* Left Side Architectural Floor Plan (Library / University Section) */}
        <g stroke="currentColor" fill="none" strokeWidth="1.2">
          {/* Main Corridor Walls */}
          <rect x="40" y="80" width="280" height="420" strokeWidth="2" />
          <line x1="180" y1="80" x2="180" y2="500" strokeDasharray="6 4" />
          
          {/* Room Partitions */}
          <rect x="40" y="80" width="140" height="110" />
          <rect x="40" y="190" width="140" height="120" />
          <rect x="40" y="310" width="140" height="190" />
          
          <rect x="180" y="80" width="140" height="180" />
          <rect x="180" y="260" width="140" height="240" />

          {/* Door Arcs */}
          <path d="M 180 140 A 30 30 0 0 1 150 170" strokeWidth="0.8" />
          <path d="M 180 230 A 30 30 0 0 1 150 260" strokeWidth="0.8" />
          <path d="M 180 370 A 30 30 0 0 1 150 400" strokeWidth="0.8" />

          {/* Floorplan Labels */}
          <text x="60" y="145" fontSize="11" fontFamily="monospace" fill="currentColor" letterSpacing="2" opacity="0.6">
            LIBRARY
          </text>
          <text x="60" y="255" fontSize="10" fontFamily="monospace" fill="currentColor" letterSpacing="1.5" opacity="0.5">
            UNIVERSITY
          </text>
          <text x="60" y="380" fontSize="11" fontFamily="monospace" fill="currentColor" letterSpacing="2" opacity="0.6">
            LIBRARY
          </text>
          <text x="200" y="150" fontSize="10" fontFamily="monospace" fill="currentColor" letterSpacing="1" opacity="0.5">
            RM #43-STUDIO
          </text>
          <text x="200" y="340" fontSize="10" fontFamily="monospace" fill="currentColor" letterSpacing="1" opacity="0.5">
            CONFERENCE
          </text>
        </g>

        {/* Center / Campus Cathedral Silhouette Line Art */}
        <g stroke="currentColor" fill="none" strokeWidth="1" strokeOpacity="0.4" transform="translate(560, 160)">
          {/* Spire Tower */}
          <path d="M 120 0 L 130 140 L 150 140 L 160 280 L 80 280 L 90 140 L 110 140 Z" />
          {/* Arches */}
          <path d="M 105 180 A 15 20 0 0 1 135 180 L 135 240 L 105 240 Z" />
          <path d="M 70 240 A 20 25 0 0 1 110 240 L 110 320 L 70 320 Z" />
          <path d="M 130 240 A 20 25 0 0 1 170 240 L 170 320 L 130 320 Z" />
          {/* Flying buttresses & roof outlines */}
          <line x1="30" y1="280" x2="80" y2="280" />
          <line x1="160" y1="280" x2="210" y2="280" />
          <path d="M 30 280 L 0 350 L 240 350 L 210 280" />
        </g>

        {/* Right Side Engineering Circuit / Floor Grid Lines */}
        <g stroke="currentColor" fill="none" strokeWidth="0.9" opacity="0.35">
          <circle cx="1180" cy="180" r="45" strokeDasharray="3 3" />
          <line x1="1180" y1="80" x2="1180" y2="280" />
          <line x1="1080" y1="180" x2="1280" y2="180" />
          <rect x="1040" y="320" width="240" height="160" strokeDasharray="4 4" />
          <circle cx="1160" cy="400" r="12" />
          <circle cx="1160" cy="400" r="4" fill="currentColor" />
          <text x="1060" y="350" fontSize="9" fontFamily="monospace" fill="currentColor" letterSpacing="1">
            EAST WING BLDG 02
          </text>
        </g>
      </svg>
    </div>
  );
};

export default BlueprintWatermark;

