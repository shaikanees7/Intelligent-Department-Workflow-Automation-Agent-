import React, { useEffect, useRef } from 'react';
import {
  X,
  Printer,
  Download,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  User,
  Sparkles,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const DigitalPassModal = ({ isOpen, onClose, pass }) => {
  const printRef = useRef(null);

  // Close on Escape and lock body scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pass) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    // If the request has a generated PDF URL, download it directly, else trigger print dialog
    if (pass.pdf_letter_url && pass.pdf_letter_url !== '#') {
      const link = document.createElement('a');
      link.href = pass.pdf_letter_url;
      link.download = `Permission_Pass_${pass.pass_reference || pass.request_code}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.print();
    }
  };

  const isRevoked = pass.pass_status === 'REVOKED' || pass.status === 'REVOKED';
  const isExpired = pass.pass_status === 'EXPIRED' || pass.status === 'EXPIRED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#160E2E]/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-3xl border border-[#EAE0E8] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-[#F0E6EE] flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-[#4F4665] uppercase tracking-wider">
              Verified Institutional Pass
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FAF5F7] hover:bg-[#F3EAF1] text-[#261B50] border border-[#EAE0E8] flex items-center gap-1.5 transition-colors"
              title="Print Pass"
            >
              <Printer className="w-3.5 h-3.5 text-[#B95BD5]" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] text-white flex items-center gap-1.5 transition-colors shadow-xs"
              title="Download Pass"
            >
              <Download className="w-3.5 h-3.5 text-[#B95BD5]" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF5F7] hover:bg-[#F3EAF1] text-[#837B96] hover:text-[#261B50] flex items-center justify-center transition-colors border border-[#EAE0E8] ml-1"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Digital Pass Container */}
        <div ref={printRef} className="p-6 sm:p-8 space-y-6 bg-white text-[#261B50]">
          {/* Institutional Header with Branding */}
          <div className="text-center pb-5 border-b-2 border-[#261B50] relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5F7] border border-[#E8DDE6] text-[#261B50] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-[#B95BD5]" />
              IDWAA Institutional Authority
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-[#261B50] tracking-tight">
              INTELLIGENT WORKFLOW AUTOMATION AGENT
            </h1>
            <p className="text-xs font-semibold text-[#837B96] tracking-widest uppercase mt-0.5">
              Office of the Dean & Head of Department &bull; Digital Permissions Desk
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="px-4 py-1 rounded-full bg-[#261B50] text-white font-mono font-black text-xs sm:text-sm tracking-wider shadow-xs">
                {pass.pass_reference || 'PASS-DIGITAL'}
              </span>
              <StatusBadge status={pass.pass_status || pass.status || 'ACTIVE'} size="md" />
            </div>

            {isRevoked && (
              <div className="mt-3 p-3 rounded-2xl bg-[#FDE8EC] border border-[#F5B4C2] text-[#C92A4B] text-xs font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                REVOKED: {pass.revocation_reason || 'This pass has been officially revoked by university authorities.'}
              </div>
            )}
          </div>

          {/* Pass Grid: Left Student & Details, Right Scannable QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Left 2 Cols: Student & Permission Details */}
            <div className="md:col-span-2 space-y-4">
              {/* Student Details Card */}
              <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#EAE0E8] space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#837B96] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#B95BD5]" />
                    Student Identification & Verified Portrait
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ID Verified
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Student Portrait Box */}
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#EAE0E8] shadow-xs bg-white shrink-0 flex items-center justify-center relative">
                    {pass.photo_url || pass.student_photo_url ? (
                      <img
                        src={
                          (pass.photo_url || pass.student_photo_url).startsWith('http') || (pass.photo_url || pass.student_photo_url).startsWith('data:')
                            ? (pass.photo_url || pass.student_photo_url)
                            : `http://localhost:5000${pass.photo_url || pass.student_photo_url}`
                        }
                        alt={pass.student_name || 'Student Portrait'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/campus-bg.jpg';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#837B96] p-2 text-center">
                        <User className="w-8 h-8 text-[#837B96] mb-1" />
                        <span className="text-[9px] uppercase font-bold">Photo ID</span>
                      </div>
                    )}
                  </div>

                  {/* Student Info Details */}
                  <div className="flex-1 w-full grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#837B96] text-[10px] uppercase font-bold block">Full Name</span>
                      <span className="font-bold text-[#261B50] text-sm block">
                        {pass.student_name || (pass.first_name ? `${pass.first_name} ${pass.last_name || ''}` : 'Anees Shaik')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#837B96] text-[10px] uppercase font-bold block">Reg. Number</span>
                      <span className="font-bold font-mono text-[#261B50] text-sm block">
                        {pass.registration_number || 'REG2024CSE001'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#837B96] text-[10px] uppercase font-bold block">Department</span>
                      <span className="font-bold text-[#261B50] block">
                        {pass.department_name || pass.department_code || 'Computer Science & Engineering'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#837B96] text-[10px] uppercase font-bold block">Section & Batch</span>
                      <span className="font-bold text-[#261B50] block">
                        Section {pass.section || 'A'} &bull; {pass.batch_year || '2024-2028'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Permission Scope Card */}
              <div className="p-4 rounded-2xl bg-[#FAF5F7] border border-[#EAE0E8] space-y-2.5">
                <div className="text-[11px] font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#B95BD5]" />
                  Permission Sanction Scope
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#837B96] text-[10px] uppercase font-bold block">Category & Ref</span>
                    <span className="font-bold text-[#261B50] block">
                      {pass.request_type || 'OD'} ({pass.request_code || 'REQ-842104'})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#837B96] text-[10px] uppercase font-bold block">Valid Duration</span>
                    <span className="font-bold text-[#261B50] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B95BD5]" />
                      {new Date(pass.pass_valid_from || pass.valid_from || pass.start_date).toLocaleDateString()} to {new Date(pass.pass_valid_until || pass.valid_until || pass.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-[#837B96] text-[10px] uppercase font-bold block">Stated Reason</span>
                    <p className="font-medium text-[#261B50] leading-snug line-clamp-2">
                      {pass.reason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sanction Authority Note */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#E8F7F0] border border-[#B7E8D3] text-xs text-[#2F7355]">
                <ShieldCheck className="w-4 h-4 text-[#1E9A68] shrink-0" />
                <span>
                  <strong>Authorized by:</strong> Head of Department (HOD) & Institutional Faculty Coordinator.
                </span>
              </div>
            </div>

            {/* Right Col: Prominent QR Code Badge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FAF5F7] border border-[#E8DDE6] text-center">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-[#EAE0E8]">
                {pass.qr_code_data ? (
                  <img
                    src={pass.qr_code_data}
                    alt={`QR Pass ${pass.pass_reference}`}
                    className="w-48 h-48 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-48 h-48 flex flex-col items-center justify-center bg-[#F4EBF7] rounded-xl text-[#B95BD5] p-2">
                    <QrCode className="w-12 h-12" />
                    <span className="text-[11px] font-bold mt-2">Generating Secure QR...</span>
                  </div>
                )}
              </div>

              <div className="mt-3">
                <span className="font-mono text-xs font-bold text-[#261B50] block">
                  {pass.pass_reference}
                </span>
                <p className="text-[11px] font-medium text-[#837B96] mt-1 max-w-[200px] leading-tight">
                  Show this QR code to authorized campus security or faculty staff for verification.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Footer */}
          <div className="pt-4 border-t border-[#F0E6EE] text-center text-[10px] text-[#837B96] leading-relaxed">
            <p>
              &copy; {new Date().getFullYear()} Intelligent Department Workflow Automation System. Digitally generated permission pass.
            </p>
            <p className="mt-0.5">
              Verification is subject to the university's latest authorization records. Alteration or unauthorized duplication is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="p-4 sm:p-5 border-t border-[#F0E6EE] bg-[#FAF5F7] rounded-b-3xl flex flex-wrap items-center justify-between gap-3 print:hidden">
          <a
            href={`/verify-pass?ref=${pass.pass_reference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#B95BD5] hover:text-[#261B50] flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Test Live Verification View
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] text-white transition-all shadow-md shadow-[#261B50]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalPassModal;
