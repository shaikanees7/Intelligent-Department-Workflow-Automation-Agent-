import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

const DukeButton = ({
  children,
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon: Icon = ArrowRight,
  showIcon = true,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-4 py-2 gap-1.5',
    md: 'text-xs sm:text-sm px-6 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-8 py-3.5 gap-2.5',
  }[size] || 'text-xs sm:text-sm px-6 py-2.5 gap-2';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/35 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:scale-95 border border-blue-400/20',
    secondary:
      'bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-semibold border border-white/20 backdrop-blur-md hover:-translate-y-0.5 active:scale-95',
    glass:
      'bg-black/40 hover:bg-black/60 text-slate-300 hover:text-white font-medium border border-white/10 backdrop-blur-md active:scale-95',
    danger:
      'bg-rose-600/80 hover:bg-rose-600 text-white font-bold border border-rose-500/30 shadow-lg shadow-rose-600/30 active:scale-95',
  }[variant] || variantStyles.primary;

  const baseStyles =
    'inline-flex items-center justify-center rounded-full transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const fullClassName = `${baseStyles} ${sizeStyles} ${variantStyles} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-white" />
      ) : null}
      <span>{children}</span>
      {!loading && showIcon && Icon && (
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center -mr-1 transition-transform group-hover:translate-x-0.5">
          <Icon className="w-3 h-3 text-white" />
        </span>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${fullClassName}`} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={`group ${fullClassName}`} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`group ${fullClassName}`}
      {...props}
    >
      {content}
    </button>
  );
};

export default DukeButton;
