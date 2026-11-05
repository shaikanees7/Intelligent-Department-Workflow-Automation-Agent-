import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowLeft, Home } from 'lucide-react';
import DukeRibbon from '../../components/duke/DukeRibbon';
import DukeButton from '../../components/duke/DukeButton';

const NotFound = () => (
  <div className="relative min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden text-slate-100">
    {/* Background Campus Image with Cinematic Dark Overlay */}
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-40 scale-100"
      style={{ backgroundImage: "url('/campus-bg.jpg')" }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black pointer-events-none" />

    {/* Duke Hanging Blue Ribbon in Top-Right Corner */}
    <div className="absolute top-0 right-6 sm:right-16 z-30">
      <DukeRibbon position="top" label="DUKE" year="1838" />
    </div>

    <div className="relative z-10 max-w-lg mx-auto bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
      <div className="w-16 h-16 rounded-full border border-white/30 bg-black/60 backdrop-blur-md flex items-center justify-center mx-auto shadow-2xl">
        <Award className="w-9 h-9 text-blue-400" />
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-6xl sm:text-7xl font-bold text-white tracking-tight">404</h1>
        <h2 className="font-serif text-xl font-bold text-white">Page Not Found</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          The requested institutional page or workflow route could not be located in the university portal directory.
        </p>
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <DukeButton to="/" size="md" icon={Home}>
          Return to Homepage
        </DukeButton>
      </div>
    </div>
  </div>
);

export default NotFound;
