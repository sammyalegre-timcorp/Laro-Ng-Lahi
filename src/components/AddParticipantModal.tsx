import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  Mail,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
  HeartPulse,
  Building,
  Shirt,
  Sparkles,
  Clock,
  Save,
  Users
} from 'lucide-react';
import {
  Registration,
  Team,
  DEFAULT_TEAMS,
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  isRegistrationClosedWithConfig,
  formatDeadlineDisplay,
  formatToSurnameFirst,
  normalizeDepartmentName,
  ALL_SHIRT_SIZES
} from '../types';
import { DepartmentDropdown } from './DepartmentDropdown';
import { submitRegistration, findDuplicateRegistration } from '../firebase/registrations';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAttendee: Registration) => void;
  allRegistrations?: Registration[];
  teams?: Team[];
  eventConfig?: EventConfig;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allRegistrations = [],
  teams = DEFAULT_TEAMS,
  eventConfig = DEFAULT_EVENT_CONFIG
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    email: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female',
    department: '',
    medicalNotes: '',
    assignedTeam: '',
    shirtGenderCut: '' as 'Men' | 'Women' | '',
    shirtSize: '',
    jerseyName: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRegistrationClosed = isRegistrationClosedWithConfig(eventConfig);
  const deadlineFormat = formatDeadlineDisplay(eventConfig?.deadlineMs || DEFAULT_EVENT_CONFIG.deadlineMs);

  // Real-time duplicate warning checks
  const duplicateNameAttendee = useMemo(() => {
    const trimmed = formData.fullName.trim();
    if (!trimmed || trimmed.length < 3) return null;
    const formatted = formatToSurnameFirst(trimmed);
    const check = findDuplicateRegistration(allRegistrations, { fullName: formatted, email: '' });
    return check.isDuplicate ? check.existing : null;
  }, [formData.fullName, allRegistrations]);

  const duplicateEmailAttendee = useMemo(() => {
    const raw = formData.email.trim().toLowerCase();
    if (!raw || raw.length < 3) return null;
    const resolved = raw.includes('@') ? raw : `${raw}@timcorp.net.ph`;
    const check = findDuplicateRegistration(allRegistrations, { fullName: '', email: resolved });
    return check.isDuplicate ? check.existing : null;
  }, [formData.email, allRegistrations]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Paki-lagay ang buong pangalan ng kalahok (Full Name).');
      return;
    }

    const emailRaw = formData.email.trim().toLowerCase();
    if (!emailRaw) {
      setErrorMessage('Paki-lagay ang opisyal na email address (@timcorp.net.ph).');
      return;
    }

    let resolvedEmail = emailRaw;
    if (!resolvedEmail.includes('@')) {
      resolvedEmail = `${resolvedEmail}@timcorp.net.ph`;
    }
    if (!resolvedEmail.endsWith('@timcorp.net.ph')) {
      setErrorMessage('Kailangan pong magtapos sa @timcorp.net.ph ang opisyal na email address.');
      return;
    }

    const ageNum = parseInt(formData.age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 80) {
      setErrorMessage('Paki-lagay ang wastong edad ng kalahok (18 hanggang 80 taong gulang).');
      return;
    }

    if (!formData.department.trim()) {
      setErrorMessage('Paki-pili ang departamento ng kalahok.');
      return;
    }

    const formattedFullName = formatToSurnameFirst(formData.fullName.trim());

    // Strict duplicate check before sending
    const dupCheck = findDuplicateRegistration(allRegistrations, {
      fullName: formattedFullName,
      email: resolvedEmail
    });

    if (dupCheck.isDuplicate && dupCheck.existing) {
      const reason = dupCheck.matchedField === 'email'
        ? `ang email na "${resolvedEmail}"`
        : `ang pangalang "${formData.fullName.trim()}"`;
      setErrorMessage(
        `Bawal ang duplicate: Mayroon nang kalahok sa database na may ${reason} (${dupCheck.existing.fullName} - ${dupCheck.existing.department || 'TIM Corp'}).`
      );
      return;
    }

    try {
      setLoading(true);

      // Generate fallback nickname if blank
      const nameParts = formData.fullName.trim().split(' ').filter(Boolean);
      const fallbackNickname = nameParts.length > 0 ? nameParts[0].replace(/,/g, '') : 'Kalahok';

      const payload: Omit<Registration, 'id' | 'createdAt'> = {
        fullName: formattedFullName,
        nickname: formData.nickname.trim() || fallbackNickname,
        email: resolvedEmail,
        age: ageNum,
        gender: formData.gender,
        department: normalizeDepartmentName(formData.department),
        medicalNotes: formData.medicalNotes.trim(),
        assignedTeam: formData.assignedTeam ? formData.assignedTeam : null,
        status: 'confirmed',
        shirtGenderCut: formData.shirtGenderCut || '',
        shirtSize: formData.shirtSize || '',
        jerseyName: formData.jerseyName.trim().toUpperCase(),
        shirtUpdatedDate: formData.shirtSize ? new Date().toISOString() : ''
      };

      const docId = await submitRegistration(payload);

      const createdRegistration: Registration = {
        ...payload,
        id: docId,
        createdAt: new Date().toISOString()
      };

      onSuccess(createdRegistration);
      onClose();
    } catch (err: any) {
      console.error('Failed to add participant:', err);
      setErrorMessage(err?.message || 'Nagkaroon ng problema sa pag-save. Pakisubukang muli.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0038A8] to-slate-900 text-white p-5 sm:p-6 relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFCD00] text-[#0038A8] flex items-center justify-center font-black shadow-md shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FFCD00] text-[#0038A8] text-[10px] font-black uppercase tracking-wider">
                  Admin Exclusive
                </span>
                {isRegistrationClosed ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cutoff Override
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider">
                    Registration Active
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Magdagdag ng Bagong Kalahok
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                I-encode ang opisyal na talaan ng empleyado para sa Laro ng Lahi 2026.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Isara"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 flex-1">
          {/* Admin Override Banner */}
          <div className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 text-xs ${
            isRegistrationClosed
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : 'bg-blue-50/80 border-blue-200 text-blue-950'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isRegistrationClosed ? 'text-amber-700' : 'text-[#0038A8]'}`} />
            <div>
              <strong className="block font-black text-[11px] uppercase tracking-wider mb-0.5">
                {isRegistrationClosed ? 'Operational Cutoff Override Aktibo' : 'Opisyal na Admin Data Entry'}
              </strong>
              <p className="leading-relaxed">
                {isRegistrationClosed
                  ? `Kasalukuyang sarado na ang public registration form ng palaro (${deadlineFormat.tagalog}). Bilang Event Admin, mayroon kang awtoridad na magdagdag ng mga huling kalahok o special exemptions anumang oras.`
                  : 'Lahat ng kalahok na idaragdag dito ay agad na mapapasama sa live Firestore database, team rosters, at official export files.'}
              </p>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Pakitama ang impormasyon:</p>
                <p className="text-xs">{errorMessage}</p>
              </div>
            </div>
          )}

          <form id="admin-add-participant-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <User className="w-4 h-4" />
                <span>1. Pangunahing Impormasyon</span>
              </h3>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                  Buong Pangalan (Full Name) <span className="text-[#CE1126]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Halimbawa: Dela Cruz, Juan M. o Juan Dela Cruz"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-medium transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  💡 Awtomatikong isasaayos ng system sa opisyal na format: <strong>"Surname, First Name"</strong>.
                </p>

                {/* Duplicate Name Warning */}
                {duplicateNameAttendee && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Mayroon nang katulad na pangalan sa talaan: <strong>{duplicateNameAttendee.fullName}</strong> ({duplicateNameAttendee.department}).
                    </span>
                  </div>
                )}
              </div>

              {/* Nickname & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Palayaw (Nickname)
                  </label>
                  <input
                    type="text"
                    placeholder="Halimbawa: Juan / Johnny"
                    value={formData.nickname}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Opisyal na Email (@timcorp.net.ph) <span className="text-[#CE1126]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="username o username@timcorp.net.ph"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  {/* Duplicate Email Warning */}
                  {duplicateEmailAttendee && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Naka-rehistro na ang email na ito kay <strong>{duplicateEmailAttendee.fullName}</strong>.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Age & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Edad (Age) <span className="text-[#CE1126]">*</span>
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={80}
                    required
                    placeholder="Halimbawa: 28"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Kasarian (Gender) <span className="text-[#CE1126]">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'Male' })}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                        formData.gender === 'Male'
                          ? 'border-[#0038A8] bg-blue-50 text-[#0038A8]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>👦 Lalaki (Male)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'Female' })}
                      className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
                        formData.gender === 'Female'
                          ? 'border-[#CE1126] bg-red-50 text-[#CE1126]'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>👩 Babae (Female)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                  Departamento (Department) <span className="text-[#CE1126]">*</span>
                </label>
                <DepartmentDropdown
                  value={formData.department}
                  onChange={dept => setFormData({ ...formData, department: dept })}
                  required
                />
              </div>
            </div>

            {/* Section 2: Team Assignment (Admin Power) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Users className="w-4 h-4" />
                <span>2. Pagtatalaga sa Koponan (Team Assignment)</span>
              </h3>

              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                  Koponan / Team
                </label>
                <select
                  value={formData.assignedTeam}
                  onChange={e => setFormData({ ...formData, assignedTeam: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">-- Walang Team (Unassigned - Para sa Smart Team Balancer) --</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.name}>
                      {t.iconName ? `${t.iconName} ` : ''}{t.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Maaari mong agad na italaga sa partikular na koponan, o iwanang unassigned upang maipamahagi ng Smart Team Balancer.
                </p>
              </div>
            </div>

            {/* Section 3: Jersey / T-Shirt Specifications (Admin Entry) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5">
                  <Shirt className="w-4 h-4" />
                  <span>3. Sukat ng T-Shirt at Jersey Name (Opsiyonal)</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Maaari ding i-encode ng kalahok sa /tshirt
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender Cut */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Tabas ng Damit (Gender Cut)
                  </label>
                  <select
                    value={formData.shirtGenderCut}
                    onChange={e => setFormData({ ...formData, shirtGenderCut: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Hindi Pa Napipili (Wala pa) --</option>
                    <option value="Men">Sukat Pang-Lalaki (Men's Fit)</option>
                    <option value="Women">Sukat Pang-Babae (Women's Fit)</option>
                  </select>
                </div>

                {/* Shirt Size */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                    Sukat (Size)
                  </label>
                  <select
                    value={formData.shirtSize}
                    onChange={e => setFormData({ ...formData, shirtSize: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- Hindi Pa Napipili (Pending) --</option>
                    {ALL_SHIRT_SIZES.map(sz => (
                      <option key={sz} value={sz}>{sz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jersey Name (Back Print) */}
              <div>
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide mb-1.5">
                  Jersey Name (Tatak sa Likod)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="Halimbawa: DELA CRUZ (Hanggang 16 characters)"
                    value={formData.jerseyName}
                    onChange={e => setFormData({ ...formData, jerseyName: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-black tracking-wider uppercase transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    {formData.jerseyName.length}/16
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pangalan o palayaw na itatatak sa likod ng jersey (walang numero).
                </p>
              </div>
            </div>

            {/* Section 4: Health & Medical Notes */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <HeartPulse className="w-4 h-4 text-[#CE1126]" />
                <span>4. Kalusugan & Medical Notes (Opsiyonal)</span>
              </h3>

              <div>
                <textarea
                  rows={2}
                  placeholder="Halimbawa: Asthma, allergy sa hipon, hypertension, o 'Wala'"
                  value={formData.medicalNotes}
                  onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-medium transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Para sa agarang paghahanda ng medic at first aid team sa araw ng palaro.
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
          >
            Kanselahin
          </button>

          <button
            type="submit"
            form="admin-add-participant-form"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0038A8] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white text-xs font-black uppercase tracking-widest shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Inililista sa System...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 text-[#FFCD00]" />
                <span>I-save ang Kalahok (Admin Save)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
