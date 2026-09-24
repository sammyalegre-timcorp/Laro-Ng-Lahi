import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Ruler,
  Home,
  LogOut,
  Lock,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Mail,
  Shirt,
  Sparkles,
  X,
  Eye,
  ZoomIn,
  Info
} from 'lucide-react';
import { Registration, Team, ShirtMeasurement, normalizeDepartmentName, formatToSurnameFirst } from '../types';
import jerseyMeasurementGuideImg from '../assets/images/jersey_measurement_1790236031117.jpg';

interface JerseySelectionSuccessProps {
  attendee: Registration;
  assignedTeamObj?: Team;
  teamBadgeStyle?: React.CSSProperties | null;
  selectedCut: 'Men' | 'Women';
  selectedSize: string;
  jerseyName?: string;
  measurement?: ShirtMeasurement;
  showModal?: boolean;
  onCloseModal?: () => void;
  onViewChart: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const JerseySelectionSuccess: React.FC<JerseySelectionSuccessProps> = ({
  attendee,
  assignedTeamObj,
  teamBadgeStyle,
  selectedCut,
  selectedSize,
  jerseyName,
  measurement,
  showModal = false,
  onCloseModal,
  onViewChart,
  onNavigate,
  onLogout
}) => {
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  useEffect(() => {
    // Fire festive fiesta confetti upon entering the jersey finish page
    const count = 180;
    const defaults = {
      origin: { y: 0.65 },
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
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const isWomenCut = selectedCut === 'Women';
  const effectiveJerseyName = (attendee.jerseyName || jerseyName || '').trim().toUpperCase();

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10 animate-in fade-in duration-300">
      {/* Success Celebration Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00A86B]/10 text-[#00A86B] mb-3 shadow-lg border border-[#00A86B]/20 animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Opisyal Nang Naitala ang Sukat!</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0038A8] tracking-tight mb-1.5">
          Mabuhay! Handa Na ang Iyong Jersey! 🎽
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium leading-relaxed">
          Matagumpay na naipasa ang iyong napiling sukat para sa <strong className="text-slate-900">Laro ng Lahi 2026</strong>. Naka-lock na ito para sa pagpapatahi.
        </p>
      </div>

      {/* Printable Official Jersey Selection Pass / ID Card */}
      <div
        id="jersey-pass"
        className="relative bg-white rounded-3xl border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.08)] overflow-hidden mb-6 print:border-black print:shadow-none"
      >
        {/* Top Header Strip */}
        <div className="bg-[#0038A8] text-white p-5 sm:p-6 text-center relative">
          <div className="h-1.5 w-full bg-[#CE1126] absolute top-0 left-0"></div>
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white rounded-xl p-0.5 shadow-sm flex items-center justify-center shrink-0">
              <img
                src="https://marketing.timcorp.net.ph/hubfs/Employee%20Appreciation%202026/laro%20ng%20lahi%20logo.png"
                alt="Laro ng Lahi Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              LARO NG <span className="text-[#FFCD00]">LAHI</span>
            </span>
          </div>
          <p className="text-[11px] text-blue-200 font-bold tracking-widest uppercase">
            Official Jersey Selection Pass & Sizing ID
          </p>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-7 space-y-5">
          {/* Participant Key Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0038A8] bg-[#0038A8]/10 px-3 py-1 rounded-full">
                Kalahok (Participant)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {formatToSurnameFirst(attendee.fullName)}
              </h2>
              {attendee.nickname && (
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Palayaw / Tawag: <strong className="text-[#0038A8]">"{attendee.nickname}"</strong>
                </p>
              )}
              {attendee.email && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 mt-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0038A8] shrink-0" />
                  <span className="font-mono font-medium text-[#0038A8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-[11px]">
                    {attendee.email}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center sm:text-right shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Reg ID</span>
              <span className="text-xs font-mono font-bold text-slate-800 break-all">
                {attendee.id?.slice(0, 10) || 'LNL-2026'}
              </span>
              <div className="mt-1 flex items-center justify-center sm:justify-end gap-1 text-[10px] text-[#00A86B] font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CONFIRMED & LOCKED</span>
              </div>
            </div>
          </div>

          {/* Team & Department Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Koponan (Team)
              </span>
              {assignedTeamObj && teamBadgeStyle ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border"
                  style={teamBadgeStyle}
                >
                  {assignedTeamObj.logoUrl ? (
                    <img
                      src={assignedTeamObj.logoUrl}
                      alt=""
                      className="w-4 h-4 object-contain rounded-full shrink-0"
                    />
                  ) : (
                    <span>{assignedTeamObj.iconName || '🏆'}</span>
                  )}
                  <span>{assignedTeamObj.name}</span>
                </span>
              ) : (
                <span className="text-xs font-bold text-[#0038A8]">
                  {attendee.assignedTeam || 'Pending Team Allocation'}
                </span>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                Departamento / Unit
              </span>
              <span className="text-xs font-bold text-slate-800 block truncate">
                {normalizeDepartmentName(attendee.department)}
              </span>
            </div>
          </div>

          {/* Official Jersey Selection Highlight Box */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 ${
            isWomenCut
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : 'bg-blue-50/70 border-blue-200 text-blue-950'
          }`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                  isWomenCut ? 'bg-[#CE1126]' : 'bg-[#0038A8]'
                }`}>
                  <Shirt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Opisyal na Sukat ng Jersey
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {isWomenCut ? 'Pang-Babae 👚' : 'Pang-Lalaki 👔'}
                  </span>
                </div>
              </div>

              {/* Big Size Badge */}
              <div className={`px-4 py-1.5 rounded-xl text-white font-black text-base shadow-sm ${
                isWomenCut ? 'bg-[#CE1126]' : 'bg-[#0038A8]'
              }`}>
                Sukat: {selectedSize}
              </div>
            </div>

            {/* Official Jersey Name / Back Print Highlight */}
            {effectiveJerseyName && (
              <div className="my-3 p-3.5 rounded-xl bg-white/90 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                    🎽
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                      Pangalan sa Likod ng Jersey (Back Print)
                    </span>
                    <span className="font-mono font-black text-slate-900 text-sm tracking-wider uppercase">
                      "{effectiveJerseyName}"
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold tracking-widest uppercase">
                  Back Shoulder Print
                </div>
              </div>
            )}

            {/* Mini Visual Jersey Back Graphic (no number) */}
            <div className="my-3 p-4 rounded-xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-inner flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126]" />
              <div className="w-10 h-3 rounded-b-full bg-slate-950/80 border-b border-white/20 mb-2.5" />
              <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase mb-1.5">
                {assignedTeamObj ? assignedTeamObj.name : 'TIM LARO NG LAHI'}
              </span>
              <div className="font-mono font-black text-base sm:text-lg tracking-widest text-[#FFCD00] uppercase px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 shadow-xs max-w-full truncate my-1">
                {effectiveJerseyName || 'OFFICIAL JERSEY'}
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono mt-2 pt-2 border-t border-white/10 w-full text-center">
                PASAY 2026 • {selectedSize} ({isWomenCut ? "Women's" : "Men's"})
              </span>
            </div>

            {/* Measurement Specifications Grid */}
            {measurement ? (
              <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-slate-200/60">
                <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Haba (Length)</span>
                  <span className="font-black text-slate-900 text-xs sm:text-sm">{measurement.length}"</span>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Lapad Paikot</span>
                  <span className={`font-black text-xs sm:text-sm ${isWomenCut ? 'text-rose-700' : 'text-blue-700'}`}>
                    {measurement.widthPaikot}"
                  </span>
                </div>
                <div className="bg-white/90 p-2 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Flat Width</span>
                  <span className="font-bold text-slate-700 text-xs sm:text-sm">{measurement.flatWidth}"</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600 text-center font-medium mt-1">
                Sukat: <strong>{selectedSize}</strong> ({isWomenCut ? 'Pang-Babae' : 'Pang-Lalaki'})
              </p>
            )}

            {/* Quick Button to View Jersey Measurement Diagram */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMeasurementModal(true)}
                className="text-[11px] font-bold text-[#0038A8] hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1 rounded-xl border border-blue-200/60 shadow-2xs"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Silipin ang Gabay sa Pagsukat (Jersey Diagram)</span>
              </button>
            </div>

            {attendee.shirtUpdatedDate && (
              <p className="text-[10px] text-slate-500 text-center mt-2 font-medium">
                Petsa ng Pagpili: {new Date(attendee.shirtUpdatedDate).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>

          {/* Official Lock Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong className="font-bold text-amber-950">Naka-lock ang Sukat:</strong> Ang iyong napiling sukat ay opisyal nang nai-lock upang masimulan ang pagpapatahi ng jersey para sa palaro. Kung kinakailangang palitan, makipag-ugnayan lamang sa inyong <strong>Sportsfest Admin</strong>.
            </div>
          </div>

          {/* Event Schedule & Venue Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 text-xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#0038A8] block">
              Iskedyul at Lugar ng Palaro
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0038A8] shrink-0" />
                <div>
                  <span className="font-black text-slate-900 block">Oktubre 13, 2026</span>
                  <span className="text-[10px] text-slate-500">Martes (Tuesday)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#CE1126] shrink-0" />
                <div>
                  <span className="font-black text-slate-900 block">8:00 am - 5:00 pm</span>
                  <span className="text-[10px] text-slate-500">Assembly: 7:30 AM</span>
                </div>
              </div>
            </div>
            <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                <span className="font-black text-[#0038A8] text-[11px]">Met Sports Park Center, Pasay City</span>
              </div>
              <a
                href="https://www.google.com/maps/place/Met+Park+Sports+Center/@14.532391,120.985929,17z/data=!3m1!4b1!4m6!3m5!1s0x3397cbf6d43d1797:0x22806ceb528b931!8m2!3d14.532391!4d120.985929!16s%2Fg%2F11b6_c8x0k"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0038A8] hover:underline"
              >
                <span>Tingnan sa Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="font-bold tracking-wider text-slate-600 text-[11px]">LARO NG LAHI • 2026 OFFICIAL JERSEY PASS</span>
          <span className="font-bold text-[#0038A8] text-[11px]">Bayanihan Spirit 🇵🇭</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 print:hidden">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>I-print / Save Katibayan</span>
          </button>

          <button
            type="button"
            onClick={onViewChart}
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#0038A8] hover:bg-blue-800 text-white font-black text-xs uppercase tracking-widest shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Ruler className="w-4 h-4" />
            <span>Suriin ang Size Chart</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Bumalik sa Home / Registration</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Mag-logout / Ibang Kalahok</span>
          </button>
        </div>
      </div>

      {/* Pop-up Celebration Modal on Save */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 max-w-md w-full p-6 sm:p-7 text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top accent badge */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#0038A8] via-[#FFCD00] to-[#CE1126]" />

            {onCloseModal && (
              <button
                type="button"
                onClick={onCloseModal}
                className="absolute top-3.5 right-3.5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Big Success Icon */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-3 ring-6 ring-emerald-50">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider mb-1.5">
              Opisyal na Naitala!
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Matagumpay ang Pagpili ng Sukat!
            </h3>

            <p className="text-xs text-slate-600 mt-1.5 font-medium">
              Salamat, <strong className="text-slate-900">{attendee.fullName}</strong>! Opisyal nang naipasa ang sukat ng iyong jersey para sa <span className="font-bold text-[#0038A8]">Laro ng Lahi 2026</span>.
            </p>

            {/* Official Jersey Selection Summary Card */}
            <div className="my-4 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200 text-left text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kalahok:</span>
                <span className="text-xs font-black text-slate-900">{attendee.fullName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Departamento:</span>
                <span className="text-xs font-bold text-slate-800">{attendee.department}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Koponan:</span>
                <span className="text-xs font-black text-[#0038A8]">{attendee.assignedTeam || 'Pending Allocation'}</span>
              </div>
              {effectiveJerseyName && (
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Jersey Name (Back Print):</span>
                  <span className="font-mono font-black text-xs text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    "{effectiveJerseyName}"
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Sukat ng Jersey:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0038A8] text-white font-black text-xs">
                    {isWomenCut ? 'Pang-Babae 👚' : 'Pang-Lalaki 👔'} • {selectedSize}
                  </span>
                </div>
              </div>
            </div>

            {/* Lock Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-left flex items-start gap-2 mb-4">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium leading-normal">
                <strong>Naka-lock:</strong> Naka-save na ito para sa pagpapatahi. Kung may nais baguhin, makipag-ugnayan sa inyong <strong>Admin</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={onCloseModal}
              className="w-full py-3 px-4 rounded-xl bg-[#0038A8] hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
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
                    Sukat mula sa pinakamataas na punto ng balikat (sa tabi ng kuwelyo) diretso pababa hanggang sa laylayan ng damit.
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
                    Ang iyong napiling sukat ay <strong>{selectedSize} ({isWomenCut ? "Women's Fit" : "Men's Fit"})</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMeasurementModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#0038A8] hover:bg-blue-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-all self-end sm:self-auto"
                >
                  Isara ang Gabay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
