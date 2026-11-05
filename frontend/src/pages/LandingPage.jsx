import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  FileCheck2,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Zap,
  Download,
  AlertCircle
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black shadow-md">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight block leading-tight">
                IDWAA
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase block">
                Workflow Automation Agent
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-600">
            <a href="#problem-solution" className="hover:text-primary-600 transition">Overview</a>
            <a href="#workflows" className="hover:text-primary-600 transition">Workflows</a>
            <a href="#features" className="hover:text-primary-600 transition">Features</a>
            <a href="#roles" className="hover:text-primary-600 transition">Roles</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg shadow-sm transition"
            >
              Student Register
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-white to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 border border-sky-300 text-primary-800 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              Automated Institutional Permission Engine
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Eliminate paper slips with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-sky-500">
                Automated Multi-Level Approvals
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed">
              A unified digital approval portal for student On-Duty (OD), Leave, and Event
              Participation permissions. Featuring rule-based auto routing, 24-hour reminder crons,
              real-time timeline tracking, and verifiable PDF gate passes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-md transition"
              >
                Access Approval Portal
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm px-6 py-3.5 rounded-xl border border-slate-300 shadow-xs transition"
              >
                Create Student Account
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div>
                <div className="text-2xl font-black text-slate-900">100%</div>
                <div className="text-xs font-medium text-slate-500">Paperless Process</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">4-Tier</div>
                <div className="text-xs font-medium text-slate-500">Approval Hierarchy</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">&lt; 24 Hrs</div>
                <div className="text-xs font-medium text-slate-500">Auto Reminders</div>
              </div>
            </div>
          </div>

          {/* Hero Interactive Workflow Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Request Workflow
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-sky-100 text-primary-800 border border-sky-200">
                REQ-2026-CSE
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-emerald-900">1. Student Submission</div>
                    <div className="text-emerald-700 text-[11px]">OD Request for National Hackathon</div>
                  </div>
                </div>
                <span className="font-bold text-emerald-700">Completed</span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-emerald-900">2. Academic Mentor Verification</div>
                    <div className="text-emerald-700 text-[11px]">Prof. Suresh Reddy (Verified attendance)</div>
                  </div>
                </div>
                <span className="font-bold text-emerald-700">Completed</span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between ring-2 ring-amber-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                  <div>
                    <div className="font-bold text-amber-900">3. Faculty Sanction</div>
                    <div className="text-amber-700 text-[11px]">Prof. Anitha Sharma (Under Review)</div>
                  </div>
                </div>
                <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Active Step</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-slate-400" />
                  <div>
                    <div className="font-bold text-slate-600">4. HOD Final Sanction</div>
                    <div className="text-[11px]">Dr. Ramesh Kumar (Sanction & Gate Pass)</div>
                  </div>
                </div>
                <span className="font-semibold text-slate-400">Waiting</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600">
              <span className="font-bold text-slate-800">Automated Notification:</span> Alerts dispatched in real-time to student & faculty upon every stage advance.
            </div>
          </div>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section id="problem-solution" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Transforming Outdated Paper Slips
            </h2>
            <p className="text-slate-600 text-sm">
              Traditional permission workflows require students to physically chase faculty and HODs
              for signatures, causing delays, lost forms, and zero tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" /> Traditional Manual System
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Physical paperwork easily misplaced or delayed on desks.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Students waste valuable study hours searching for busy faculty.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> No transparent audit log or timestamped history of approvals.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span> Security gate passes can be forged or replicated on paper.
                </li>
              </ul>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-sm uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" /> IDWAA Automated Platform
              </div>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> One-click digital submission from any browser or mobile device.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Auto-routed to assigned mentor and faculty coordinator.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Real-time stage tracking with reviewer remarks and audit history.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span> Tamper-proof, cryptographically verifiable PDF passes with unique reference code.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligent Features Grid */}
      <section id="features" className="py-20 bg-slate-100 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Automation Features
            </h2>
            <p className="text-slate-600 text-sm">
              Engineered specifically for departmental workflows with enterprise-grade reliability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-primary-700 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Dynamic Priority Routing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatically detects events starting within 48 hours and flags applications as URGENT,
                ensuring high-priority processing by reviewers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">24-Hour Reminder Cron</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Background worker scans for stagnant requests every hour and sends automated reminders
                to responsible faculty and mentors.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Automated PDF Passes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly generates an official, downloadable permission letter with digital
                signatories upon final sanction by the HOD.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Cards */}
      <section id="roles" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Role-Based Portals
            </h2>
            <p className="text-slate-600 text-sm">
              Tailored interfaces designed for each stakeholder in the institutional hierarchy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-center flex flex-col justify-between">
              <div>
                <span className="inline-block p-3 rounded-full bg-emerald-100 text-emerald-700 font-bold mb-2">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">Student</h4>
                <p className="text-[11px] text-slate-500 mt-1">Submit OD/Leave, track live timeline, download pass.</p>
              </div>
              <Link to="/login" className="text-xs font-bold text-primary-600 hover:text-primary-800">
                Sign In →
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-center flex flex-col justify-between">
              <div>
                <span className="inline-block p-3 rounded-full bg-indigo-100 text-indigo-700 font-bold mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">Academic Mentor</h4>
                <p className="text-[11px] text-slate-500 mt-1">Verify assigned mentee requests and attendance.</p>
              </div>
              <Link to="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">
                Mentor Desk →
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-center flex flex-col justify-between">
              <div>
                <span className="inline-block p-3 rounded-full bg-blue-100 text-blue-700 font-bold mb-2">
                  <Building className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">Faculty Coordinator</h4>
                <p className="text-[11px] text-slate-500 mt-1">Review department policy, approve, and forward to HOD.</p>
              </div>
              <Link to="/login" className="text-xs font-bold text-blue-600 hover:text-blue-800">
                Review Desk →
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-center flex flex-col justify-between">
              <div>
                <span className="inline-block p-3 rounded-full bg-rose-100 text-rose-700 font-bold mb-2">
                  <Award className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">Head of Dept (HOD)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Provide final sanction and monitor department analytics.</p>
              </div>
              <Link to="/login" className="text-xs font-bold text-rose-600 hover:text-rose-800">
                HOD Portal →
              </Link>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-center flex flex-col justify-between">
              <div>
                <span className="inline-block p-3 rounded-full bg-purple-100 text-purple-700 font-bold mb-2">
                  <Users className="w-5 h-5" />
                </span>
                <h4 className="font-bold text-sm text-slate-900">Administrator</h4>
                <p className="text-[11px] text-slate-500 mt-1">Manage users, mentor allocations, and audit history.</p>
              </div>
              <Link to="/login" className="text-xs font-bold text-purple-600 hover:text-purple-800">
                Admin Hub →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
              ID
            </div>
            <div>
              <p className="text-sm font-bold text-white">Intelligent Department Workflow Automation Agent</p>
              <p className="text-[11px] text-slate-500">Autonomous Digital Permission & Approval Platform</p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} Institution Department Management System. All rights reserved.</p>
            <p className="mt-1">Powered by React.js & Express Automation Engine</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
