import React from 'react';

/**
 * DukeRibbon - Distinctive royal blue bookmark ribbon hanging from top or bottom edges.
 * Uses CSS polygon clip-path for the iconic swallowtail (pennant) cut.
 */
const DukeRibbon = ({
  position = 'top',
  label = 'DUKE',
  year = '1838',
  className = ''
}) => {
  if (position === 'bottom') {
    return (
      <div
        className={`w-16 sm:w-20 h-36 bg-blue-600 shadow-2xl flex flex-col justify-end items-center pb-4 text-white pointer-events-none transition-transform duration-300 hover:translate-y-1 ${className}`}
        style={{
          clipPath: 'polygon(0 0, 50% 20px, 100% 0, 100% 100%, 0 100%)',
          backgroundColor: '#2563EB'
        }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white/70 mb-1" />
        <span className="font-serif text-[10px] tracking-widest uppercase font-bold text-white/90">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-14 sm:w-20 h-44 sm:h-56 bg-blue-600 shadow-2xl flex flex-col justify-between items-center py-4 text-white pointer-events-none transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 20px), 0 100%)',
        backgroundColor: '#2563EB'
      }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-sm" />
      <div className="font-serif text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase [writing-mode:vertical-rl] rotate-180 text-white/95">
        {label} {year}
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-white/60 mb-5" />
    </div>
  );
};

export default DukeRibbon;
