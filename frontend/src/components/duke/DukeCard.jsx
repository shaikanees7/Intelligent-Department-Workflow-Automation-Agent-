import React from 'react';

const DukeCard = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl transition-all duration-300 ${
        hoverEffect
          ? 'hover:border-blue-500/40 hover:shadow-duke-glow/40 hover:-translate-y-1'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default DukeCard;
