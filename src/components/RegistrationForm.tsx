import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  User,
  Building,
  Calendar,
  Clock,
  MapPin,
  HeartPulse,
  Send,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { Registration, DEPARTMENTS } from '../types';
import { submitRegistration, findDuplicateRegistration } from '../firebase/registrations';
import { RegistrationCountdown, REGISTRATION_DEADLINE_MS } from './RegistrationCountdown';
import { EventLocationMap } from './EventLocationMap';

interface RegistrationFormProps {
  onSuccess: (registrationData: Registration, docId: string) => void;
  attendeeCount?: number;
  registrations?: Registration[];
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, registrations = [] }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    email: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    department: '',
    medicalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRegistrationClosed = Date.now() >= REGISTRATION_DEADLINE_MS;

  // Real-time duplicate attendee detection for proactive user guidance
  const duplicateNameAttendee = useMemo(() => {
    const trimmed = formData.fullName.trim();
    if (!trimmed || trimmed.length < 3) return null;
    const check = findDuplicateRegistration(registrations, { fullName: trimmed, email: '' });
    return check.isDuplicate ? check.existing : null;
  }, [formData.fullName, registrations]);

  const duplicateEmailAttendee = useMemo(() => {
    const raw = formData.email.trim().toLowerCase();
    if (!raw || raw.length < 3) return null;
    const resolved = raw.includes('@') ? raw : `${raw}@timcorp.net.ph`;
    const check = findDuplicateRegistration(registrations, { fullName: '', email: resolved });
    return check.isDuplicate ? check.existing : null;
  }, [formData.email, registrations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (Date.now() >= REGISTRATION_DEADLINE_MS) {
      setErrorMessage('Paumanhin, sarado na ang opisyal na rehistrasyon noong Setyembre 18, 2026, 7:00 PM PST.');
      return;
    }

    // Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Paki-lagay ang inyong buong pangalan (Full Name).');
      return;
    }

    // Email validation - must be timcorp.net.ph domain
    const emailRaw = formData.email.trim().toLowerCase();
    if (!emailRaw) {
      setErrorMessage('Paki-lagay ang inyong opisyal na TIM Corp email address (@timcorp.net.ph).');
      return;
    }

    let resolvedEmail = emailRaw;
    if (!resolvedEmail.includes('@')) {
      resolvedEmail = `${resolvedEmail}@timcorp.net.ph`;
    }

    if (!resolvedEmail.endsWith('@timcorp.net.ph')) {
      setErrorMessage('Kailangan ay may domain na @timcorp.net.ph ang email address (Hal. juan.delacruz@timcorp.net.ph).');
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@timcorp\.net\.ph$/i;
    if (!emailPattern.test(resolvedEmail)) {
      setErrorMessage('Paki-suri ang email address kung wasto ang format (Hal. juan.delacruz@timcorp.net.ph).');
      return;
    }

    // Prevent duplicate attendees: check both full name and email against existing registrations
    const duplicateCheck = findDuplicateRegistration(registrations, {
      fullName: formData.fullName.trim(),
      email: resolvedEmail
    });

    if (duplicateCheck.isDuplicate && duplicateCheck.existing) {
      const fieldDescription = duplicateCheck.matchedField === 'email'
        ? `ang email na "${resolvedEmail}"`
        : `ang pangalang "${formData.fullName.trim()}"`;
      setErrorMessage(
        `Bawal ang duplicate registration: Naka-rehistro na po ${fieldDescription} para kay ${duplicateCheck.existing.fullName} (${duplicateCheck.existing.department || 'TIM Corp'}). Bawat kalahok ay pinapayagan lamang ng isang (1) rehistrasyon.`
      );
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 85) {
      setErrorMessage('Paki-lagay ang tamang edad (16 - 85 taong gulang) para sa patas na team allocation.');
      return;
    }

    if (!formData.department.trim()) {
      setErrorMessage('Paki-pili ang inyong Departamento / Unit.');
      return;
    }

    if (!formData.medicalNotes.trim()) {
      setErrorMessage('Paki-lagay ang Medical Notes o isulat ang "N/A" kung walang iniindang kondisyon sa kalusugan.');
      return;
    }

    const resolvedDepartment = formData.department.trim();

    try {
      setLoading(true);
      const submissionPayload: Omit<Registration, 'id' | 'createdAt'> = {
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim() || formData.fullName.trim().split(' ')[0],
        email: resolvedEmail,
        age: ageNum,
        gender: formData.gender,
        department: resolvedDepartment,
        medicalNotes: formData.medicalNotes.trim(),
        assignedTeam: null,
        status: 'confirmed'
      };

      const docId = await submitRegistration(submissionPayload);
      
      const fullRegistration: Registration = {
        ...submissionPayload,
        id: docId,
        createdAt: new Date().toISOString()
      };

      onSuccess(fullRegistration, docId);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMessage(err?.message || 'Nagkaroon ng problema sa pag-save. Pakisubukang muli.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-hidden">
      {/* Subtle Background Watermark Graphic */}
      <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-5 hidden lg:block">
        <svg width="400" height="400" viewBox="0 0 100 100" fill="none" stroke="#CE1126" strokeWidth="0.6">
          <circle cx="50" cy="50" r="45" strokeDasharray="3 3" />
          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M18 82 L82 18" />
        </svg>
      </div>

      {/* Header Banner */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl p-1.5 shadow-md border border-slate-100 flex items-center justify-center shrink-0">
            <img
              src="https://marketing.timcorp.net.ph/hubfs/Employee%20Appreciation%202026/laro%20ng%20lahi%20logo.png"
              alt="Laro ng Lahi Official Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0038A8]/10 text-[#0038A8] text-xs font-black uppercase tracking-widest mb-2">
              <span>🇵🇭</span>
              <span>Official Employee Sports Registration</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-[#0038A8] tracking-tight leading-none mb-2">
              LARO NG <span className="text-[#CE1126]">LAHI</span>
            </h1>
            <div className="h-1.5 w-28 bg-[#FFCD00] rounded-full mb-2"></div>
            <p className="text-slate-500 font-semibold uppercase tracking-[0.15em] text-xs sm:text-sm">
              2026 Employee Inter-Departmental Sports & Cultural Festival
            </p>
          </div>
        </div>

        {/* Prominent Event Schedule & Venue Keycard */}
        <div className="shrink-0 bg-gradient-to-br from-blue-50/90 via-slate-50 to-amber-50/70 p-4 sm:p-5 rounded-2xl border-2 border-blue-200/80 shadow-sm sm:min-w-[280px]">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#0038A8] mb-2.5 flex items-center justify-between gap-2 border-b border-blue-100 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Iskedyul at Lugar ng Palaro</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#0038A8] text-white text-[9px] font-black">
              2026
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Date */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0038A8] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block leading-tight">
                  Petsa (Date)
                </span>
                <span className="text-sm font-black text-slate-900 leading-tight block">
                  Oktubre 13, 2026
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none block">
                  Martes (Tuesday)
                </span>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#CE1126] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block leading-tight">
                  Oras (Time)
                </span>
                <span className="text-sm font-black text-slate-900 leading-tight block">
                  8:00 am - 5:00 pm
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none block">
                  Assembly: 7:30 AM
                </span>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-2.5 pt-1.5 border-t border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-[#00A86B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase block leading-tight">
                  Lugar (Venue)
                </span>
                <span className="text-xs font-black text-[#0038A8] leading-tight block">
                  Met Sports Park Center
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none block">
                  Pasay City, Metro Manila
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Live Registration Countdown Timer (Philippine Standard Time) */}
      <RegistrationCountdown />

      {/* Layout Grid: Left Form (7 cols) & Right Guide Panel (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left Form Container */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,56,168,0.05)] border border-slate-100">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pakitingnan ang impormasyon:</p>
                <p className="text-xs sm:text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
                Buong Pangalan (Full Name) <span className="text-[#CE1126]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Hal. Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full pl-11 pr-5 py-4 bg-slate-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm ${
                    duplicateNameAttendee ? 'border-amber-400 focus:border-amber-500 bg-amber-50/40' : 'border-slate-100 focus:border-[#0038A8]'
                  }`}
                />
              </div>
              {duplicateNameAttendee && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Naka-rehistro na ang pangalang ito:</span> Nakalista na si{' '}
                    <strong className="text-amber-950 font-black">{duplicateNameAttendee.fullName}</strong> ({duplicateNameAttendee.department || 'TIM Corp'}).
                    <span className="block mt-0.5 text-[11px] text-amber-800">Hindi na kailangang magrehistro ulit. Isa (1) lamang ang opisyal na puwang bawat kalahok.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Nickname / Palayaw */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
                Palayaw / Nickname <span className="text-slate-400 font-normal">(Player Badge)</span>
              </label>
              <input
                type="text"
                placeholder="Hal. Jun-jun / Kuya J"
                value={formData.nickname}
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm"
              />
            </div>

            {/* Employee Email Address (@timcorp.net.ph) */}
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0038A8]" />
                  <span>Opisyal na Email ng Kawani (Employee Email) <span className="text-[#CE1126]">*</span></span>
                </label>
                <span className="text-[10px] font-bold text-[#0038A8] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  @timcorp.net.ph domain
                </span>
              </div>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Hal. juan.delacruz@timcorp.net.ph"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-11 pr-5 sm:pr-36 py-4 bg-slate-50 border-2 rounded-xl focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm ${
                    duplicateEmailAttendee ? 'border-amber-400 focus:border-amber-500 bg-amber-50/40' : 'border-slate-100 focus:border-[#0038A8]'
                  }`}
                />
                <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 items-center">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/90 px-2.5 py-1.5 rounded-lg select-none">
                    @timcorp.net.ph
                  </span>
                </div>
              </div>
              {duplicateEmailAttendee ? (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Naka-rehistro na ang email na ito:</span> Nakalaan na ito kay{' '}
                    <strong className="text-amber-950 font-black">{duplicateEmailAttendee.fullName}</strong> ({duplicateEmailAttendee.department || 'TIM Corp'}).
                    <span className="block mt-0.5 text-[11px] text-amber-800">Bawal ang duplicate registration para sa iisang empleyado.</span>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#0038A8] shrink-0" />
                  <span>Kailangan ay opisyal na TIM Corp email address ang gamitin para sa rehistrasyon.</span>
                </p>
              )}
            </div>

            {/* Age & Gender (Crucial for balancing) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-widest flex items-center justify-between">
                  <span>Edad (Age) <span className="text-[#CE1126]">*</span></span>
                  <span className="text-[#0038A8] text-[10px] lowercase font-bold">para sa balance</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="16"
                    max="85"
                    required
                    placeholder="25"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full pl-11 pr-5 py-4 bg-[#FFCD00]/10 border-2 border-[#FFCD00]/50 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
                  Kasarian (Gender) <span className="text-[#CE1126]">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm cursor-pointer"
                >
                  <option value="Male">Lalaki (Male)</option>
                  <option value="Female">Babae (Female)</option>
                </select>
              </div>
            </div>

            {/* Department Dropdown */}
            <div>
              <label className="block text-[11px] font-black uppercase text-slate-400 mb-1.5 tracking-widest">
                Departamento / Unit (Pumili ng Departamento) <span className="text-[#CE1126]">*</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  required
                  value={formData.department}
                  onChange={e => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm cursor-pointer"
                >
                  <option value="" disabled>-- Pumili ng Departamento (Select Department) --</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Medical Notes / Physical Restrictions */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-[#CE1126]" />
                  <span>Medical Notes / Kalusugan <span className="text-[#CE1126]">*</span></span>
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, medicalNotes: 'N/A' })}
                  className="text-[10px] font-bold text-[#0038A8] hover:text-blue-900 bg-[#0038A8]/10 hover:bg-[#0038A8]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Pindutin ito kung walang iniindang sakit o injury"
                >
                  I-set bilang "N/A" (Walang Kondisyon)
                </button>
              </div>
              <textarea
                rows={2}
                required
                placeholder='Hal. May asthma, bawal sa matinding pagod, knee injury. Kung wala, isulat ang "N/A"'
                value={formData.medicalNotes}
                onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-[#0038A8] focus:bg-white focus:outline-none transition-colors font-medium text-slate-900 text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Kailangan para sa first aid team. Kung walang iniindang sakit o injury, isulat lamang ang <strong>"N/A"</strong>.
              </p>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || isRegistrationClosed}
                className="w-full py-5 bg-[#0038A8] text-white font-black text-base sm:text-lg rounded-xl shadow-xl shadow-blue-900/20 hover:bg-[#002d86] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 uppercase tracking-wider cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Nirerehistro sa System...</span>
                  </>
                ) : isRegistrationClosed ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-300" />
                    <span>SARADO NA ANG REHISTRASYON</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>MAG-PATALA NA</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 uppercase tracking-widest font-bold mt-3">
                {isRegistrationClosed 
                  ? 'Nagsara na ang rehistrasyon noong Setyembre 18, 2026, 7:00 PM PST'
                  : 'Agad na mai-save ang iyong data sa opisyal na listahan ng palaro'}
              </p>
            </div>
          </form>
        </div>

        {/* Right Side Panel: Gabay sa Palaro & Mahalagang Paalala (Sticky & prominent on the right) */}
        <div className="lg:col-span-5 flex flex-col space-y-6 lg:sticky lg:top-8">
          
          {/* Prominent Gabay sa Palaro Card (Featured on top right) */}
          <div className="bg-white rounded-3xl border-2 border-blue-100 shadow-[0_20px_50px_rgba(0,56,168,0.08)] p-6 sm:p-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0038A8]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0038A8] text-[#FFCD00] flex items-center justify-center shadow-md shadow-blue-900/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0038A8] block">
                    Important Participant Guide
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Gabay sa Palaro
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                Official
              </span>
            </div>

            <div className="space-y-4">
              {/* Rule 1 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
                <div className="w-7 h-7 rounded-xl bg-[#0038A8] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  1
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong className="text-slate-900 font-black block mb-0.5">Komportableng Kasuotan</strong>
                  Magsuot ng rubber shoes at komportableng athletic wear para sa mabilis at ligtas na paggalaw.
                </div>
              </div>

              {/* Rule 2 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <div className="w-7 h-7 rounded-xl bg-[#00A86B] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  2
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong className="text-slate-900 font-black block mb-0.5">Hydration & Kalusugan</strong>
                  Magdala ng sariling reusable tumbler dahil hindi magbibigay ng cups. May isang (1) hydration station na nakalaan para sa refill ng tubig.
                </div>
              </div>

              {/* Rule 3 */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <div className="w-7 h-7 rounded-xl bg-[#CE1126] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  3
                </div>
                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong className="text-slate-900 font-black block mb-0.5">Sportsmanship & Pagkakaisa</strong>
                  Sundin ang mga Game Masters at panatilihin ang diwa ng pagtutulungan at respeto sa bawat koponan.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0" />
              <span>Pakibasa bago i-click ang <strong>MAG-PATALA NA</strong>.</span>
            </div>
          </div>

          {/* Important Fair-Play Notice Box */}
          <div className="bg-[#FFCD00]/15 border-l-8 border-[#FFCD00] p-5 sm:p-6 rounded-2xl shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="w-9 h-9 bg-[#FFCD00] rounded-xl shrink-0 flex items-center justify-center font-black text-[#0038A8] text-lg shadow-sm">
                !
              </div>
              <div>
                <h3 className="font-black text-[#0038A8] uppercase tracking-wide mb-1 text-xs sm:text-sm">
                  Mahalagang Paalala sa Pag-rehistro
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Ang inyong <strong>Edad</strong>, <strong>Kasarian</strong>, at <strong>Departamento</strong> ay kinakalap para sa <strong>balanced group allocation</strong> upang masigurong patas at kapana-panabik ang laban sa lahat ng koponan!
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Official Event Venue & Interactive Google Map Section */}
      <div className="mt-12 relative z-10">
        <EventLocationMap />
      </div>
    </div>
  );
};
