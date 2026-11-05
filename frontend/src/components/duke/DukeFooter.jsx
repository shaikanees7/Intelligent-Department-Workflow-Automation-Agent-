import React from 'react';
import { Link } from 'react-router-dom';
import { Award, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';
import DukeRibbon from './DukeRibbon';

const DukeFooter = () => {
  return (
    <footer className="bg-black text-slate-400 pt-16 pb-12 border-t border-zinc-900 relative overflow-hidden">
      {/* Bottom Right Royal Blue Hanging Ribbon Accent */}
      <div className="absolute bottom-0 right-8 sm:right-24 z-20 pointer-events-none">
        <DukeRibbon position="bottom" label="DUKE" year="1838" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-900">
        {/* Column 1: Seal & Identity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-full border border-white/20 bg-zinc-950 flex items-center justify-center p-2.5 shadow-xl">
              <Award className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wider leading-none">
                Duke University
              </h3>
              <span className="text-[10px] text-slate-400 font-cinzel tracking-[0.25em] uppercase block mt-1">
                State College • Established 1838
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
            The Character of Success. Autonomous multi-tier institutional workflow automation agent
            powering permissions, on-duty certifications, and gate passes with end-to-end digital audit trails.
          </p>

          <div className="flex items-center space-x-2 pt-2">
            {[1, 2, 3, 4, 5].map((dot) => (
              <span
                key={dot}
                className="w-2.5 h-2.5 rounded-full bg-zinc-700 hover:bg-blue-400 transition-colors cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div className="space-y-3.5 text-xs">
          <h4 className="font-serif text-sm font-bold text-white tracking-wider">Contact</h4>
          <div className="space-y-2.5 text-slate-400">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Durham, NC 27708, USA • Department Automation Desk</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" />
              <span>+1 (919) 684-8111</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" />
              <span>workflow.automation@duke.edu</span>
            </p>
          </div>
        </div>

        {/* Column 3: About Links */}
        <div className="space-y-3.5 text-xs">
          <h4 className="font-serif text-sm font-bold text-white tracking-wider">About You</h4>
          <ul className="space-y-2.5 text-slate-400">
            <li><a href="/#about" className="hover:text-blue-400 transition">University Heritage</a></li>
            <li><a href="/#features" className="hover:text-blue-400 transition">Autonomous AI Routing</a></li>
            <li><a href="/#updates" className="hover:text-blue-400 transition">Academic Calendar</a></li>
            <li><a href="/#workflows" className="hover:text-blue-400 transition">Gate Pass Validation</a></li>
          </ul>
        </div>

        {/* Column 4: Join Us / Portals */}
        <div className="space-y-3.5 text-xs">
          <h4 className="font-serif text-sm font-bold text-white tracking-wider">Join Us</h4>
          <ul className="space-y-2.5 text-slate-400">
            <li>
              <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                Student Application Desk <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                Academic Mentor Verification <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                Faculty Coordinator Sanction <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                HOD Approval Hub <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-blue-400 transition flex items-center gap-1">
                Central Admin Portal <ArrowUpRight className="w-3 h-3 opacity-60" />
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} Duke University. All rights reserved.</p>
        <p className="font-cinzel tracking-wider text-slate-400">
          The Character of Success • Intelligent Department Automation
        </p>
      </div>
    </footer>
  );
};

export default DukeFooter;
