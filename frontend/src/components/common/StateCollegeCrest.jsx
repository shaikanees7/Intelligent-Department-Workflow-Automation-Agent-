import React from 'react';

/**
 * StateCollegeCrest - Institutional heraldic shield crest with lion silhouette
 * As featured on the top-left of the reference design image.
 */
const StateCollegeCrest = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full text-slate-800"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Outer Border with Laurel Flourishes */}
        <path
          d="M 50 5 C 65 5 95 10 95 35 C 95 80 50 115 50 115 C 50 115 5 80 5 35 C 5 10 35 5 50 5 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        {/* Shield Inner Inset */}
        <path
          d="M 50 12 C 62 12 88 16 88 37 C 88 74 50 106 50 106 C 50 106 12 74 12 37 C 12 16 38 12 50 12 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />

        {/* Heraldic Lion Rampant Silhouette */}
        <g transform="translate(26, 26) scale(0.48)" fill="currentColor">
          <path d="M 45 10 C 40 8 36 12 37 18 C 34 16 30 18 29 22 C 26 21 23 23 23 27 C 23 32 28 35 32 35 C 30 38 27 42 22 43 C 18 40 14 41 12 45 C 10 49 13 54 18 54 C 20 54 23 52 25 50 C 27 55 28 62 26 70 C 22 70 18 73 17 78 C 16 83 20 87 25 86 C 28 85 30 82 30 78 C 32 85 35 90 38 95 C 35 97 33 100 33 104 C 33 110 38 114 43 113 C 48 112 50 107 49 103 C 48 97 45 93 42 90 C 46 80 47 70 48 60 C 51 64 54 70 59 74 C 64 78 70 79 75 76 C 80 73 80 67 76 63 C 71 60 66 61 62 65 C 57 59 55 52 54 44 C 58 43 63 42 67 38 C 71 34 70 28 66 26 C 62 24 58 27 57 31 C 54 33 51 34 48 35 C 49 28 50 20 45 10 Z" />
          <circle cx="34" cy="22" r="2.5" fill="#FFFFFF" />
          {/* Crown atop Lion */}
          <path d="M 36 4 L 41 9 L 46 4 L 51 9 L 56 4 L 55 12 L 37 12 Z" />
        </g>
      </svg>
    </div>
  );
};

export default StateCollegeCrest;
