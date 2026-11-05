import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Award, Menu, X, ArrowRight } from 'lucide-react';
import DukeButton from './DukeButton';

const DukeNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/#' },
    { label: 'About Us', href: '/#about' },
    { label: 'Scholarship & OD', href: '/#features' },
    { label: 'Event & News', href: '/#updates' },
    { label: 'Workflows', href: '/#workflows' }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 py-3 shadow-2xl'
          : 'bg-black/40 backdrop-blur-md border-b border-white/5 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo & Seal */}
        <Link to="/" className="flex items-center space-x-3.5 group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center p-2 group-hover:border-blue-400 group-hover:scale-105 transition-all shadow-lg">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 group-hover:text-white transition" />
          </div>
          <div>
            <span className="font-serif text-base sm:text-lg font-bold text-white tracking-wider block leading-tight">
              Duke University
            </span>
            <span className="text-[10px] text-slate-400 font-cinzel tracking-[0.2em] uppercase block">
              State College • Est. 1838
            </span>
          </div>
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold tracking-wider uppercase text-slate-300">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hover:text-blue-400 transition-colors duration-200 py-1"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Section: 5 Social Dots + Portal Button */}
        <div className="hidden sm:flex items-center space-x-5">
          {/* 5 Social Round Dots from Duke reference image */}
          <div className="flex items-center space-x-1.5" title="Campus Social Channels">
            {[1, 2, 3, 4, 5].map((dot) => (
              <span
                key={dot}
                className="w-2 h-2 rounded-full bg-white/40 hover:bg-blue-400 hover:scale-125 transition-all cursor-pointer"
              />
            ))}
          </div>

          <DukeButton to="/login" size="sm" showIcon={true}>
            Portal Login
          </DukeButton>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="lg:hidden flex items-center space-x-3">
          <DukeButton to="/login" size="sm" showIcon={false} className="sm:hidden px-3.5 py-1.5 text-xs">
            Login
          </DukeButton>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 rounded-full border border-white/20 bg-black/60 flex items-center justify-center text-slate-200 hover:text-white hover:border-blue-400 transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 text-sm font-semibold tracking-wider uppercase text-slate-300">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-blue-400 border-b border-white/5 transition"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((dot) => (
                <span key={dot} className="w-2.5 h-2.5 rounded-full bg-white/40" />
              ))}
            </div>
            <DukeButton to="/login" size="sm" showIcon={true}>
              Portal Login
            </DukeButton>
          </div>
        </div>
      )}
    </header>
  );
};

export default DukeNavbar;
