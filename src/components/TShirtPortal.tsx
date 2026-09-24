import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Shirt,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  UserCheck,
  Ruler,
  Info,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Search,
  Lock,
  Check,
  X,
  ZoomIn,
  Eye,
  Maximize2
} from 'lucide-react';
import jerseyMeasurementGuideImg from '../assets/images/jersey_measurement_1790236031117.jpg';
import {
  Registration,
  Team,
  DEFAULT_TEAMS,
  MENS_SHIRT_SIZES,
  WOMENS_SHIRT_SIZES,
  ALL_SHIRT_SIZES,
  ShirtMeasurement,
  normalizeDepartmentName,
  formatToSurnameFirst
} from '../types';
import { saveAttendeeTShirtSize, normalizeEmail } from '../firebase/registrations';
import { getTeamByName, getTeamBadgeStyle } from '../utils/teamUtils';
import { JerseySelectionSuccess } from './JerseySelectionSuccess';

interface TShirtPortalProps {
  registrations: Registration[];
  teams?: Team[];
  onNavigate: (path: string) => void;
}

const FROM_REGISTRATION_KEY = 'laro_ng_lahi_from_registration_email';

export const TShirtPortal: React.FC<TShirtPortalProps> = ({
  registrations,
  teams = DEFAULT_TEAMS,
  onNavigate
}) => {
  // Input email for gate
  const [emailInput, setEmailInput] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      // Check if user came directly from the registration confirmation page
      const fromReg = sessionStorage.getItem(FROM_REGISTRATION_KEY);
      if (fromReg) {
        sessionStorage.removeItem(FROM_REGISTRATION_KEY);
        return fromReg;
      }
      // For direct visits or refreshes, require logging in with email
      return null;
    }
    return null;
  });

  // Ensure stale persistent login is cleaned up so direct opens prompt for email
  useEffect(() => {
    try {
      localStorage.removeItem('laro_ng_lahi_verified_email');
    } catch {
      // ignore
    }
  }, []);

  // Verification error state (not found)
  const [notRegisteredEmail, setNotRegisteredEmail] = useState<string | null>(null);

  // Form selection states
  const [selectedCut, setSelectedCut] = useState<'Men' | 'Women'>('Men');
  const [selectedSize, setSelectedSize] = useState<string>('L');
  const [jerseyName, setJerseyName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAccomplishedModal, setShowAccomplishedModal] = useState(false);
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // View mode: 'form' (selection & size chart grid) or 'finish' (dedicated Katibayan finish page)
  const [viewMode, setViewMode] = useState<'form' | 'finish'>('form');

  // Active chart view tab (only Men or Women, no 'both')
  const [chartView, setChartView] = useState<'Men' | 'Women'>('Men');

  // Find the currently authenticated attendee in the real-time registrations list
  const currentAttendee = useMemo(() => {
    if (!verifiedEmail) return null;
    const targetNorm = normalizeEmail(verifiedEmail);
    return registrations.find(r => r.email && normalizeEmail(r.email) === targetNorm) || null;
  }, [verifiedEmail, registrations]);

  // Is size already officially saved and locked for this attendee?
  const isSizeLocked = Boolean(currentAttendee?.shirtSize);

  // Sync attendee's current size and jersey name when identified and show finish page if already registered
  useEffect(() => {
    if (currentAttendee) {
      if (currentAttendee.shirtGenderCut === 'Women' || currentAttendee.shirtGenderCut === 'Men') {
        setSelectedCut(currentAttendee.shirtGenderCut);
        setChartView(currentAttendee.shirtGenderCut);
      } else if (currentAttendee.gender === 'Female') {
        setSelectedCut('Women');
        setChartView('Women');
      } else {
        setSelectedCut('Men');
        setChartView('Men');
      }

      if (currentAttendee.shirtSize) {
        setSelectedSize(currentAttendee.shirtSize);
        // By default, attendees who already locked their size land directly on the Finish Page
        setViewMode('finish');
      } else {
        setViewMode('form');
      }

      // Sync or initialize jersey name
      if (currentAttendee.jerseyName) {
        setJerseyName(currentAttendee.jerseyName);
      } else if (currentAttendee.nickname) {
        setJerseyName(currentAttendee.nickname.trim().toUpperCase());
      } else {
        const parts = currentAttendee.fullName.includes(',')
          ? currentAttendee.fullName.split(',')[0].trim().toUpperCase()
          : currentAttendee.fullName.trim().split(' ').pop()?.toUpperCase() || '';
        setJerseyName(parts.slice(0, 16));
      }
    }
  }, [currentAttendee?.id, currentAttendee?.shirtSize, currentAttendee?.jerseyName]);

  // Generate suggested jersey names based on attendee details
  const nameSuggestions = useMemo(() => {
    if (!currentAttendee) return [];
    const list: { label: string; value: string }[] = [];

    if (currentAttendee.nickname?.trim()) {
      list.push({ label: 'Palayaw', value: currentAttendee.nickname.trim().toUpperCase() });
    }

    if (currentAttendee.fullName.includes(',')) {
      const parts = currentAttendee.fullName.split(',');
      const surname = parts[0]?.trim().toUpperCase();
      const first = parts[1]?.trim().split(' ')[0]?.toUpperCase();
      if (surname) list.push({ label: 'Apelyido', value: surname });
      if (first) list.push({ label: 'First Name', value: first });
    } else {
      const parts = currentAttendee.fullName.trim().split(' ');
      if (parts.length > 1) {
        const surname = parts[parts.length - 1].toUpperCase();
        const firstName = parts[0].toUpperCase();
        list.push({ label: 'Apelyido', value: surname });
        list.push({ label: 'First Name', value: firstName });
      } else if (parts.length === 1 && parts[0]) {
        list.push({ label: 'Pangalan', value: parts[0].toUpperCase() });
      }
    }

    const uniqueMap = new Map<string, { label: string; value: string }>();
    list.forEach(item => {
      const clean = item.value.slice(0, 16);
      if (clean && !uniqueMap.has(clean)) {
        uniqueMap.set(clean, { label: item.label, value: clean });
      }
    });

    return Array.from(uniqueMap.values());
  }, [currentAttendee]);

  const triggerCelebrationConfetti = () => {
    const count = 180;
    const defaults = {
      origin: { y: 0.6 },
      colors: ['#0038A8', '#CE1126', '#FFCD00', '#00A86B', '#3b82f6']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  // Handle email verification submission
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setNotRegisteredEmail(null);

    const cleanInput = emailInput.trim().toLowerCase();
    if (!cleanInput) {
      setErrorMessage('Paki-lagay ang inyong email address.');
      return;
    }

    const normInput = normalizeEmail(cleanInput);
    const found = registrations.find(r => r.email && normalizeEmail(r.email) === normInput);

    if (!found) {
      // Not registered! Show warning and reminder to register first
      setNotRegisteredEmail(cleanInput);
      return;
    }

    // Found! Authorize attendee for this session
    setVerifiedEmail(cleanInput);
  };

  const handleLogout = () => {
    setVerifiedEmail(null);
    setEmailInput('');
    setNotRegisteredEmail(null);
    setShowAccomplishedModal(false);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(FROM_REGISTRATION_KEY);
        localStorage.removeItem('laro_ng_lahi_verified_email');
      } catch {
        // ignore
      }
    }
  };

  // Handle saving Jersey size & jersey name
  const handleSaveSize = async () => {
    if (!currentAttendee?.id) {
      setErrorMessage('Hindi matagpuan ang iyong registration record. Pakisubukan muling mag-login.');
      return;
    }

    if (isSizeLocked) {
      setErrorMessage('Nai-save na ang iyong sukat at naka-lock na. Makipag-ugnayan sa Admin kung may kinakailangang baguhin.');
      return;
    }

    const trimmedJerseyName = jerseyName.trim().toUpperCase();
    if (!trimmedJerseyName) {
      setErrorMessage('Pakilagay ang inyong Jersey Name (pangalan sa likod ng jersey) bago i-save.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await saveAttendeeTShirtSize(currentAttendee.id, selectedSize, selectedCut, trimmedJerseyName);
      setViewMode('finish');
      setShowAccomplishedModal(true);
      triggerCelebrationConfetti();
    } catch (err: any) {
      console.error('Error saving jersey size and name:', err);
      setErrorMessage('Nagkaroon ng aberya sa pag-save. Pakisubukan muli.');
    } finally {
      setIsSaving(false);
    }
  };

  // Find measurement details for current selection
  const currentMeasurement = useMemo<ShirtMeasurement | undefined>(() => {
    const table = selectedCut === 'Women' ? WOMENS_SHIRT_SIZES : MENS_SHIRT_SIZES;
    return table.find(s => s.size === selectedSize);
  }, [selectedCut, selectedSize]);

  // Team badge styling for attendee
  const assignedTeamObj = useMemo(() => {
    return getTeamByName(currentAttendee?.assignedTeam, teams);
  }, [currentAttendee?.assignedTeam, teams]);

  const teamBadgeStyle = useMemo(() => {
    return assignedTeamObj ? getTeamBadgeStyle(assignedTeamObj) : null;
  }, [assignedTeamObj]);

  // -------------------------------------------------------------
  // VIEW 1: EMAIL VERIFICATION GATE (NOT LOGGED IN OR NOT REGISTERED)
  // -------------------------------------------------------------
  if (!verifiedEmail || !currentAttendee) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0038A8] to-blue-600 text-white shadow-xl shadow-blue-500/20 mb-4 ring-4 ring-blue-100">
            <Shirt className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFCD00]/20 text-[#0038A8] text-xs font-black uppercase tracking-wider mb-2 border border-[#FFCD00]/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Opisyal na Pagpili ng Sukat ng Jersey
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pumili ng Sukat ng Iyong Jersey
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 font-medium">
            Pakilagay ang iyong rehistradong email upang ma-verify ang iyong rehistrasyon bago pumili ng tamang sukat.
          </p>
        </div>

        {/* Not Registered Reminder Card */}
        {notRegisteredEmail && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-3xl p-6 shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#CE1126] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-red-900">
                  Hindi Pa Nakarehistro ang Email na Ito!
                </h3>
                <p className="text-sm text-red-800 mt-1 font-medium">
                  Ang email na <strong className="font-bold underline text-red-950">{notRegisteredEmail}</strong> ay wala pa sa opisyal na talaan ng mga kalahok sa <span className="font-bold">Laro ng Lahi 2026</span>.
                </p>
                <p className="text-xs text-red-700 mt-2">
                  Paalala: Kailangan mo munang mag-rehistro sa event bago ka makapili ng iyong opisyal na jersey at sukat upang masigurong ikaw ay maibilang sa team roster.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('/')}
                    className="px-5 py-2.5 rounded-xl bg-[#0038A8] hover:bg-blue-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Mag-rehistro Muna Dito (Go to Registration)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotRegisteredEmail(null);
                      setEmailInput('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-red-200 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Subukan ang Ibang Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Entry Card */}
        <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-xl p-6 sm:p-8">
          <form onSubmit={handleVerifyEmail} className="space-y-5">
            <div>
              <label htmlFor="tshirt-email-input" className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                Iyong Registered Email Address <span className="text-[#CE1126]">*</span>
              </label>
              <div className="relative">
                <input
                  id="tshirt-email-input"
                  type="email"
                  required
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    if (notRegisteredEmail) setNotRegisteredEmail(null);
                  }}
                  placeholder="Halimbawa: juan.delacruz@timcorp.net.ph"
                  className="w-full px-4 py-3.5 pl-11 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm shadow-inner"
                  autoFocus
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-medium">
                Gamitin ang email address na inyong inilagay noong nag-rehistro sa Laro ng Lahi.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#0038A8] to-blue-700 hover:from-blue-700 hover:to-[#0038A8] text-white font-extrabold text-base shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-5 h-5" />
              <span>I-verify ang Email & Pumili ng Sukat</span>
            </button>
          </form>

          {/* Quick links */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-slate-600 hover:text-[#0038A8] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bumalik sa Registration Form</span>
            </button>
            <span className="text-slate-400 font-medium">
              May katanungan? Makipag-ugnayan sa Sportsfest Committee.
            </span>
          </div>
        </div>

        {/* Size Chart Preview Section for Public Browsing */}
        <div className="mt-8 bg-white/70 backdrop-blur-xs rounded-3xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ruler className="w-5 h-5 text-[#0038A8]" />
            <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
              Silipin ang Jersey Size Chart
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Maaari mo nang tingnan ang gabay sa pagsukat at mga opisyal na sukat (inches) habang inihahanda ang iyong rehistrasyon:
          </p>

          {/* Official Jersey Visual Measurement Diagram Card (Now Above Size Chart) */}
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 text-white flex flex-col sm:flex-row items-center gap-4">
            <div
              onClick={() => setShowMeasurementModal(true)}
              className="relative group cursor-pointer w-28 sm:w-32 h-28 sm:h-32 rounded-xl overflow-hidden bg-white shrink-0 border border-white/20 shadow-md"
            >
              <img
                src={jerseyMeasurementGuideImg}
                alt="Gabay sa Pagsukat ng Jersey"
                className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="px-2 py-1 rounded bg-black/80 text-[10px] font-bold text-white flex items-center gap-1">
                  <ZoomIn className="w-3 h-3 text-[#FFCD00]" /> Palakihin
                </span>
              </div>
            </div>
            <div className="flex-1 text-left space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFCD00] text-slate-950">
                  Visual Guide
                </span>
                <h4 className="text-sm font-black text-white">Paano Sukatin ang Jersey</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tiyakin ang tamang sukat gamit ang measuring tape (pulgada/inches):
              </p>
              <div className="text-[11px] space-y-1">
                <p className="text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span><strong>LENGTH:</strong> Sukat mula sa balikat pababa sa laylayan ng damit.</span>
                </p>
                <p className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span><strong>WIDTH (PAIKOT):</strong> Sukat paikot sa buong dibdib (chest circumference).</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMeasurementModal(true)}
                className="mt-1 text-xs text-[#FFCD00] hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Tingnan ang Malaking Diagram & Detalye →</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Men's Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-black text-slate-800 uppercase tracking-wide flex items-center justify-between mb-2">
                <span>Sukat Pang-Lalaki</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">XS hanggang 5XL</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Haba (Length): 27" – 35" • Lapad Paikot: 36" – 52"
              </p>
              <div className="text-[10px] text-slate-600 font-medium">
                Halimbawa: Medium = 29" Haba, 40" Lapad Paikot (20" Flat Width)
              </div>
            </div>

            {/* Women's Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="font-black text-slate-800 uppercase tracking-wide flex items-center justify-between mb-2">
                <span>Sukat Pang-Babae</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">XS hanggang 5XL</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">
                Haba (Length): 24" – 32" • Lapad Paikot: 34" – 50"
              </p>
              <div className="text-[10px] text-slate-600 font-medium">
                Halimbawa: Medium = 26" Haba, 38" Lapad Paikot (19" Flat Width)
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: DEDICATED FINISH PAGE (LIKE REGISTRATION SUCCESS)
  // -------------------------------------------------------------
  if (viewMode === 'finish') {
    return (
      <JerseySelectionSuccess
        attendee={currentAttendee}
        assignedTeamObj={undefined}
        teamBadgeStyle={null}
        selectedCut={selectedCut}
        selectedSize={selectedSize}
        jerseyName={currentAttendee.jerseyName || jerseyName}
        measurement={currentMeasurement}
        showModal={showAccomplishedModal}
        onCloseModal={() => setShowAccomplishedModal(false)}
        onViewChart={() => {
          setShowAccomplishedModal(false);
          setViewMode('form');
        }}
        onNavigate={onNavigate}
        onLogout={handleLogout}
      />
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: AUTHENTICATED T-SHIRT SELECTION & SIZE CHART PORTAL
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {/* Top Banner / Participant Recognition Header */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-md p-5 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Attendee Info */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0038A8] to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
              {currentAttendee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {formatToSurnameFirst(currentAttendee.fullName)}
                </h2>
                {currentAttendee.nickname && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0038A8] text-xs font-bold">
                    "{currentAttendee.nickname}"
                  </span>
                )}
                {currentAttendee.jerseyName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-mono font-black flex items-center gap-1">
                    <span>🎽</span>
                    <span>Jersey: "{currentAttendee.jerseyName}"</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0038A8] border border-blue-200 text-xs font-bold inline-flex items-center gap-1">
                  <span>🤫</span>
                  <span>Koponan: Ihahayag sa Palaro</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {normalizeDepartmentName(currentAttendee.department)} • <span className="text-slate-700">{currentAttendee.email}</span>
              </p>
            </div>
          </div>

          {/* Right: Current Saved Size Status, Finish Page CTA & Logout */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {currentAttendee.shirtSize ? (
              <div className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>Opisyal na Sukat:</span>
                    <strong className="font-black text-sm">
                      {currentAttendee.shirtGenderCut === 'Women' ? 'Pang-Babae' : 'Pang-Lalaki'} • {currentAttendee.shirtSize}
                    </strong>
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-emerald-200/60 text-emerald-900 text-[10px] font-black">
                      <Lock className="w-2.5 h-2.5" /> Naka-lock
                    </span>
                  </div>
                  {currentAttendee.jerseyName && (
                    <div className="text-[11px] font-mono font-bold text-emerald-900 mt-0.5">
                      Jersey: "{currentAttendee.jerseyName}"
                    </div>
                  )}
                  {currentAttendee.shirtUpdatedDate && (
                    <div className="text-[10px] text-emerald-700 font-normal">
                      Naitala: {new Date(currentAttendee.shirtUpdatedDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Wala pang napipiling sukat ng jersey</span>
              </div>
            )}

            {isSizeLocked && (
              <button
                type="button"
                onClick={() => setViewMode('finish')}
                className="px-3.5 py-2 rounded-2xl bg-[#0038A8] hover:bg-blue-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                title="Tingnan ang Katibayan (Finish Page)"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFCD00]" />
                <span className="hidden sm:inline">Tingnan ang Katibayan</span>
                <span className="sm:hidden">Katibayan</span>
                <span>→</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Mag-switch ng Account / Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Selection Form on the LEFT (5 cols) and Size Chart on the RIGHT (7 cols) - Even Height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Form Controls to Select Fit & Size (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-5 sm:p-6 flex flex-col justify-between h-full">
            {/* Top section: Header, Fit & Size selection */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-4 pb-3.5 border-b border-slate-100 min-h-[44px]">
                <div className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-[#0038A8]" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Piliin ang Sukat ng Jersey
                  </h3>
                </div>
                {isSizeLocked ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Naka-save na
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400">Hakbang 1, 2 at 3</span>
                )}
              </div>

              {/* Lock Notice if already submitted */}
              {isSizeLocked && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-black text-xs text-emerald-900">
                      Opisyal nang naipasa ang iyong sukat!
                    </p>
                    <p className="font-medium text-[11px] text-emerald-800 mt-0.5 leading-normal">
                      Naka-lock na ito. Tanging ang <strong>Admin</strong> lamang ang maaaring magbago sa Admin Portal.
                    </p>
                    <button
                      type="button"
                      onClick={() => setViewMode('finish')}
                      className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tingnan ang Katibayan (Finish Page) →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Pangalan sa Likod ng Jersey (Jersey Name) */}
              <div className="mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    1. Pangalan sa Likod ng Jersey (Jersey Name) <span className="text-[#CE1126]">*</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {jerseyName.length}/16 titik
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    disabled={isSizeLocked}
                    maxLength={16}
                    value={jerseyName}
                    onChange={e => setJerseyName(e.target.value.toUpperCase())}
                    placeholder="HAL. DELA CRUZ O JUANING"
                    className={`w-full px-4 py-3 rounded-2xl border-2 font-mono uppercase font-black tracking-widest text-sm sm:text-base outline-hidden transition-all ${
                      isSizeLocked
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-white border-slate-200 focus:border-[#0038A8] text-slate-900 focus:ring-4 focus:ring-blue-100'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base select-none">
                    🎽
                  </span>
                </div>

                {/* Quick Suggestion Chips (if not locked) */}
                {!isSizeLocked && nameSuggestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1">
                      Mungkahing Itatak:
                    </span>
                    {nameSuggestions.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setJerseyName(s.value)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                          jerseyName === s.value
                            ? 'bg-[#0038A8] border-[#0038A8] text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                        }`}
                      >
                        {s.value} <span className="text-[9px] opacity-75 font-normal">({s.label})</span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-slate-500 mt-1.5">
                  Ito ang opisyal na itatatak sa likod ng jersey sa Palarong Pinoy 2026.
                </p>

                {/* Live Jersey Back Preview Mini-Card (no number) */}
                <div className="mt-3 p-4 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-inner flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126]" />
                  <div className="w-10 h-2.5 rounded-b-full bg-slate-950/80 border-b border-white/20 mb-2.5" />
                  
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    <span>TIM LARO NG LAHI</span>
                    <span>•</span>
                    <span className="text-[#FFCD00]">LIVE BACK PREVIEW</span>
                  </div>

                  <div className="w-full text-center px-4 py-2">
                    <span className="font-mono font-black text-base sm:text-lg tracking-widest text-[#FFCD00] uppercase bg-white/5 border border-white/10 px-4 py-1.5 rounded-md inline-block max-w-full truncate shadow-xs">
                      {jerseyName.trim() || 'IYONG PANGALAN'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 tracking-wider mt-2 pt-2 border-t border-white/10 w-full justify-center">
                    <span>{selectedCut === 'Women' ? "Women's Fit" : "Men's Fit"}</span>
                    <span>•</span>
                    <span className="text-white font-bold">Size {selectedSize}</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Fit / Cut Selection (Pang-Lalaki & Pang-Babae) */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                  2. Uri ng Tabas (Fit) <span className="text-[#CE1126]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={isSizeLocked}
                    onClick={() => {
                      if (isSizeLocked) return;
                      setSelectedCut('Men');
                      setChartView('Men');
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSizeLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      selectedCut === 'Men'
                        ? 'border-[#0038A8] bg-blue-50/70 text-[#0038A8] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">Pang-Lalaki</span>
                      <span className="text-base">👔</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    disabled={isSizeLocked}
                    onClick={() => {
                      if (isSizeLocked) return;
                      setSelectedCut('Women');
                      setChartView('Women');
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSizeLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      selectedCut === 'Women'
                        ? 'border-[#CE1126] bg-rose-50/70 text-[#CE1126] shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm">Pang-Babae</span>
                      <span className="text-base">👚</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 3: Size Buttons Selection - Aligned with the table on the right */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                    3. Piliin ang Sukat (Size) <span className="text-[#CE1126]">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-bold">
                    {selectedCut === 'Women' ? 'Pang-Babae' : 'Pang-Lalaki'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ALL_SHIRT_SIZES.map(size => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isSizeLocked}
                        onClick={() => {
                          if (isSizeLocked) return;
                          setSelectedSize(size);
                        }}
                        className={`py-2.5 px-2 rounded-xl border-2 font-black transition-all flex items-center justify-center ${
                          isSizeLocked ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? selectedCut === 'Women'
                              ? 'border-[#CE1126] bg-[#CE1126] text-white shadow-md scale-[1.02]'
                              : 'border-[#0038A8] bg-[#0038A8] text-white shadow-md scale-[1.02]'
                            : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                        }`}
                      >
                        <span className="text-base font-black">{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom section: Chosen dimension specs & save button */}
            <div className="mt-4 pt-2">
              {/* Current Chosen Dimension Specs Card */}
              {currentMeasurement && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                      Sukat na Napili:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0038A8] font-black text-xs">
                      {selectedCut === 'Women' ? 'Pang-Babae' : 'Pang-Lalaki'} • Sukat {selectedSize}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Haba (Length)</span>
                      <span className="font-black text-slate-800 text-sm">{currentMeasurement.length} inches</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-black block">Lapad Paikot</span>
                      <span className="font-black text-blue-700 text-sm">{currentMeasurement.widthPaikot} inches</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">
                    Flat width (lapad sa dibdib): <strong>{currentMeasurement.flatWidth} inches</strong>
                  </p>
                </div>
              )}

              {/* Save or Locked Button */}
              {isSizeLocked ? (
                <div className="space-y-1.5">
                  <div className="w-full py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <span>Opisyal Nang Naipasa at Naka-lock</span>
                  </div>
                  <p className="text-[10px] text-slate-400 text-center font-medium">
                    Kung nais ninyong palitan ang inyong sukat o jersey name, makipag-ugnayan sa inyong Sportsfest Admin.
                  </p>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSaveSize}
                    disabled={isSaving}
                    className="w-full py-3.5 rounded-2xl bg-[#0038A8] hover:bg-blue-800 disabled:opacity-50 text-white font-black text-sm sm:text-base shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sine-save ang sukat at jersey name...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Opisyal na I-save ang Sukat at Jersey Name</span>
                      </>
                    )}
                  </button>

                  {errorMessage && (
                    <p className="text-xs text-red-600 font-bold text-center mt-2">
                      {errorMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Size Chart (Reference Only, 7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-5 sm:p-6 overflow-hidden flex flex-col justify-between h-full">
            {/* Top section: Header and size tables */}
            <div>
              {/* Size Chart Header Bar with View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3.5 border-b border-slate-100 min-h-[44px]">
                <div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-[#0038A8]" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                      MGA SUKAT NG JERSEY (SIZE CHART)
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      Inches
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Opisyal na batayan ng sukat para sa Laro ng Lahi 2026 Sportsfest Jersey
                  </p>
                </div>

                {/* View Switcher Tabs (Pang-Lalaki & Pang-Babae - Synced with selection) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setChartView('Men');
                      if (!isSizeLocked) setSelectedCut('Men');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartView === 'Men'
                        ? 'bg-white text-[#0038A8] shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pang-Lalaki
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChartView('Women');
                      if (!isSizeLocked) setSelectedCut('Women');
                    }}
                    className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                      chartView === 'Women'
                        ? 'bg-white text-[#CE1126] shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pang-Babae
                  </button>
                </div>
              </div>

              {/* Official Visual Jersey Measurement Guide (PLACED ABOVE THE SIZE CHART) */}
              <div className="mb-4">
                <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-800 text-white shadow-md relative overflow-hidden">
                  {/* Subtle top accent bar */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126]" />

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Interactive Jersey Diagram Thumbnail with zoom trigger */}
                    <div
                      onClick={() => setShowMeasurementModal(true)}
                      className="relative group cursor-pointer w-32 sm:w-36 shrink-0 rounded-2xl bg-white p-2 border-2 border-white/20 shadow-lg transition-all hover:border-[#FFCD00]"
                    >
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        <img
                          src={jerseyMeasurementGuideImg}
                          alt="Opisyal na Gabay sa Pagsukat ng Jersey - Length at Width Paikot"
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          <span className="p-1.5 rounded-full bg-black/70 text-white shadow-sm">
                            <ZoomIn className="w-4 h-4 text-[#FFCD00]" />
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-white bg-black/60 px-1.5 py-0.5 rounded">
                            I-zoom
                          </span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between px-0.5">
                        <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">
                          Diagram
                        </span>
                        <span className="text-[9px] text-[#0038A8] font-bold flex items-center gap-0.5">
                          <Maximize2 className="w-2.5 h-2.5" /> Palakihin
                        </span>
                      </div>
                    </div>

                    {/* Guide Details & Explanations */}
                    <div className="flex-1 space-y-2 text-left w-full">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#FFCD00] text-slate-950 font-black text-[10px] uppercase tracking-wider">
                            Visual Guide
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                            Paano Sukatin ang Jersey
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMeasurementModal(true)}
                          className="text-[11px] font-bold text-[#FFCD00] hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-xl"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>I-zoom ang Larawan</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase text-[10px] mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>LENGTH (Haba ng Damit)</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug font-medium">
                            Mula sa balikat / kuwelyo pababa sa laylayan (laylay) ng damit.
                          </p>
                        </div>

                        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[10px] mb-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCD00]" />
                            <span>WIDTH (PAIKOT na Lapad)</span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug font-medium">
                            Sukat paikot sa dibdib (chest circumference) gamit ang tape measure.
                          </p>
                        </div>
                      </div>

                      <p className="text-[10px] text-blue-200 leading-tight">
                        💡 <strong>Tip:</strong> Tingnan ang diagram bago pumili ng sukat sa talahanayan sa ibaba. Kung alanganin, piliin ang mas malaki.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size Table - Positioned directly below the Visual Measurement Guide */}
              <div className="space-y-4">
                {/* Men's Size Table */}
                {chartView === 'Men' && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#0038A8] text-white px-4 py-2.5 flex items-center justify-between font-black text-xs uppercase tracking-wider">
                      <span>SUKAT PANG-LALAKI (MEN'S)</span>
                      <span className="text-[10px] text-amber-300 font-bold">MEASUREMENTS IN INCHES</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 font-black text-slate-700 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 sm:px-4">SIZE</th>
                            <th className="py-2.5 px-3 sm:px-4">LENGTH (Haba)</th>
                            <th className="py-2.5 px-3 sm:px-4">WIDTH PAIKOT (Lapad)</th>
                            <th className="py-2.5 px-3 sm:px-4">FLAT WIDTH (Patag)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MENS_SHIRT_SIZES.map(item => {
                            const isCurrent = selectedCut === 'Men' && selectedSize === item.size;
                            return (
                              <tr
                                key={item.size}
                                className={`transition-colors ${
                                  isCurrent
                                    ? 'bg-blue-50 font-black text-[#0038A8]'
                                    : 'text-slate-800 hover:bg-slate-50/50'
                                }`}
                              >
                                <td className="py-2.5 px-3 sm:px-4 font-extrabold flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-[#0038A8] ring-2 ring-blue-300' : 'bg-slate-300'}`} />
                                  <span className="text-sm font-black">{item.size}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-blue-100 text-[#0038A8]">
                                      Napili ✓
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 sm:px-4 font-medium">{item.length}"</td>
                                <td className="py-2.5 px-3 sm:px-4 font-bold text-blue-900">{item.widthPaikot}"</td>
                                <td className="py-2.5 px-3 sm:px-4 text-slate-500">{item.flatWidth}"</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Women's Size Table */}
                {chartView === 'Women' && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="bg-[#CE1126] text-white px-4 py-2.5 flex items-center justify-between font-black text-xs uppercase tracking-wider">
                      <span>SUKAT PANG-BABAE (WOMEN'S)</span>
                      <span className="text-[10px] text-amber-300 font-bold">MEASUREMENTS IN INCHES</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 border-b border-slate-200 font-black text-slate-700 uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-3 sm:px-4">SIZE</th>
                            <th className="py-2.5 px-3 sm:px-4">LENGTH (Haba)</th>
                            <th className="py-2.5 px-3 sm:px-4">WIDTH PAIKOT (Lapad)</th>
                            <th className="py-2.5 px-3 sm:px-4">FLAT WIDTH (Patag)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {WOMENS_SHIRT_SIZES.map(item => {
                            const isCurrent = selectedCut === 'Women' && selectedSize === item.size;
                            return (
                              <tr
                                key={item.size}
                                className={`transition-colors ${
                                  isCurrent
                                    ? 'bg-rose-50 font-black text-[#CE1126]'
                                    : 'text-slate-800 hover:bg-slate-50/50'
                                }`}
                              >
                                <td className="py-2.5 px-3 sm:px-4 font-extrabold flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-[#CE1126] ring-2 ring-rose-300' : 'bg-slate-300'}`} />
                                  <span className="text-sm font-black">{item.size}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-black px-1.5 py-0.2 rounded-md bg-rose-100 text-[#CE1126]">
                                      Napili ✓
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 sm:px-4 font-medium">{item.length}"</td>
                                <td className="py-2.5 px-3 sm:px-4 font-bold text-rose-900">{item.widthPaikot}"</td>
                                <td className="py-2.5 px-3 sm:px-4 text-slate-500">{item.flatWidth}"</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Size Table Footnote & Quick Reference */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-500">
                Paalala: Lahat ng sukat sa talahanayan ay nakasaad sa <strong>pulgada (inches)</strong>.
              </span>
              <button
                type="button"
                onClick={() => setShowMeasurementModal(true)}
                className="text-[11px] font-bold text-[#0038A8] hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Palakihin ang Gabay sa Pagsukat</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Finished / Accomplished Pop-up Modal */}
      {showAccomplishedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 max-w-md w-full p-6 sm:p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top accent badge */}
            <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126]" />

            <button
              type="button"
              onClick={() => setShowAccomplishedModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Big Success Icon */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              Opisyal na Naitala!
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Matagumpay ang Pagpili ng Sukat!
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
              Salamat, <strong className="text-slate-900">{currentAttendee.fullName}</strong>! Opisyal nang nairehistro ang sukat ng iyong jersey para sa <span className="font-bold text-[#0038A8]">Laro ng Lahi 2026</span>.
            </p>

            {/* Official Jersey Selection Summary Card */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200 text-left">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Kalahok:</span>
                <span className="text-xs font-black text-slate-900">{currentAttendee.fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Departamento:</span>
                <span className="text-xs font-bold text-slate-800">{currentAttendee.department}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Koponan:</span>
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>🤫</span>
                  <span>Ihahayag sa Opening Ceremony</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sukat ng Jersey:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-black text-xs">
                    {selectedCut === 'Women' ? 'Pang-Babae' : 'Pang-Lalaki'} • {selectedSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Lock Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-left flex items-start gap-2.5 mb-5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium leading-relaxed">
                <strong>Paalala:</strong> Naka-lock na ang iyong napiling sukat upang hindi magkaroon ng pagkaantala sa pagpapatahi. Kung kailangang baguhin, makipag-ugnayan lamang sa <strong>Admin</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAccomplishedModal(false);
                setViewMode('finish');
              }}
              className="w-full py-3.5 rounded-2xl bg-[#0038A8] hover:bg-blue-800 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Tingnan ang Katibayan (Finish Page) →</span>
            </button>
          </div>
        </div>
      )}

      {/* Full-screen Jersey Measurement Guide Modal */}
      {showMeasurementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-300 max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col relative animate-in zoom-in-95 duration-200">
            {/* Top accent gradient */}
            <div className="h-2.5 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126] shrink-0" />

            {/* Modal Header */}
            <div className="p-4 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-[#0038A8]" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Opisyal na Gabay sa Pagsukat ng Jersey
                  </h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Laro ng Lahi 2026 • Length (Haba) & Width Paikot (Chest Circumference)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMeasurementModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Full Image Container */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200 flex items-center justify-center">
                <img
                  src={jerseyMeasurementGuideImg}
                  alt="Opisyal na Sukat ng Jersey - Diagram"
                  className="max-h-[420px] w-auto object-contain rounded-xl shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Measurement Legend & Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-red-50/70 border-2 border-red-200/80">
                  <div className="flex items-center gap-2 font-black text-red-900 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#CE1126] text-white text-[10px] uppercase tracking-wider font-mono">
                      LENGTH
                    </span>
                    <span>Haba ng Damit</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Sukat mula sa pinakamataas na punto ng balikat (sa tabi ng kuwelyo) diretso pababa hanggang sa pinakaibaba o laylayan ng damit.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border-2 border-blue-200/80">
                  <div className="flex items-center gap-2 font-black text-blue-900 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-[#0038A8] text-white text-[10px] uppercase tracking-wider font-mono">
                      WIDTH (PAIKOT)
                    </span>
                    <span>Lapad Paikot sa Dibdib</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Gamit ang measuring tape, sukatin paikot ang dibdib (circumference) sa ilalim lamang ng manggas sa pinakamalapad na bahagi.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4 text-[#0038A8] shrink-0" />
                  <span>
                    Lahat ng sukat sa chart ay nasa <strong>pulgada (inches)</strong>. Piliin ang mas malaking sukat kung nag-aalangan.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMeasurementModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#0038A8] hover:bg-blue-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all self-end sm:self-auto"
                >
                  Naiintindihan Ko Na ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function selectedMeasurementDetails(size: string, cut: 'Men' | 'Women'): string {
  return `${size} (${cut === 'Women' ? "Pang-Babae" : "Pang-Lalaki"})`;
}
