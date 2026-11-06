import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import BlueprintWatermark from '../../components/common/BlueprintWatermark';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Building,
  Calendar,
  FileText,
  Search,
  RefreshCw,
  StopCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const VerifyPass = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Scanning mode: 'camera' | 'upload' | 'manual'
  const [scanMode, setScanMode] = useState('camera');
  const [manualRef, setManualRef] = useState('');
  const [manualToken, setManualToken] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const qrReaderRef = useRef(null);
  const html5QrCodeScannerRef = useRef(null);

  // Parse URL query parameters if opened from a QR code click: ?ref=...&token=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    const token = params.get('token');

    if (ref) {
      setManualRef(ref);
      if (token) setManualToken(token);
      verifyPayload({ pass_reference: ref, token: token || undefined });
    }
  }, [location.search]);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    setCameraError('');
    setVerificationResult(null);

    try {
      if (!html5QrCodeScannerRef.current) {
        html5QrCodeScannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      setIsScanning(true);

      const qrCodeSuccessCallback = (decodedText) => {
        handleDecodedText(decodedText);
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeScannerRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // Ignore individual frame errors
        }
      );
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError(
        'Unable to access camera. Please ensure camera permissions are granted or use the file upload / manual entry option.'
      );
      setIsScanning(false);
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrCodeScannerRef.current && html5QrCodeScannerRef.current.isScanning) {
      try {
        await html5QrCodeScannerRef.current.stop();
        html5QrCodeScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  // Process decoded QR text: URL or JSON or plain reference
  const handleDecodedText = async (decodedText) => {
    stopCameraScanner();

    let ref = null;
    let token = null;

    try {
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        const url = new URL(decodedText);
        ref = url.searchParams.get('ref');
        token = url.searchParams.get('token');
      } else if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        const parsed = JSON.parse(decodedText);
        ref = parsed.pass_reference || parsed.ref;
        token = parsed.token;
      } else {
        ref = decodedText.trim();
      }
    } catch (e) {
      ref = decodedText.trim();
    }

    if (ref) {
      setManualRef(ref);
      if (token) setManualToken(token);
      await verifyPayload({ pass_reference: ref, token });
    } else {
      setVerificationResult({
        status: 'INVALID QR',
        message: 'Decoded QR code does not contain a valid permission pass reference.'
      });
    }
  };

  // Image file upload scanner
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setCameraError('');
    setVerificationResult(null);

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-container');
      const result = await html5QrCode.scanFile(file, true);
      handleDecodedText(result);
    } catch (err) {
      console.error('File scan error:', err);
      setVerificationResult({
        status: 'INVALID QR',
        message: 'Could not detect a clear QR code in the uploaded image. Please try a clearer picture or enter the pass reference manually.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Manual verify submit
  const handleManualVerify = (e) => {
    e.preventDefault();
    if (!manualRef.trim()) return;
    verifyPayload({
      pass_reference: manualRef.trim(),
      token: manualToken.trim() || undefined
    });
  };

  // Backend verification call
  const verifyPayload = async (payload) => {
    setLoading(true);
    setCameraError('');

    try {
      const res = await api.post('/permission-passes/verify', payload);
      if (res.data?.success && res.data?.data) {
        setVerificationResult(res.data.data);
      } else {
        setVerificationResult({
          status: 'INVALID QR',
          message: res.data?.message || 'Verification could not be completed.'
        });
      }
    } catch (err) {
      console.error('Verification API error:', err);
      setVerificationResult({
        status: 'INVALID QR',
        message: err.response?.data?.message || 'Verification service temporarily unavailable. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setManualRef('');
    setManualToken('');
    setCameraError('');
  };

  return (
    <div className="min-h-screen bg-[#FAF5F7] text-[#261B50] flex flex-col font-sans relative antialiased selection:bg-[#B95BD5] selection:text-white">
      <BlueprintWatermark />
      <Navbar />

      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6 sm:gap-8 items-start relative z-10">
        {user ? <Sidebar role={user.role} /> : null}

        <main className={`flex-1 space-y-6 sm:space-y-8 min-w-0 w-full overflow-hidden ${!user ? 'max-w-4xl mx-auto' : ''}`}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-white border border-[#EAE0E8] text-[#B95BD5] shadow-xs">
                  <QrCode className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#261B50] tracking-tight">
                  Verify Permission Pass
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#837B96] mt-1 pl-1">
                Scan QR codes via camera, upload an image pass, or verify by pass reference number in real-time.
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EAE0E8] text-xs font-bold text-[#261B50] shadow-xs self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-[#1E9A68]" />
                <span>Authorized Staff: <strong>{user.role}</strong></span>
              </div>
            )}
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white/80 rounded-full border border-[#EAE0E8] w-fit shadow-xs">
            <button
              onClick={() => {
                setScanMode('camera');
                resetVerification();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'camera'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'text-[#4F4665] hover:text-[#261B50]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Camera Scanner
            </button>
            <button
              onClick={() => {
                stopCameraScanner();
                setScanMode('upload');
                resetVerification();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'upload'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'text-[#4F4665] hover:text-[#261B50]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload QR Image
            </button>
            <button
              onClick={() => {
                stopCameraScanner();
                setScanMode('manual');
                resetVerification();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                scanMode === 'manual'
                  ? 'bg-[#261B50] text-white shadow-xs'
                  : 'text-[#4F4665] hover:text-[#261B50]'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Manual Lookup
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Scanner / Input Panel */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#EAE0E8] shadow-xs space-y-6">
              {scanMode === 'camera' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#B95BD5]" />
                      Real-Time Camera Scan
                    </span>
                    {isScanning && (
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Scanning Live
                      </span>
                    )}
                  </div>

                  {/* HTML5 QR Container */}
                  <div className="relative overflow-hidden rounded-2xl bg-[#1E163B] border-2 border-dashed border-[#B95BD5]/40 min-h-[280px] flex items-center justify-center text-white">
                    <div id="qr-reader-container" className="w-full max-w-[320px] mx-auto overflow-hidden rounded-xl" />

                    {!isScanning && !loading && (
                      <div className="text-center p-6 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-[#B95BD5]">
                          <Camera className="w-6 h-6" />
                        </div>
                        <p className="text-xs text-[#D8B8E8]">
                          Point your laptop or mobile camera at the student's digital permission QR code.
                        </p>
                        <button
                          type="button"
                          onClick={startCameraScanner}
                          className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#B95BD5] hover:bg-[#a64fc0] text-white transition-all shadow-md"
                        >
                          Start Camera
                        </button>
                      </div>
                    )}

                    {isScanning && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                        <button
                          type="button"
                          onClick={stopCameraScanner}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-md"
                        >
                          <StopCircle className="w-3.5 h-3.5" />
                          Stop Scanning
                        </button>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="p-3.5 rounded-2xl bg-[#FDE8EC] border border-[#F5B4C2] text-[#C92A4B] text-xs font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-[#837B96] leading-relaxed">
                    Tips: Ensure adequate lighting and hold the QR code approximately 6-10 inches from the camera.
                  </p>
                </div>
              )}

              {scanMode === 'upload' && (
                <div className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#B95BD5]" />
                    Upload QR Pass Image
                  </div>

                  <div className="border-2 border-dashed border-[#D8B8E8] rounded-2xl p-8 text-center space-y-3 bg-[#FAF5F7] hover:bg-[#F5EDF8] transition-colors relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white border border-[#EAE0E8] flex items-center justify-center mx-auto text-[#B95BD5]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#261B50]">
                        Click or drag to upload QR pass screenshot / photo
                      </p>
                      <p className="text-[11px] text-[#837B96] mt-0.5">
                        Supports PNG, JPG, JPEG, WebP
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {scanMode === 'manual' && (
                <form onSubmit={handleManualVerify} className="space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#B95BD5]" />
                    Manual Pass Reference Lookup
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#4F4665] block uppercase tracking-wider">
                      Pass Reference Number *
                    </label>
                    <input
                      type="text"
                      value={manualRef}
                      onChange={(e) => setManualRef(e.target.value)}
                      placeholder="e.g. PASS-2026-308620"
                      className="w-full mt-1.5 px-4 py-2.5 rounded-2xl bg-[#FAF5F7] border border-[#EAE0E8] font-mono font-bold text-[#261B50] focus:border-[#B95BD5] focus:outline-none text-sm placeholder-[#837B96]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !manualRef.trim()}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] disabled:opacity-50 text-white transition-all shadow-md shadow-[#261B50]/20 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4 text-[#B95BD5]" />
                    {loading ? 'Verifying with Institutional Records...' : 'Verify Pass Directly'}
                  </button>
                </form>
              )}

              {/* Reset button if something is selected */}
              {(verificationResult || manualRef) && (
                <button
                  type="button"
                  onClick={resetVerification}
                  className="w-full py-2 rounded-full text-xs font-bold text-[#4F4665] hover:text-[#261B50] bg-[#FAF5F7] hover:bg-[#F3EAF1] border border-[#EAE0E8] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#837B96]" />
                  Scan Another Pass
                </button>
              )}
            </div>

            {/* Right Column: Live Verification Results Card */}
            <div className="lg:col-span-6 space-y-4">
              {loading ? (
                <div className="bg-white p-12 rounded-3xl border border-[#EAE0E8] text-center shadow-xs space-y-3">
                  <div className="inline-block w-8 h-8 border-3 border-[#B95BD5] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[#261B50]">
                    Authenticating digital token against MySQL database...
                  </p>
                  <p className="text-[11px] text-[#837B96]">
                    Checking institutional validity, department sanctions, and revocation logs.
                  </p>
                </div>
              ) : verificationResult ? (
                /* Dynamic Verification Result Card */
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EAE0E8] shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-2xl flex items-center gap-3.5 ${
                    verificationResult.status === 'APPROVED AND VALID'
                      ? 'bg-[#E8F7F0] border border-[#B7E8D3] text-[#1E9A68]'
                      : verificationResult.status === 'REVOKED'
                      ? 'bg-[#FDE8EC] border border-[#F5B4C2] text-[#C92A4B]'
                      : verificationResult.status === 'EXPIRED'
                      ? 'bg-[#F4F1F6] border border-[#DDD5E5] text-[#7E7492]'
                      : verificationResult.status === 'PENDING'
                      ? 'bg-[#FEF6EB] border border-[#FCE1C2] text-[#E58B24]'
                      : 'bg-[#FDEEF1] border border-[#F9CAD3] text-[#E04F69]'
                  }`}>
                    {verificationResult.status === 'APPROVED AND VALID' && (
                      <CheckCircle2 className="w-7 h-7 shrink-0 text-[#1E9A68]" />
                    )}
                    {verificationResult.status === 'REVOKED' && (
                      <XCircle className="w-7 h-7 shrink-0 text-[#C92A4B]" />
                    )}
                    {verificationResult.status === 'EXPIRED' && (
                      <Clock className="w-7 h-7 shrink-0 text-[#7E7492]" />
                    )}
                    {verificationResult.status === 'PENDING' && (
                      <Clock className="w-7 h-7 shrink-0 text-[#E58B24]" />
                    )}
                    {(verificationResult.status === 'REJECTED' || verificationResult.status === 'INVALID QR') && (
                      <AlertTriangle className="w-7 h-7 shrink-0 text-[#E04F69]" />
                    )}

                    <div>
                      <div className="text-base sm:text-lg font-black tracking-tight">
                        {verificationResult.status}
                      </div>
                      <p className="text-xs font-medium leading-relaxed opacity-90 mt-0.5">
                        {verificationResult.message}
                      </p>
                    </div>
                  </div>

                  {/* Pass References */}
                  {verificationResult.pass_reference && (
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB] text-xs">
                      <div>
                        <span className="text-[#837B96] text-[10px] uppercase font-bold block">Pass Reference</span>
                        <span className="font-mono font-bold text-[#261B50] text-sm block">
                          {verificationResult.pass_reference}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#837B96] text-[10px] uppercase font-bold block">Application ID</span>
                        <span className="font-mono font-bold text-[#261B50] text-sm block">
                          {verificationResult.application_reference || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Authenticated Staff View: Detailed Student & Sanction Records */}
                  {!verificationResult.requires_login_for_details && verificationResult.student_name ? (
                    <div className="space-y-4">
                      {/* Student Identity */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE0E8] space-y-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#B95BD5]" />
                          Verified Student Credentials
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Student Name</span>
                            <span className="font-bold text-[#261B50] text-sm block">
                              {verificationResult.student_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Registration No</span>
                            <span className="font-mono font-bold text-[#261B50] text-sm block">
                              {verificationResult.registration_number}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Department</span>
                            <span className="font-bold text-[#261B50] block">
                              {verificationResult.department}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Section</span>
                            <span className="font-bold text-[#261B50] block">
                              Sec {verificationResult.section || 'A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Sanction Details */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE0E8] space-y-2.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-[#837B96] flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#B95BD5]" />
                          Sanctioned Activity & Validity
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Category</span>
                            <span className="font-bold text-[#261B50] block">
                              {verificationResult.permission_type}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Validity Window</span>
                            <span className="font-bold text-[#261B50] block">
                              {verificationResult.validity_period}
                            </span>
                          </div>
                          <div className="col-span-2 pt-1">
                            <span className="text-[#837B96] text-[10px] uppercase font-bold block">Purpose</span>
                            <p className="font-medium text-[#261B50] leading-snug">
                              {verificationResult.purpose}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#837B96] flex items-center justify-between pt-1">
                        <span>Verified by: <strong>{verificationResult.verified_by_role}</strong></span>
                        <span>Logged at: {new Date(verificationResult.scanned_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : verificationResult.requires_login_for_details ? (
                    /* Minimal Public View */
                    <div className="p-5 rounded-2xl bg-[#FAF5F7] border border-[#EDE2EB] space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#4F4665]">
                        <Lock className="w-4 h-4 text-[#B95BD5]" />
                        <span>Public Camera Scan Mode</span>
                      </div>
                      <p className="text-xs text-[#837B96] leading-relaxed">
                        {verificationResult.note}
                      </p>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#261B50] hover:bg-[#34265F] text-white shadow-xs transition-colors"
                      >
                        Sign in as University Staff
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* Initial Standby Prompt */
                <div className="p-10 rounded-3xl bg-white border border-[#EAE0E8] text-center space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF5F7] border border-[#EAE0E8] flex items-center justify-center mx-auto text-[#B95BD5]">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#261B50]">
                      Ready for Verification
                    </h3>
                    <p className="text-xs text-[#837B96] max-w-sm mx-auto mt-1 leading-relaxed">
                      Scan a student's digital pass or enter their pass reference code to authenticate approval records in real time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerifyPass;
