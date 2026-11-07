import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  Lock,
  Mail,
  User,
  GraduationCap,
  Hash,
  Layers,
  Phone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  Image as ImageIcon
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    registrationNumber: '',
    department: '1',
    section: 'A',
    semester: '6',
    batchYear: '2022-2026',
    password: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Photograph state
  const [photoData, setPhotoData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [photoConsent, setPhotoConsent] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Ensure camera stream binds to video element after render
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive, photoMode]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access device camera. Please allow camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoData(dataUrl);
    setPhotoPreview(dataUrl);
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setError('Invalid photograph format. Please upload JPG, PNG, or WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photograph file size exceeds the 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const resetPhoto = () => {
    stopCamera();
    setPhotoData(null);
    setPhotoPreview(null);
    setCameraError('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!formData.registrationNumber.trim()) {
      setError('University Registration Number is required.');
      return;
    }

    if (!photoData) {
      setError('Student photograph is mandatory. Please capture or upload a clear, front-facing photograph.');
      return;
    }

    if (!photoConsent) {
      setError('Please check the verification declaration consent checkbox before submitting.');
      return;
    }

    try {
      setSubmitting(true);
      // Strictly submits role: 'STUDENT'
      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        departmentId: parseInt(formData.department),
        section: formData.section.trim().toUpperCase(),
        semester: parseInt(formData.semester),
        batchYear: formData.batchYear.trim(),
        photo: photoData,
        role: 'STUDENT' // Public registration strictly student
      };

      const res = await api.post('/auth/register', payload);

      if (res.data?.success) {
        setSuccessData(res.data.data);
        setSubmitted(true);
        // Automatically establish session if token returned
        if (res.data.data?.token && res.data.data?.user) {
          login(res.data.data.user, res.data.data.token);
        }
      } else {
        setError(res.data?.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      setError(
        err.response?.data?.message ||
        'Registration failed. Please verify that your email and registration number are not already registered.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans overflow-hidden">
      {/* 50% Intensity University Campus Main Building Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-100 pointer-events-none"
        style={{ backgroundImage: "url('/campus-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-slate-950/40 pointer-events-none" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-6 group">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-black shadow-lg border border-white/20 group-hover:bg-primary-600 transition">
            <Building2 className="w-6 h-6 text-sky-400 group-hover:text-white transition" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block drop-shadow-xs">IDWAA</span>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Student Registration Portal
            </span>
          </div>
        </Link>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-slate-950/20 backdrop-blur-xs py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-white/10 space-y-6 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Create Student Account</h2>
            <p className="text-xs text-slate-200 mt-1 drop-shadow-sm">
              Official student self-enrollment into university permission workflow network
            </p>
          </div>

          {/* Security Banner: Public registration rule notification */}
          <div className="p-3 bg-amber-500/10 border border-amber-400/20 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Notice:</strong> Only students may self-register. Faculty, Mentor, HOD, and University Office accounts are provisioned exclusively by administrators.
            </span>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {submitted ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-emerald-200">Account Registered Successfully!</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Welcome, <strong>{formData.firstName} {formData.lastName}</strong>! Your student account ({formData.registrationNumber}) has been provisioned and automatically mapped to your department and academic mentor in the database.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/student')}
                  className="inline-flex items-center gap-2 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition cursor-pointer"
                >
                  Proceed to Student Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="Anees"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Shaik"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Registration / Roll No *</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                    placeholder="241FA18363 / REG2024CSE001"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white font-mono placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Institutional Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="student@institution.edu"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="1">Computer Science (CSE)</option>
                    <option value="2">Electronics (ECE)</option>
                    <option value="3">Mechanical (MECH)</option>
                    <option value="4">Information Tech (IT)</option>
                    <option value="5">Civil Engineering (CIVIL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Section *</label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                    placeholder="A / B / C / D"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white font-mono placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Semester *</label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white focus:ring-2 focus:ring-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Batch Year</label>
                  <input
                    type="text"
                    name="batchYear"
                    value={formData.batchYear}
                    onChange={handleChange}
                    placeholder="2022-2026"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Mandatory Student Photograph Section */}
              <div className={`p-4 bg-slate-900/90 border rounded-2xl space-y-3.5 transition ${
                !photoData && error ? 'border-rose-500/60 shadow-xs shadow-rose-500/20' : 'border-slate-700/80'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#B95BD5]/20 border border-[#B95BD5]/40 flex items-center justify-center text-[#B95BD5] shadow-xs">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <label className="text-xs font-bold text-white">Student Photograph</label>
                        <span className="text-xs font-bold text-rose-400">*</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#B95BD5]/20 text-[#D884EE] border border-[#B95BD5]/30">
                          Mandatory
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Upload or capture a clear, recent, front-facing institutional photo
                      </p>
                    </div>
                  </div>

                  {photoPreview && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" /> Attached
                    </span>
                  )}
                </div>

                {/* If photo is already selected / captured */}
                {photoPreview ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-800/80 border border-slate-700 rounded-xl">
                    <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-[#B95BD5] shadow-md bg-black shrink-0 relative group">
                      <img src={photoPreview} alt="Student Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Photograph Attached Successfully
                      </div>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        This photograph will be printed on your digital permission passes so campus security staff can visually verify your identity without requiring physical ID cards.
                      </p>
                      <button
                        type="button"
                        onClick={resetPhoto}
                        className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-100 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded-lg border border-rose-500/30 transition cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Retake / Replace Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Option Selector: Upload Photo or Capture via Camera */
                  <div className="space-y-3">
                    <div className="flex gap-2 p-1 bg-slate-800/80 rounded-xl border border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          stopCamera();
                          setPhotoMode('upload');
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                          photoMode === 'upload'
                            ? 'bg-[#B95BD5] text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload Photo File
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoMode('camera');
                          startCamera();
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                          photoMode === 'camera'
                            ? 'bg-[#B95BD5] text-white shadow-sm'
                            : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Capture via Camera
                      </button>
                    </div>

                    {photoMode === 'upload' ? (
                      <div className="relative border-2 border-dashed border-slate-600 hover:border-[#B95BD5] rounded-xl p-5 text-center transition bg-slate-800/40 hover:bg-slate-800/70 group cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <div className="w-11 h-11 rounded-full bg-slate-700/80 group-hover:bg-[#B95BD5]/20 flex items-center justify-center text-slate-300 group-hover:text-[#B95BD5] transition">
                            <Upload className="w-5 h-5 text-[#B95BD5]" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white">Click to browse</span>
                            <span className="text-xs text-slate-300"> or drag and drop your photo</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Supported: JPG, JPEG, PNG, WEBP (Max 5MB)</p>
                        </div>
                      </div>
                    ) : (
                      /* Live Camera Capture Mode */
                      <div className="space-y-3">
                        {cameraError ? (
                          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p>{cameraError}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setPhotoMode('upload');
                                  stopCamera();
                                }}
                                className="mt-2 text-xs font-bold text-white underline hover:no-underline cursor-pointer"
                              >
                                Switch to Upload Photo instead
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="relative bg-black rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center p-3">
                            <div className="w-full max-w-[260px] aspect-square relative overflow-hidden rounded-xl border-2 border-[#B95BD5]/60 shadow-lg">
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                              />
                              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/50 rounded-xl m-3 flex items-center justify-center">
                                <span className="text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded-full font-mono backdrop-blur-xs">
                                  Position Face Inside Frame
                                </span>
                              </div>
                            </div>

                            <div className="w-full pt-3 flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="inline-flex items-center gap-2 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition cursor-pointer"
                              >
                                <Camera className="w-4 h-4" />
                                Snapshot & Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  stopCamera();
                                  setPhotoMode('upload');
                                }}
                                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-full transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Hidden canvas for snapshot rendering */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Verification Consent Checkbox */}
                <label className="flex items-start gap-2.5 pt-1 text-[11px] text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={photoConsent}
                    onChange={(e) => setPhotoConsent(e.target.checked)}
                    className="mt-0.5 rounded border-slate-600 text-[#B95BD5] focus:ring-[#B95BD5] cursor-pointer"
                  />
                  <span>
                    I certify that this photograph is my true, recent image for official university verification and consent to its inclusion on generated digital passes.
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-600 rounded-xl text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 bg-[#B95BD5] hover:bg-[#8E32A8] text-white font-bold rounded-full text-xs shadow-md transition flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Registering Account in Database...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2">
            Already enrolled?{' '}
            <Link to="/login" className="font-bold text-[#B95BD5] hover:underline">
              Log in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
