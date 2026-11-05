import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import api from '../../services/api';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Power,
  Users,
  MapPin,
  Mail,
  Phone,
  Shield,
  Layers,
  ArrowRight,
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'ACADEMIC',
  'ADMINISTRATIVE',
  'FINANCIAL',
  'STUDENT_AFFAIRS',
  'FACILITY',
  'HOSTEL',
  'SPORTS',
  'EXAMINATION',
  'LIBRARY',
  'TRANSPORTATION'
];

const UniversityOffices = () => {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State for Register / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'ACADEMIC',
    responsible_officer: '',
    contact_email: '',
    contact_phone: '',
    location: '',
    supported_permission_types: '',
    status: 'ACTIVE'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [feedbackToast, setFeedbackToast] = useState('');

  const fetchOffices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/offices');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setOffices(res.data.data);
      }
    } catch (err) {
      console.warn('[UniversityOffices] Failed to fetch offices:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const openRegisterModal = () => {
    setEditingOffice(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'ACADEMIC',
      responsible_officer: '',
      contact_email: '',
      contact_phone: '',
      location: '',
      supported_permission_types: 'EXAM_PERMISSION, HALL_TICKET, REVALUATION',
      status: 'ACTIVE'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (office) => {
    setEditingOffice(office);
    let permStr = '';
    if (Array.isArray(office.supported_permission_types)) {
      permStr = office.supported_permission_types.join(', ');
    } else if (typeof office.supported_permission_types === 'string') {
      try {
        const parsed = JSON.parse(office.supported_permission_types);
        permStr = Array.isArray(parsed) ? parsed.join(', ') : office.supported_permission_types;
      } catch {
        permStr = office.supported_permission_types;
      }
    }

    setFormData({
      name: office.name || '',
      code: office.code || '',
      description: office.description || '',
      category: office.category || 'ACADEMIC',
      responsible_officer: office.responsible_officer || '',
      contact_email: office.contact_email || '',
      contact_phone: office.contact_phone || '',
      location: office.location || '',
      supported_permission_types: permStr,
      status: office.status || 'ACTIVE'
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (office) => {
    const nextStatus = office.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await api.put(`/offices/${office.office_id}`, {
        status: nextStatus
      });
      if (res.data?.success) {
        showToast(`Office status updated to ${nextStatus}`);
        fetchOffices();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update office status.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const permsArray = formData.supported_permission_types
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        category: formData.category,
        responsible_officer: formData.responsible_officer.trim(),
        contact_email: formData.contact_email.trim(),
        contact_phone: formData.contact_phone.trim(),
        location: formData.location.trim(),
        supported_permission_types: permsArray,
        status: formData.status
      };

      if (editingOffice) {
        const res = await api.put(`/offices/${editingOffice.office_id}`, payload);
        if (res.data?.success) {
          showToast(`Office '${payload.name}' updated successfully.`);
          setIsModalOpen(false);
          fetchOffices();
        }
      } else {
        const res = await api.post('/offices', payload);
        if (res.data?.success) {
          showToast(`New office '${payload.name}' registered successfully.`);
          setIsModalOpen(false);
          fetchOffices();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save office details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3500);
  };

  // Metrics calculation
  const totalOffices = offices.length;
  const activeOffices = offices.filter((o) => o.status === 'ACTIVE').length;
  const inactiveOffices = totalOffices - activeOffices;
  const totalReceivedApplications = offices.reduce((sum, o) => sum + (parseInt(o.received_applications_count) || 0), 0);

  const filteredOffices = offices.filter((office) => {
    const matchesSearch =
      (office.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (office.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (office.responsible_officer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (office.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || office.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="ADMIN" />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Toast Notification */}
          {feedbackToast && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{feedbackToast}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-primary-100 text-primary-700 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    University Offices & AI Routing Center
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Register and manage university administrative offices, assign officers, and configure AI routing targets
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/office"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs transition"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                Open Office Desk View
              </Link>
              <button
                onClick={openRegisterModal}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Register New Office
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Offices</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{totalOffices}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Registered in institutional network</p>
              </div>
              <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Offices</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{activeOffices}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Eligible for AI routing</p>
              </div>
              <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive / Suspended</p>
                <h3 className="text-2xl font-extrabold text-slate-600 mt-1">{inactiveOffices}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Bypassed by AI routing engine</p>
              </div>
              <div className="w-11 h-11 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold">
                <Power className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Routed Applications</p>
                <h3 className="text-2xl font-extrabold text-sky-600 mt-1">{totalReceivedApplications}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Assigned across all desks</p>
              </div>
              <div className="w-11 h-11 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search offices, officer or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {CATEGORIES.slice(0, 6).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Offices List */}
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
              Loading registered university offices...
            </div>
          ) : filteredOffices.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No University Offices Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No university administrative offices match your search criteria. You can register a new office anytime.
              </p>
              <button
                onClick={openRegisterModal}
                className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                <Plus className="w-4 h-4" /> Register First Office
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffices.map((office) => {
                let parsedTypes = [];
                if (Array.isArray(office.supported_permission_types)) {
                  parsedTypes = office.supported_permission_types;
                } else if (typeof office.supported_permission_types === 'string') {
                  try {
                    parsedTypes = JSON.parse(office.supported_permission_types);
                  } catch {
                    parsedTypes = office.supported_permission_types.split(',').map((t) => t.trim());
                  }
                }

                const isActive = office.status === 'ACTIVE';

                return (
                  <div
                    key={office.office_id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                  >
                    {/* Top Office Card Header */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                            {office.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base leading-tight mt-1">
                            {office.name}
                          </h3>
                          <span className="text-xs font-mono font-semibold text-primary-600 block">
                            [{office.code}]
                          </span>
                        </div>

                        {/* Status Toggle Badge */}
                        <button
                          onClick={() => handleToggleStatus(office)}
                          title={`Click to ${isActive ? 'deactivate' : 'activate'}`}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {office.status}
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {office.description || 'No description configured.'}
                      </p>

                      {/* Responsible Officer & Contact Meta */}
                      <div className="bg-slate-50 rounded-xl p-3 space-y-2 text-xs border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold">{office.responsible_officer || 'Officer Unassigned'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{office.contact_email || 'No email configured'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{office.location || 'Location not specified'}</span>
                        </div>
                      </div>

                      {/* Supported Permission Types */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Supported Permission Types:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {parsedTypes.slice(0, 4).map((type, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-sky-50 text-primary-700 border border-sky-100 rounded-md text-[10px] font-semibold"
                            >
                              {type}
                            </span>
                          ))}
                          {parsedTypes.length > 4 && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                              +{parsedTypes.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span className="font-bold text-slate-800">{office.received_applications_count || 0}</span>
                        <span>routed applications</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(office)}
                          className="p-1.5 text-slate-500 hover:text-primary-700 hover:bg-slate-200 rounded-lg transition"
                          title="Edit Office Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/office?office_id=${office.office_id}`}
                          className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-800"
                        >
                          View Desk <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Registration / Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary-600" />
                    <h3 className="font-bold text-slate-900 text-base">
                      {editingOffice ? `Edit Office: ${editingOffice.name}` : 'Register New University Office'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
                  {formError && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Office Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Examination Cell"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Office Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EXAM_CELL"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      >
                        {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Responsible Officer <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Controller of Examinations"
                        value={formData.responsible_officer}
                        onChange={(e) => setFormData({ ...formData, responsible_officer: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office Description</label>
                    <textarea
                      rows="3"
                      placeholder="Detailed responsibilities, scope, and services handled by this office..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Contact Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. examcell@institution.edu"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 863 2344 700"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Campus Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Administrative Block, 2nd Floor, Room 204"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Supported Permission Types (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EXAM_PERMISSION, HALL_TICKET, REVALUATION, PRACTICAL_EXAM"
                      value={formData.supported_permission_types}
                      onChange={(e) => setFormData({ ...formData, supported_permission_types: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      The AI agent uses these permission types along with the office description to match incoming student requests.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office Status</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="ACTIVE"
                          checked={formData.status === 'ACTIVE'}
                          onChange={() => setFormData({ ...formData, status: 'ACTIVE' })}
                        />
                        <span className="font-semibold text-emerald-700">Active (Receive Routed Requests)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="INACTIVE"
                          checked={formData.status === 'INACTIVE'}
                          onChange={() => setFormData({ ...formData, status: 'INACTIVE' })}
                        />
                        <span className="font-semibold text-slate-600">Inactive / Suspended</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2"
                    >
                      {formSubmitting ? 'Saving...' : editingOffice ? 'Save Changes' : 'Register Office'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UniversityOffices;

