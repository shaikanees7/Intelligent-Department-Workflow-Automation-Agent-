import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Building,
  Building2,
  Presentation,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  Bell,
  Download,
  Zap,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import DukeNavbar from '../components/duke/DukeNavbar';
import DukeFooter from '../components/duke/DukeFooter';
import DukeRibbon from '../components/duke/DukeRibbon';
import DukeButton from '../components/duke/DukeButton';
import DukeCard from '../components/duke/DukeCard';

const LandingPage = () => {
  // Calendar interactive state for Updates section
  const [selectedDay, setSelectedDay] = useState(8);
  const [calMonth, setCalMonth] = useState('November 2026');

  // Days for November 2026
  const calendarDays = [
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28,
    29, 30
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* 1. STICKY DUKE NAVBAR                                            */}
      {/* ---------------------------------------------------------------- */}
      <DukeNavbar />

      {/* ---------------------------------------------------------------- */}
      {/* 2. HERO SECTION WITH DUKE / CAMPUS AERIAL BACKDROP               */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative min-h-[95vh] lg:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 overflow-hidden">
        {/* Full-width Aerial Campus Photo Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-100 transition-transform duration-1000"
          style={{ backgroundImage: "url('/vignan-hero.jpg')" }}
        />
        {/* Cinematic Dark Vignette Overlay (Reference Image Gradient) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black pointer-events-none" />

        {/* Iconic Hanging Blue Ribbon Tab (Duke Style) */}
        <div className="absolute top-0 right-6 sm:right-16 z-40">
          <DukeRibbon position="top" label="DUKE" year="1838" />
        </div>

        {/* Center Hero Crest & Headings */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-6 pt-12 sm:pt-16 pb-24">
          {/* Circular University Crest Icon with Laurel Wreath */}
          <div className="inline-flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center shadow-2xl mb-3 hover:border-blue-400 transition-colors">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400" />
            </div>
            <div className="text-[11px] sm:text-xs font-cinzel font-semibold tracking-[0.3em] text-slate-300 uppercase">
              STATE COLLEGE • FOUNDED 1838
            </div>
          </div>

          {/* Grand Clean Serif Title matching reference image */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
            Duke University
          </h1>

          {/* Tagline */}
          <p className="font-cinzel text-xs sm:text-sm font-semibold tracking-[0.35em] text-blue-400 uppercase drop-shadow-md">
            The Character of Success • Intelligent Department Automation
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 font-sans leading-relaxed drop-shadow-sm">
            Autonomous multi-tier digital permission platform. Automating On-Duty, Leave, and Event
            requests across students, mentors, coordinators, and university offices with real-time audit trails.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <DukeButton to="/login" size="md" variant="primary">
              Access Digital Portal
            </DukeButton>
            <DukeButton href="#about" size="md" variant="secondary" showIcon={false}>
              Explore Campus
            </DukeButton>
          </div>

          {/* Mouse Scroll Indicator */}
          <div className="pt-6 flex justify-center text-slate-400">
            <div className="w-5 h-8 rounded-full border-2 border-slate-400/50 flex justify-center p-1 animate-bounce">
              <div className="w-1 h-2 bg-blue-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* 3 Overlapping Black Glass Feature Cards (At Bottom of Hero) */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 w-full -mb-16 sm:-mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Scholarship & OD */}
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 hover:border-blue-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center text-xs transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-blue-400 transition">
                Scholarship & OD
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Streamlined sanctioning for hackathons, paper presentations, and merit scholarships with automated AI verification.
              </p>
            </div>

            {/* Card 2: Our Campus & Offices */}
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 hover:border-blue-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center text-xs transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-blue-400 transition">
                Our Campus & Offices
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Official digital gate passes generated with cryptographic reference codes and office authorization signatures.
              </p>
            </div>

            {/* Card 3: Academic Programs */}
            <div className="bg-black/90 backdrop-blur-xl border border-white/10 hover:border-blue-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <Presentation className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-blue-600 text-white flex items-center justify-center text-xs transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-blue-400 transition">
                Academic Programs
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Departmental hierarchy configuration across Computer Science, Electronics, Mechanical, and Engineering cohorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. SPLIT SECTION (TEXT LEFT, GRADUATE PORTRAIT RIGHT)            */}
      {/* ---------------------------------------------------------------- */}
      <section id="about" className="pt-32 pb-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-cinzel font-bold tracking-[0.25em] uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Institutional Heritage & Innovation
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Duke University
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              <p>
                Established with a vision to deliver world-class technical education, Duke University
                represents a benchmark in academic discipline, pioneering research, and student empowerment.
              </p>
              <p>
                To eliminate tedious paper slips and physical files, the <strong>Intelligent Department
                Workflow Automation Agent (IDWAA)</strong> orchestrates digital permissions seamlessly.
                Every request—whether for an international hackathon, medical leave, or college symposium—advances
                automatically from student to academic mentor, faculty coordinator, and the responsible university office.
              </p>
              <p className="text-slate-400">
                Automated 24-hour reminder crons prevent delays, while verified students can download official
                digital gate passes with cryptographic verification codes upon final sanction.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <DukeButton to="/login" size="md">
                Sign In to Department Desk
              </DukeButton>
              <a
                href="#features"
                className="text-xs font-bold text-slate-300 hover:text-white underline underline-offset-4 transition"
              >
                View Workflow Sequence →
              </a>
            </div>
          </div>

          {/* Right Column: Academic Portrait in Cap & Gown */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              {/* Decorative background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-sky-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500" />

              <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-zinc-950 shadow-2xl aspect-[3/4]">
                {/* Academic Portrait */}
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: "url('/campus-bg.jpg')",
                    filter: 'brightness(0.95)'
                  }}
                />

                {/* Glass overlay badge on photo */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white">Excellence in Higher Education</h4>
                      <p className="text-[11px] text-slate-300 font-sans">Empowering 15,000+ campus scholars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. MAIN WORKFLOW CAPABILITIES & TOOLS                           */}
      {/* ---------------------------------------------------------------- */}
      <section id="features" className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-blue-400 font-cinzel text-xs font-bold tracking-[0.25em] uppercase">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Intelligent Workflow Tools
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
              Engineered with rule-based automation and Groq AI classification to replace friction with instant transparency.
            </p>
          </div>

          {/* Grid of Rounded Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                Multi-Level Workflow Engine
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Sequential progression from Student submission to Mentor verification, Faculty scrutiny,
                and final Office / HOD sanction. Applications automatically move forward upon approval.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                4-Tier Sequential Hierarchy <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>

            {/* Feature 2 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                Dynamic Urgency Assessment
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Intelligent rules evaluate departure dates. Requests with lead times &le; 48 hours are
                auto-flagged as High Priority to ensure rapid departmental attention.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                Auto-Urgency Detection <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>

            {/* Feature 3 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                24-Hour Autonomous Reminders
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Background cron monitors stagnant requests. If an application remains pending for over 24
                hours, automated alerts ping the responsible authority.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                Hourly Background Worker <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>

            {/* Feature 4 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                Digital PDF Gate Passes
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Generates official, downloadable PDF permission letters with unique reference numbers and
                digital timestamps immediately upon final sanction.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                Cryptographic Reference Code <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>

            {/* Feature 5 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                Role-Based Security & RBAC
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Dedicated dashboards for Student, Mentor, Faculty Coordinator, HOD, and Office Admin. Protected
                JWT routes guarantee students only access their own requests.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                JWT & Bcrypt Authenticated <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>

            {/* Feature 6 */}
            <DukeCard className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-blue-400 transition">
                Live Timeline Audit Trail
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Complete transparency. View exact stage progress, reviewer names, exact timestamps, and
                reviewer remarks quoted at every step.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                Real-Time Visual Journey <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </DukeCard>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 5. BENTO GRID / UPDATES & NEWS SECTION                           */}
      {/* ---------------------------------------------------------------- */}
      <section id="updates" className="relative py-28 overflow-hidden">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none filter blur-[1px] scale-105"
          style={{ backgroundImage: "url('/vignan-blue-tint.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-950/70 to-black pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
          {/* Section Header matching "• News." in reference */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-blue-400 font-cinzel text-xs font-bold tracking-[0.25em] uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              Communication Center | For You Page
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              • News.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl leading-relaxed">
              Stay synchronized with institutional schedules, hackathon OD windows, and departmental announcements.
            </p>
          </div>

          {/* Cards & Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 Bento News Cards (2x2 Column) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Bento Card 1 */}
              <DukeCard className="space-y-4 hover:border-blue-400/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  <span>HOT | TODAY</span>
                  <span className="text-slate-400">Nov 5, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white hover:text-blue-400 transition leading-snug">
                  Smart India Hackathon 2026: 3-Day OD Sanction Guidelines Released
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Finalist teams from CSE and ECE can submit On-Duty applications. Attendance credit auto-mapped upon office digital sign-off.
                </p>
                <DukeButton to="/login" size="sm" showIcon={true}>
                  Read News
                </DukeButton>
              </DukeCard>

              {/* Bento Card 2 */}
              <DukeCard className="space-y-4 hover:border-blue-400/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  <span>ACADEMIC</span>
                  <span className="text-slate-400">Nov 4, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white hover:text-blue-400 transition leading-snug">
                  Medical Leave Verification: Doctor Certificate Upload Mandatory
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Students requesting medical leave exceeding two days must attach physician prescriptions via the student portal.
                </p>
                <DukeButton to="/login" size="sm" showIcon={true}>
                  Read News
                </DukeButton>
              </DukeCard>

              {/* Bento Card 3 */}
              <DukeCard className="space-y-4 hover:border-blue-400/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  <span>EVENT</span>
                  <span className="text-slate-400">Nov 2, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white hover:text-blue-400 transition leading-snug">
                  Inter-Collegiate Robocon Challenge Registration Open
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Robotics Club members can now request lab access and workshop participation permission digitally.
                </p>
                <DukeButton to="/login" size="sm" showIcon={true}>
                  Read News
                </DukeButton>
              </DukeCard>

              {/* Bento Card 4 */}
              <DukeCard className="space-y-4 hover:border-blue-400/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                  <span>CAMPUS GATE</span>
                  <span className="text-slate-400">Nov 1, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white hover:text-blue-400 transition leading-snug">
                  Automated Gate Scanner Sync for Approved PDF Permission Letters
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Campus security gates now verify digital passes directly by checking the unique alphanumeric reference code.
                </p>
                <DukeButton to="/login" size="sm" showIcon={true}>
                  Read News
                </DukeButton>
              </DukeCard>
            </div>

            {/* Right Side: Interactive Calendar Widget & Royal Blue Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Calendar Widget Card */}
              <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="font-serif text-base font-bold text-white">{calMonth}</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase">
                  <span>S</span>
                  <span>M</span>
                  <span>T</span>
                  <span>W</span>
                  <span>T</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {calendarDays.map((day) => {
                    const isSelected = day === selectedDay;
                    const isEventDay = [8, 9, 10, 15, 20].includes(day);

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`h-8 rounded-full flex flex-col items-center justify-center font-medium transition ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/50'
                            : isEventDay
                            ? 'bg-white/10 text-blue-300 font-bold hover:bg-white/20'
                            : 'hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <span>{day}</span>
                        {isEventDay && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-blue-400 -mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Agenda */}
                <div className="pt-3 border-t border-white/10 text-xs">
                  <div className="font-bold text-blue-400 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    Agenda for Nov {selectedDay}, 2026:
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-snug">
                    {selectedDay >= 8 && selectedDay <= 10
                      ? 'Smart India Hackathon Bangalore Grand Finale (OD Sanction Active)'
                      : selectedDay === 15
                      ? 'IEEE International Robotics Conference Papers Due'
                      : 'Regular Departmental Classes & Mentor Hours (2:00 PM - 4:00 PM)'}
                  </p>
                </div>
              </div>

              {/* Vivid Royal Blue Card (Reference Image: "JOIN NOW! | Welcoming new members") */}
              <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                  INFO | ACADEMIC YEAR 2025-2026
                </span>
                <h4 className="font-serif text-xl font-bold leading-tight">
                  JOIN NOW! | Welcoming Department Scholars
                </h4>
                <p className="text-xs text-blue-100 font-sans leading-relaxed">
                  Access live permission tracking, request submissions, and instant gate pass issuance.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-block bg-white text-blue-900 font-bold text-xs px-6 py-2.5 rounded-full shadow-md hover:bg-blue-50 transition active:scale-95"
                  >
                    REGISTRATION & LOGIN
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 6. DUKE MULTI-COLUMN FOOTER WITH RIBBON ACCENT                   */}
      {/* ---------------------------------------------------------------- */}
      <DukeFooter />
    </div>
  );
};

export default LandingPage;
