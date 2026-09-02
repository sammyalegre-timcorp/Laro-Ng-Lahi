import React, { useState, useMemo } from 'react';
import {
  Users,
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Shuffle,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Printer,
  BookOpen,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  HeartPulse,
  CheckSquare,
  Square
} from 'lucide-react';
import { Registration, DEFAULT_TEAMS } from '../types';
import { exportToExcel, exportToCSV, getAgeBracket } from '../utils/exportData';
import { AttendeeDetailsModal } from './AttendeeDetailsModal';
import { TeamBalancerModal } from './TeamBalancerModal';
import { PrintableRosterModal } from './PrintableRosterModal';
import { GameRulesGuide } from './GameRulesGuide';
import { updateRegistration, deleteRegistration, batchDeleteRegistrations } from '../firebase/registrations';

interface AdminPortalProps {
  registrations: Registration[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  registrations,
  loading,
  error
}) => {
  // Navigation & Modal States
  const [activeTab, setActiveTab] = useState<'directory' | 'rules'>('directory');
  const [selectedAttendee, setSelectedAttendee] = useState<Registration | null>(null);
  const [isBalancerOpen, setIsBalancerOpen] = useState(false);
  const [isPrintableRosterOpen, setIsPrintableRosterOpen] = useState(false);

  // Deletion States
  const [attendeeToDelete, setAttendeeToDelete] = useState<Registration | null>(null);
  const [isDeletingSingle, setIsDeletingSingle] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedAgeBracket, setSelectedAgeBracket] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name' | 'age-asc' | 'age-desc' | 'dept'>('date-desc');

  // Dynamic unique list of departments from registrations
  const availableDepartments = useMemo(() => {
    const depts = new Set<string>();
    registrations.forEach(r => {
      if (r.department && r.department.trim()) {
        depts.add(r.department.trim());
      }
    });
    return Array.from(depts).sort();
  }, [registrations]);

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = registrations.length;
    if (total === 0) {
      return {
        total: 0,
        avgAge: 0,
        maleCount: 0,
        femaleCount: 0,
        otherCount: 0,
        ageGroups: { under25: 0, b25_34: 0, b35_44: 0, b45_54: 0, b55plus: 0 },
        assignedCount: 0,
        withMedicalNotes: 0
      };
    }

    const totalAge = registrations.reduce((sum, r) => sum + r.age, 0);
    const avgAge = Math.round((totalAge / total) * 10) / 10;
    const maleCount = registrations.filter(r => r.gender === 'Male').length;
    const femaleCount = registrations.filter(r => r.gender === 'Female').length;
    const otherCount = total - maleCount - femaleCount;
    const assignedCount = registrations.filter(r => Boolean(r.assignedTeam)).length;
    const withMedicalNotes = registrations.filter(r => Boolean(r.medicalNotes && r.medicalNotes.trim())).length;

    const ageGroups = {
      under25: registrations.filter(r => r.age < 25).length,
      b25_34: registrations.filter(r => r.age >= 25 && r.age <= 34).length,
      b35_44: registrations.filter(r => r.age >= 35 && r.age <= 44).length,
      b45_54: registrations.filter(r => r.age >= 45 && r.age <= 54).length,
      b55plus: registrations.filter(r => r.age >= 55).length
    };

    return {
      total,
      avgAge,
      maleCount,
      femaleCount,
      otherCount,
      ageGroups,
      assignedCount,
      withMedicalNotes
    };
  }, [registrations]);

  // Filtered & Sorted Attendees
  const filteredAttendees = useMemo(() => {
    return registrations.filter(r => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = !search ||
        r.fullName.toLowerCase().includes(search) ||
        (r.nickname && r.nickname.toLowerCase().includes(search)) ||
        (r.department && r.department.toLowerCase().includes(search)) ||
        (r.medicalNotes && r.medicalNotes.toLowerCase().includes(search)) ||
        (r.assignedTeam && r.assignedTeam.toLowerCase().includes(search));

      // Department Filter
      const matchesDept = selectedDepartment === 'all' || r.department?.toLowerCase() === selectedDepartment.toLowerCase();

      // Age Bracket Filter
      const matchesAge = selectedAgeBracket === 'all' || getAgeBracket(r.age) === selectedAgeBracket;

      // Gender Filter
      const matchesGender = selectedGender === 'all' || r.gender === selectedGender;

      // Team Filter
      const matchesTeam = selectedTeam === 'all' ||
        (selectedTeam === 'unassigned' ? !r.assignedTeam : r.assignedTeam === selectedTeam);

      return matchesSearch && matchesDept && matchesAge && matchesGender && matchesTeam;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'age-asc') return a.age - b.age;
      if (sortBy === 'age-desc') return b.age - a.age;
      if (sortBy === 'dept') return (a.department || '').localeCompare(b.department || '');
      if (sortBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // date-desc
    });
  }, [
    registrations,
    searchTerm,
    selectedDepartment,
    selectedAgeBracket,
    selectedGender,
    selectedTeam,
    sortBy
  ]);

  const handleQuickTeamAssign = async (id: string, teamName: string) => {
    try {
      await updateRegistration(id, { assignedTeam: teamName || null });
    } catch (err) {
      console.error('Failed to quick assign team:', err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleConfirmSingleDelete = async () => {
    if (!attendeeToDelete?.id) return;
    try {
      setIsDeletingSingle(true);
      const name = attendeeToDelete.fullName;
      await deleteRegistration(attendeeToDelete.id);
      setSelectedIds(prev => prev.filter(id => id !== attendeeToDelete.id));
      setAttendeeToDelete(null);
      showToast(`Matagumpay na na-delete si ${name} sa database.`);
    } catch (err: any) {
      console.error('Failed to delete participant:', err);
      alert('Hindi na-delete ang kalahok. Pakisubukang muli.');
    } finally {
      setIsDeletingSingle(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const currentFilteredIds = filteredAttendees.map(a => a.id).filter(Boolean) as string[];
    const allSelected = currentFilteredIds.length > 0 && currentFilteredIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDeletingBatch(true);
      const count = selectedIds.length;
      await batchDeleteRegistrations(selectedIds);
      setSelectedIds([]);
      setShowBatchDeleteModal(false);
      showToast(`Matagumpay na na-delete ang ${count} na kalahok.`);
    } catch (err: any) {
      console.error('Failed to batch delete participants:', err);
      alert('Nagkaroon ng error sa pag-delete ng mga kalahok.');
    } finally {
      setIsDeletingBatch(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl p-1 shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
            <img
              src="https://marketing.timcorp.net.ph/hubfs/Employee%20Appreciation%202026/laro%20ng%20lahi%20logo.png"
              alt="Laro ng Lahi Official Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#0038A8]/10 text-[#0038A8] text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Event Operations & Admin Portal
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse" />
                <span>Live Firestore Sync</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0038A8] tracking-tight">
              Palarong Pinoy <span className="text-[#CE1126]">Admin Hub</span>
            </h1>
            <div className="h-1 w-24 bg-[#FFCD00] rounded-full my-2"></div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Real-time attendee directory, smart team balancer, at offline Excel/CSV data exports.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Excel Export */}
          <button
            onClick={() => exportToExcel(registrations)}
            disabled={registrations.length === 0}
            className="px-4 py-3 rounded-xl bg-[#00A86B] hover:bg-[#008f5b] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="I-export sa Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel Export (.xlsx)</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={() => exportToCSV(registrations)}
            disabled={registrations.length === 0}
            className="px-4 py-3 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="I-download bilang CSV file"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Team Balancer Modal Launch */}
          <button
            onClick={() => setIsBalancerOpen(true)}
            disabled={registrations.length === 0}
            className="px-4 py-3 rounded-xl bg-[#FFCD00] hover:bg-[#e6b800] text-[#0038A8] text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            <span>Smart Team Balancer</span>
          </button>

          {/* Printable Roster Launch */}
          <button
            onClick={() => setIsPrintableRosterOpen(true)}
            disabled={registrations.length === 0}
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Print Rosters</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Registered</span>
            <div className="w-8 h-8 rounded-xl bg-[#0038A8]/10 text-[#0038A8] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#0038A8]">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase">kalahok</span>
          </div>
          <p className="text-[11px] text-[#00A86B] font-bold mt-1">
            {stats.assignedCount} / {stats.total} naka-assign sa koponan
          </p>
        </div>

        {/* Average Age */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Average Age</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFCD00]/20 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {stats.avgAge || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold uppercase">taong gulang</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Para sa patas na team distribution
          </p>
        </div>

        {/* Gender Demographics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Gender Ratio</span>
            <div className="w-8 h-8 rounded-xl bg-[#CE1126]/10 text-[#CE1126] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold">
            <span className="text-[#0038A8]">👦 {stats.maleCount} Male</span>
            <span className="text-[#CE1126]">👩 {stats.femaleCount} Female</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2.5 overflow-hidden flex">
            <div
              className="bg-[#0038A8] h-full"
              style={{ width: `${stats.total ? (stats.maleCount / stats.total) * 100 : 50}%` }}
            />
            <div
              className="bg-[#CE1126] h-full"
              style={{ width: `${stats.total ? (stats.femaleCount / stats.total) * 100 : 50}%` }}
            />
          </div>
        </div>

        {/* Age Demographics Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Age Distribution</span>
            <div className="w-8 h-8 rounded-xl bg-[#00A86B]/10 text-[#00A86B] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-600 grid grid-cols-2 gap-1">
            <span>&lt;25y: <strong>{stats.ageGroups.under25}</strong></span>
            <span>25-34y: <strong>{stats.ageGroups.b25_34}</strong></span>
            <span>35-44y: <strong>{stats.ageGroups.b35_44}</strong></span>
            <span>45y+: <strong>{stats.ageGroups.b45_54 + stats.ageGroups.b55plus}</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-[#0038A8] text-white shadow-lg shadow-blue-900/20'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Real-Time Attendee Directory ({filteredAttendees.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-[#0038A8] text-white shadow-lg shadow-blue-900/20'
              : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Games & Game Masters</span>
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] p-6 sm:p-8 space-y-6">
          {/* Search and Filters Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Maghanap (pangalan, dept, team...)"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none text-xs sm:text-sm font-medium transition-colors"
                />
              </div>

              {/* Sorting and Summary */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#0038A8]" />
                  <span className="font-black uppercase tracking-wider text-[11px]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="date-desc">Pinakabago (Newest)</option>
                    <option value="date-asc">Pinakauna (Oldest)</option>
                    <option value="name">Pangalan (A-Z)</option>
                    <option value="age-asc">Edad: Pataas (Youngest)</option>
                    <option value="age-desc">Edad: Pababa (Oldest)</option>
                    <option value="dept">Departamento</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills / Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#0038A8]" />
                <span>Filters:</span>
              </span>

              {/* Dynamic Department Filter */}
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="all">Lahat ng Department ({availableDepartments.length})</option>
                {availableDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Age Bracket Filter */}
              <select
                value={selectedAgeBracket}
                onChange={e => setSelectedAgeBracket(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="all">Lahat ng Edad</option>
                <option value="Under 25">Under 25 yrs</option>
                <option value="25 - 34">25 - 34 yrs</option>
                <option value="35 - 44">35 - 44 yrs</option>
                <option value="45 - 54">45 - 54 yrs</option>
                <option value="55 & Above">55 & Above</option>
              </select>

              {/* Gender Filter */}
              <select
                value={selectedGender}
                onChange={e => setSelectedGender(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="all">Lahat ng Kasarian</option>
                <option value="Male">Lalaki (Male)</option>
                <option value="Female">Babae (Female)</option>
              </select>

              {/* Team Filter */}
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="all">Lahat ng Koponan</option>
                <option value="unassigned">Walang Team (Unassigned)</option>
                {DEFAULT_TEAMS.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>

              {/* Reset Filters button */}
              {(selectedDepartment !== 'all' || selectedAgeBracket !== 'all' || selectedGender !== 'all' || selectedTeam !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedAgeBracket('all');
                    setSelectedGender('all');
                    setSelectedTeam('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1.5 text-xs text-[#CE1126] hover:underline font-black uppercase tracking-wider cursor-pointer"
                >
                  I-reset Lahat
                </button>
              )}
            </div>
          </div>

          {/* Batch Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedIds.length}
                </div>
                <span className="text-xs sm:text-sm font-bold text-red-950">
                  {selectedIds.length === 1 ? '1 kalahok ang napili' : `${selectedIds.length} mga kalahok ang napili`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  I-uncheck Lahat
                </button>
                <button
                  onClick={() => setShowBatchDeleteModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-red-600 text-white text-xs font-black hover:bg-red-700 transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>I-delete ang ({selectedIds.length}) Napili</span>
                </button>
              </div>
            </div>
          )}

          {/* Attendee Directory Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest text-[10px] border-b border-slate-200">
                  <th className="p-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-[#0038A8] transition-colors cursor-pointer flex items-center justify-center mx-auto"
                      title="Piliin lahat ng nasa listahan"
                    >
                      {filteredAttendees.length > 0 && filteredAttendees.every(a => a.id && selectedIds.includes(a.id)) ? (
                        <CheckSquare className="w-4 h-4 text-[#0038A8]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </th>
                  <th className="p-4">Kalahok (Participant)</th>
                  <th className="p-4 text-center">Edad & Kasarian</th>
                  <th className="p-4">Departamento</th>
                  <th className="p-4">Koponan (Team Assignment)</th>
                  <th className="p-4">Medical Notes</th>
                  <th className="p-4 text-right">Aksyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <span className="text-4xl block">🔍</span>
                        <p className="font-bold text-slate-700">Walang nahanap na kalahok.</p>
                        <p className="text-xs text-slate-500">
                          Subukang baguhin ang filter o i-clear ang search term.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map(attendee => {
                    const isSelected = attendee.id ? selectedIds.includes(attendee.id) : false;
                    return (
                      <tr
                        key={attendee.id}
                        className={`transition-colors ${isSelected ? 'bg-red-50/40' : 'hover:bg-slate-50/80'}`}
                      >
                        {/* Checkbox */}
                        <td className="p-4 text-center w-12">
                          <button
                            type="button"
                            onClick={() => attendee.id && handleToggleSelect(attendee.id)}
                            className="text-slate-400 hover:text-[#0038A8] transition-colors cursor-pointer flex items-center justify-center mx-auto"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-red-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                            )}
                          </button>
                        </td>

                        {/* Name & Nickname */}
                        <td className="p-4">
                          <div className="font-black text-slate-900 text-sm">
                            {attendee.fullName}
                          </div>
                          {attendee.nickname && (
                            <div className="text-xs text-[#0038A8] font-bold mt-0.5">
                              "{attendee.nickname}"
                            </div>
                          )}
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            ID: {attendee.id?.slice(0, 8)}
                          </span>
                        </td>

                        {/* Age & Gender */}
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl">
                            <span>{attendee.age}y</span>
                            <span className="text-slate-400">•</span>
                            <span>{attendee.gender === 'Male' ? '👦 M' : attendee.gender === 'Female' ? '👩 F' : '🌈'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase">
                            {getAgeBracket(attendee.age)}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="p-4">
                          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold inline-block border border-slate-200">
                            {attendee.department}
                          </span>
                        </td>

                        {/* Team Assignment Dropdown / Pill */}
                        <td className="p-4">
                          <select
                            value={attendee.assignedTeam || ''}
                            onChange={e => handleQuickTeamAssign(attendee.id!, e.target.value)}
                            className={`text-xs font-bold py-1.5 px-3 rounded-xl border-2 outline-none transition-all cursor-pointer ${
                              attendee.assignedTeam
                                ? 'bg-[#0038A8]/10 border-[#0038A8]/30 text-[#0038A8]'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <option value="">(Unassigned)</option>
                            {DEFAULT_TEAMS.map(t => (
                              <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                          </select>
                        </td>

                        {/* Medical Notes */}
                        <td className="p-4">
                          {attendee.medicalNotes && attendee.medicalNotes.trim().toUpperCase() !== 'N/A' && attendee.medicalNotes.trim().toUpperCase() !== 'NONE' ? (
                            <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 p-2 rounded-xl border border-red-100 max-w-[220px]">
                              <HeartPulse className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{attendee.medicalNotes}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs font-mono font-medium">
                              {attendee.medicalNotes ? attendee.medicalNotes : 'N/A'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedAttendee(attendee)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0038A8] hover:text-white text-slate-800 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                              title="Tingnan ang buong detalye"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Detalye</span>
                            </button>
                            <button
                              onClick={() => setAttendeeToDelete(attendee)}
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-bold text-xs flex items-center gap-1 transition-all border border-red-200/60 cursor-pointer"
                              title="I-delete ang kalahok"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Directory Summary Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 font-medium">
            <span>
              Ipinapakita ang <strong>{filteredAttendees.length}</strong> sa <strong>{registrations.length}</strong> kabuuang rehistradong empleyado.
            </span>
            <span>Real-time connected to Google Firestore Cloud Database.</span>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Single Participant Deletion Modal */}
      {attendeeToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#CE1126] p-5 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#FFCD00]" />
                <h3 className="text-base font-black tracking-tight">Kumpirmasyon sa Pag-Delete</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-700">
              <p className="text-sm">
                Sigurado ka bang nais mong <strong>permanenteng burahin</strong> ang kalahok na ito mula sa system at Firebase database?
              </p>

              <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200 space-y-1.5 text-xs">
                <div className="font-black text-slate-900 text-sm">
                  {attendeeToDelete.fullName}
                  {attendeeToDelete.nickname ? ` ("${attendeeToDelete.nickname}")` : ''}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>Edad: <strong>{attendeeToDelete.age}y ({attendeeToDelete.gender})</strong></span>
                  <span>•</span>
                  <span>Departamento: <strong>{attendeeToDelete.department}</strong></span>
                </div>
                {attendeeToDelete.assignedTeam && (
                  <div className="text-blue-700 font-bold">
                    Koponan: {attendeeToDelete.assignedTeam}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-red-600 font-medium">
                ⚠️ Hindi na mababawi ang rekord na ito kapag na-delete na.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAttendeeToDelete(null)}
                disabled={isDeletingSingle}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeletingSingle}
                className="px-5 py-2 rounded-xl bg-[#CE1126] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingSingle ? 'Binubura...' : 'Oo, Burahin ang Kalahok'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Deletion Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#CE1126] p-5 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#FFCD00]" />
                <h3 className="text-base font-black tracking-tight">Kumpirmasyon sa Maramihang Pag-Delete</h3>
              </div>
            </div>

            <div className="p-6 space-y-4 text-slate-700">
              <p className="text-sm">
                Sigurado ka bang nais mong burahin ang <strong>{selectedIds.length}</strong> na napiling kalahok sa opisyal na listahan?
              </p>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Lahat ng napiling rekord ay sabay-sabay na aalisin sa Firebase Firestore database at hindi na maibabalik.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                disabled={isDeletingBatch}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                disabled={isDeletingBatch}
                className="px-5 py-2 rounded-xl bg-[#CE1126] hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingBatch ? 'Binubura...' : `Oo, Burahin ang (${selectedIds.length}) Kalahok`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Guide Tab */}
      {activeTab === 'rules' && <GameRulesGuide />}

      {/* Attendee Details Modal */}
      {selectedAttendee && (
        <AttendeeDetailsModal
          attendee={selectedAttendee}
          onClose={() => setSelectedAttendee(null)}
          onUpdated={() => {
            showToast('Na-update ang impormasyon ng kalahok.');
          }}
          onDeleted={() => {
            showToast('Matagumpay na na-delete ang kalahok.');
          }}
        />
      )}

      {/* Smart Team Balancer Modal */}
      {isBalancerOpen && (
        <TeamBalancerModal
          registrations={registrations}
          onClose={() => setIsBalancerOpen(false)}
          onSuccess={() => {
            setIsBalancerOpen(false);
          }}
        />
      )}

      {/* Printable Roster Modal */}
      {isPrintableRosterOpen && (
        <PrintableRosterModal
          registrations={registrations}
          onClose={() => setIsPrintableRosterOpen(false)}
        />
      )}
    </div>
  );
};
