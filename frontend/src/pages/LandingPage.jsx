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
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Sparkles,
  FileText,
  MousePointer,
  Bell,
  Download,
  Zap,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const LandingPage = () => {
  // Calendar interactive state for Updates section
  const [selectedDay, setSelectedDay] = useState(8);
  const [calMonth, setCalMonth] = useState('November 2026');

  // Days for November 2026 (starts on Sunday)
  const calendarDays = [
    1, 2, 3, 4, 5, 6, 7,
    8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28,
    29, 30
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-royal-500 selection:text-white relative overflow-x-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* 1. HERO SECTION WITH VIGNAN AERIAL CAMPUS PHOTO                  */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative min-h-[95vh] lg:min-h-screen flex flex-col justify-between overflow-hidden">
        {/* Full-width Vignan University Aerial Campus Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none scale-100 transition-transform duration-1000"
          style={{ backgroundImage: "url('/vignan-hero.jpg')" }}
        />
        {/* Cinematic Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/55 to-black pointer-events-none" />

        {/* Iconic Royal Blue Hanging Ribbon (Duke Style) */}
        <div
          className="absolute top-0 right-8 sm:right-16 z-40 w-14 sm:w-20 h-40 sm:h-52 bg-royal-600 shadow-2xl flex flex-col justify-between items-center py-4 text-white"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 18px), 0 100%)'
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white/70 shadow-sm" />
          <div className="font-serif text-[11px] font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 text-white/90">
            VIGNAN 1977
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 mb-4" />
        </div>

        {/* Top Navbar */}
        <header className="relative z-30 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
          {/* Logo & University Crest */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-full border border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center p-2 group-hover:border-royal-400 transition shadow-lg">
              <Award className="w-6 h-6 text-royal-400 group-hover:text-white transition" />
            </div>
            <div>
              <span className="font-serif text-base sm:text-lg font-bold text-white tracking-wider block leading-tight">
                VIGNAN'S UNIVERSITY
              </span>
              <span className="text-[10px] text-slate-300 font-sans tracking-widest uppercase block">
                Deemed to be University • NAAC A+
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold tracking-wider uppercase text-slate-200">
            <a href="#about" className="hover:text-royal-400 transition">About Us</a>
            <a href="#features" className="hover:text-royal-400 transition">Department Features</a>
            <a href="#updates" className="hover:text-royal-400 transition">News & Calendar</a>
            <a href="#workflows" className="hover:text-royal-400 transition">Workflows</a>
          </nav>

          {/* Right Action & Social Dots */}
          <div className="flex items-center space-x-4 pr-16 sm:pr-24">
            <div className="hidden sm:flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((dot) => (
                <span key={dot} className="w-1.5 h-1.5 rounded-full bg-white/40 hover:bg-royal-400 transition cursor-pointer" />
              ))}
            </div>

            <Link
              to="/login"
              className="bg-royal-600 hover:bg-royal-500 text-white font-sans text-xs font-bold px-5 py-2.5 rounded-full shadow-lg shadow-royal-600/30 transition hover:scale-105"
            >
              Portal Login
            </Link>
          </div>
        </header>

        {/* Center Hero Crest & Headings */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-6 pt-10 sm:pt-14 pb-24">
          {/* Circular University Crest Icon */}
          <div className="inline-flex flex-col items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/30 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-2xl mb-3">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-royal-400" />
            </div>
            <div className="text-[11px] sm:text-xs font-cinzel font-semibold tracking-[0.25em] text-slate-300 uppercase">
              FOUNDATION FOR SCIENCE, TECHNOLOGY & RESEARCH
            </div>
          </div>

          {/* Grand Clean Serif Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none drop-shadow-2xl">
            Vignan's University
          </h1>

          {/* Tagline */}
          <p className="font-cinzel text-xs sm:text-sm font-semibold tracking-[0.3em] text-royal-400 uppercase drop-shadow-md">
            The Character of Success • Intelligent Department Automation
          </p>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-300 font-sans leading-relaxed drop-shadow-sm">
            Autonomous multi-tier digital permission platform. Automating On-Duty, Leave, and Event
            requests across students, mentors, coordinators, and HOD with real-time audit trails.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-royal-600 hover:bg-royal-500 text-white font-sans text-xs font-bold px-7 py-3 rounded-full shadow-xl shadow-royal-600/40 transition hover:scale-105"
            >
              Access Digital Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#about"
              className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-slate-200 border border-white/20 font-sans text-xs font-semibold px-6 py-3 rounded-full backdrop-blur-md transition"
            >
              Explore Campus
            </a>
          </div>

          {/* Mouse Scroll Indicator */}
          <div className="pt-4 flex justify-center text-slate-400">
            <div className="w-5 h-8 rounded-full border-2 border-slate-400/50 flex justify-center p-1 animate-bounce">
              <div className="w-1 h-2 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* 3 Overlapping Black Glass Feature Cards (At Bottom of Hero) */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 w-full -mb-16 sm:-mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <div className="bg-black/90 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/60 rounded-3xl p-6 shadow-2xl transition hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-royal-600 text-white flex items-center justify-center text-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-royal-400 transition">
                Scholarships & OD
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Streamlined sanctioning for hackathons, paper presentations, and merit scholarships with automated verification.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-black/90 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/60 rounded-3xl p-6 shadow-2xl transition hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-royal-600 text-white flex items-center justify-center text-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-royal-400 transition">
                Our Campus Gate Pass
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Official digital gate passes generated with cryptographic reference codes and HOD authorization signatures.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-black/90 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/60 rounded-3xl p-6 shadow-2xl transition hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                  <Presentation className="w-6 h-6" />
                </div>
                <Link
                  to="/login"
                  className="w-7 h-7 rounded-full bg-white/10 group-hover:bg-royal-600 text-white flex items-center justify-center text-xs transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <h3 className="font-serif text-lg font-bold text-white group-hover:text-royal-400 transition">
                Academic Programs
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed">
                Departmental hierarchy configuration across Computer Science, Electronics, Mechanical, and Bio-Tech engineering cohorts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. ABOUT / OVERVIEW SECTION (TEXT LEFT, GRADUATE PORTRAIT RIGHT)  */}
      {/* ---------------------------------------------------------------- */}
      <section id="about" className="pt-32 pb-24 bg-black relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-royal-400 text-xs font-cinzel font-bold tracking-[0.2em] uppercase">
              <span className="w-2 h-2 rounded-full bg-royal-500 animate-pulse" />
              Institutional Heritage & Innovation
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Vignan's University
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
              <p>
                Established with a vision to deliver world-class technical education, Vignan's Foundation
                for Science, Technology & Research represents a benchmark in academic discipline and
                student empowerment.
              </p>
              <p>
                To eliminate tedious paper slips and lost physical files, the <strong>Intelligent Department
                Workflow Automation Agent (IDWAA)</strong> orchestrates digital permissions seamlessly.
                Every request—whether for an international hackathon, sick leave, or college symposium—advances
                automatically from student to academic mentor, faculty coordinator, and head of department.
              </p>
              <p className="text-slate-400">
                Automated 24-hour reminder crons prevent delays, while verified students can download official
                digital gate passes instantly upon final sanction.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="bg-royal-600 hover:bg-royal-500 text-white font-sans text-xs font-bold px-6 py-3 rounded-full shadow-lg shadow-royal-600/30 transition"
              >
                Sign In to Department Desk
              </Link>
              <a
                href="#features"
                className="text-xs font-bold text-slate-300 hover:text-white underline underline-offset-4"
              >
                View Workflow Sequence →
              </a>
            </div>
          </div>

          {/* Right Portrait (Duke University Graduate Style) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-sm w-full">
              {/* Decorative background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-royal-600 to-sky-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-500" />

              <div className="relative rounded-3xl overflow-hidden border border-white/20 bg-zinc-900 shadow-2xl aspect-[3/4]">
                {/* Graduate Academic Portrait Illustration/Photo */}
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
                    <div className="w-10 h-10 rounded-full bg-royal-600/30 border border-royal-400 flex items-center justify-center text-royal-300">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-bold text-white">Excellence in Engineering</h4>
                      <p className="text-[11px] text-slate-300 font-sans">Empowering 12,000+ campus scholars</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. MAIN DASHBOARD FEATURES & WORKFLOW TOOLS                     */}
      {/* ---------------------------------------------------------------- */}
      <section id="features" className="py-24 bg-zinc-950 border-t border-zinc-900 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-royal-400 font-cinzel text-xs font-bold tracking-[0.25em] uppercase">
              Core Capabilities
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Intelligent Workflow Tools
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-sans leading-relaxed">
              Engineered with rule-based automation to replace friction with instant transparency.
            </p>
          </div>

          {/* Grid of Rounded Glass-Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                Multi-Level Workflow Engine
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Sequential progression from Student submission to Mentor verification, Faculty scrutiny,
                and final HOD sanction. Applications automatically move forward upon approval.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                4-Tier Sequential Hierarchy <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                Dynamic Urgency Assessment
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Intelligent rules evaluate departure dates. Requests with lead times &le; 48 hours are
                auto-flagged as High Priority to ensure rapid departmental attention.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                Auto-Urgency Detection <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                24-Hour Autonomous Reminders
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Background cron monitors stagnant requests. If an application remains pending for over 24
                hours, automated alerts ping the responsible authority.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                Hourly Background Worker <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                Digital PDF Gate Passes
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Generates official, downloadable PDF permission letters with unique reference numbers and
                digital timestamps immediately upon HOD sanction.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                Cryptographic Reference Code <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                Role-Based Security & RBAC
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Dedicated dashboards for Student, Mentor, Faculty Coordinator, HOD, and Admin. Protected
                JWT routes guarantee students only access their own requests.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                JWT & Bcrypt Authenticated <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 hover:border-royal-500/50 rounded-3xl p-7 space-y-4 shadow-xl transition hover:scale-[1.02] group">
              <div className="w-12 h-12 rounded-2xl bg-royal-600/20 text-royal-400 border border-royal-500/30 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white group-hover:text-royal-400 transition">
                Live Timeline Audit Trail
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Complete transparency. View exact stage progress, reviewer names, exact timestamps, and
                reviewer remarks quoted at every step.
              </p>
              <div className="pt-2 text-[11px] font-bold text-royal-400 flex items-center gap-1.5">
                Real-Time Visual Journey <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. UPDATES / NEWS SECTION (ON BLURRED BLUE-TINTED CAMPUS PHOTO)  */}
      {/* ---------------------------------------------------------------- */}
      <section id="updates" className="relative py-28 overflow-hidden">
        {/* Background Image 3 (Blue Overlay Campus Photo) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none filter blur-[1px] scale-105"
          style={{ backgroundImage: "url('/vignan-blue-tint.jpg')" }}
        />
        {/* Royal Blue & Black Ambient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-royal-950/70 to-black pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 space-y-12">
          {/* Section Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-royal-400 font-cinzel text-xs font-bold tracking-[0.2em] uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-royal-400" />
              Department News & Schedule
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
              Updates.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl leading-relaxed">
              Stay synchronized with institutional schedules, hackathon OD windows, and departmental announcements.
            </p>
          </div>

          {/* Cards & Calendar Grid (Matching Reference Duke Image Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 4 News Cards (2x2 Column) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* News Card 1 */}
              <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 space-y-4 hover:border-royal-400/60 transition group shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-royal-400 uppercase tracking-wider">
                  <span>HOT | TODAY</span>
                  <span className="text-slate-400">Nov 5, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white group-hover:text-royal-400 transition leading-snug">
                  Smart India Hackathon 2026: 3-Day OD Sanction Guidelines Released
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Finalist teams from CSE and ECE can submit On-Duty applications. Attendance credit auto-mapped upon HOD digital sign-off.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-royal-600 hover:bg-royal-500 px-4 py-2 rounded-full transition"
                >
                  Read News <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* News Card 2 */}
              <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 space-y-4 hover:border-royal-400/60 transition group shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-royal-400 uppercase tracking-wider">
                  <span>ACADEMIC</span>
                  <span className="text-slate-400">Nov 4, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white group-hover:text-royal-400 transition leading-snug">
                  Medical Leave Verification: Doctor Certificate Upload Mandatory
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Students requesting medical leave exceeding two days must attach physician prescriptions via the student portal.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-royal-600 hover:bg-royal-500 px-4 py-2 rounded-full transition"
                >
                  Read News <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* News Card 3 */}
              <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 space-y-4 hover:border-royal-400/60 transition group shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-royal-400 uppercase tracking-wider">
                  <span>EVENT</span>
                  <span className="text-slate-400">Nov 2, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white group-hover:text-royal-400 transition leading-snug">
                  Inter-Collegiate Robocon Challenge Registration Open
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Robotics Club members can now request lab access and workshop participation permission digitally.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-royal-600 hover:bg-royal-500 px-4 py-2 rounded-full transition"
                >
                  Read News <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* News Card 4 */}
              <div className="bg-black/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 space-y-4 hover:border-royal-400/60 transition group shadow-2xl">
                <div className="flex items-center justify-between text-[11px] font-bold text-royal-400 uppercase tracking-wider">
                  <span>CAMPUS GATE</span>
                  <span className="text-slate-400">Nov 1, 2026</span>
                </div>
                <h4 className="font-serif text-base font-bold text-white group-hover:text-royal-400 transition leading-snug">
                  Automated Gate Scanner Sync for Approved PDF Permission Letters
                </h4>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Campus security gates now verify digital passes directly by checking the unique alphanumeric reference code.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-royal-600 hover:bg-royal-500 px-4 py-2 rounded-full transition"
                >
                  Read News <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Side: Interactive Calendar Widget & Join Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Calendar Widget (Duke Style) */}
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
                            ? 'bg-royal-600 text-white font-bold shadow-lg shadow-royal-600/50'
                            : isEventDay
                            ? 'bg-white/10 text-royal-300 font-bold hover:bg-white/20'
                            : 'hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <span>{day}</span>
                        {isEventDay && !isSelected && (
                          <span className="w-1 h-1 rounded-full bg-royal-400 -mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Day Agenda */}
                <div className="pt-3 border-t border-white/10 text-xs">
                  <div className="font-bold text-royal-400 flex items-center gap-1.5">
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

              {/* Blue Join Banner (Duke Style) */}
              <div className="bg-royal-600 rounded-3xl p-6 text-white shadow-2xl space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-royal-200">
                  INFO | ACADEMIC YEAR 2025-2026
                </span>
                <h4 className="font-serif text-xl font-bold leading-tight">
                  JOIN NOW! | Welcoming Department Scholars
                </h4>
                <p className="text-xs text-royal-100 font-sans leading-relaxed">
                  Access live permission tracking, request submissions, and instant gate pass issuance.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-block bg-white text-royal-900 font-bold text-xs px-6 py-2.5 rounded-full shadow-md hover:bg-royal-50 transition"
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
      {/* 5. BLACK MULTI-COLUMN FOOTER WITH BLUE RIBBON ACCENT             */}
      {/* ---------------------------------------------------------------- */}
      <footer className="bg-black text-slate-400 pt-16 pb-12 border-t border-zinc-900 relative">
        {/* Bottom Right Royal Blue Ribbon Accent */}
        <div
          className="absolute bottom-0 right-12 sm:right-24 z-20 w-16 sm:w-20 h-36 bg-royal-600 shadow-2xl flex flex-col justify-end items-center pb-3 text-white pointer-events-none"
          style={{
            clipPath: 'polygon(0 0, 50% 18px, 100% 0, 100% 100%, 0 100%)'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-white/70" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-900">
          {/* Column 1: Seal & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full border border-white/20 bg-zinc-900 flex items-center justify-center p-2 shadow-lg">
                <Award className="w-7 h-7 text-royal-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wider leading-none">
                  Vignan's University
                </h3>
                <span className="text-[10px] text-slate-400 font-cinzel tracking-widest uppercase block mt-1">
                  ESTABLISHED 1977
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-sm">
              Intelligent Department Workflow Automation Agent. Designed and developed to streamline
              student permissions, audit logs, and institutional approvals digitally.
            </p>

            <div className="flex items-center space-x-2 pt-2">
              {[1, 2, 3, 4, 5].map((dot) => (
                <span key={dot} className="w-2 h-2 rounded-full bg-zinc-700 hover:bg-royal-400 transition cursor-pointer" />
              ))}
            </div>
          </div>

          {/* Column 2: Contact */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-white tracking-wider">Contact</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-royal-400 shrink-0 mt-0.5" />
                <span>Vadlamudi, Guntur District, Andhra Pradesh - 522213</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-royal-400 shrink-0" />
                <span>+91 863 2344700 / 701</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-royal-400 shrink-0" />
                <span>department.workflow@vignan.ac.in</span>
              </p>
            </div>
          </div>

          {/* Column 3: About Portal */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-white tracking-wider">About Portal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#about" className="hover:text-royal-400 transition">University Heritage</a></li>
              <li><a href="#features" className="hover:text-royal-400 transition">Multi-Level Workflow</a></li>
              <li><a href="#updates" className="hover:text-royal-400 transition">News & Announcements</a></li>
              <li><a href="#features" className="hover:text-royal-400 transition">PDF Gate Pass Verification</a></li>
            </ul>
          </div>

          {/* Column 4: Quick Portals */}
          <div className="space-y-3 text-xs">
            <h4 className="font-serif text-sm font-bold text-white tracking-wider">Join Us / Portals</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/login" className="hover:text-royal-400 transition">Student Application Desk</Link></li>
              <li><Link to="/login" className="hover:text-royal-400 transition">Academic Mentor Verification</Link></li>
              <li><Link to="/login" className="hover:text-royal-400 transition">Faculty Coordinator Sanction</Link></li>
              <li><Link to="/login" className="hover:text-royal-400 transition">Head of Dept (HOD) Portal</Link></li>
              <li><Link to="/login" className="hover:text-royal-400 transition">Administrator Hub</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Vignan's Foundation for Science, Technology & Research. All rights reserved.</p>
          <p className="font-cinzel tracking-wider text-slate-400">
            Intelligent Department Workflow Automation Agent (IDWAA)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
