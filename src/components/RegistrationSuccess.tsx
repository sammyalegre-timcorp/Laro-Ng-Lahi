import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  UserPlus,
  ShieldCheck,
  HeartPulse,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Mail
} from 'lucide-react';
import { Registration } from '../types';

interface RegistrationSuccessProps {
  registration: Registration;
  onRegisterAnother: () => void;
}

export const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({
  registration,
  onRegisterAnother
}) => {
  useEffect(() => {
    // Fire festive fiesta confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#0038A8', '#CE1126', '#FFCD00', '#00A86B', '#0f172a']
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

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00A86B]/10 text-[#00A86B] mb-4 shadow-lg border border-[#00A86B]/20 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0038A8] tracking-tight mb-2">
          Mabuhay! Rehistrado Ka Na! 🎉
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto font-medium">
          Matagumpay na naitala ang iyong impormasyon para sa Laro ng Lahi 2026.
        </p>
      </div>

      {/* Printable Participant Pass / ID Card */}
      <div
        id="participant-badge"
        className="relative bg-white rounded-3xl border-2 border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.08)] overflow-hidden mb-8 print:border-black print:shadow-none"
      >
        {/* Top Header Strip */}
        <div className="bg-[#0038A8] text-white p-6 text-center relative">
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
            Official Participant Pass & Player ID
          </p>
        </div>

        {/* Badge Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Participant Key Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#0038A8] bg-[#0038A8]/10 px-3 py-1 rounded-full">
                Pangalan ng Kalahok
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                {registration.fullName}
              </h2>
              {registration.nickname && (
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Palayaw / Tawag: <strong className="text-[#0038A8]">"{registration.nickname}"</strong>
                </p>
              )}
              {registration.email && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-600 mt-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#0038A8] shrink-0" />
                  <span className="font-mono font-medium text-[#0038A8] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {registration.email}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center sm:text-right shrink-0 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block">Reg ID</span>
              <span className="text-xs font-mono font-bold text-slate-800 break-all">
                {registration.id?.slice(0, 10) || 'LNL-2026'}
              </span>
              <div className="mt-1 flex items-center justify-center sm:justify-end gap-1 text-[11px] text-[#00A86B] font-black">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CONFIRMED</span>
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Edad (Age)</span>
              <span className="text-lg font-black text-[#0038A8]">{registration.age} yrs</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Kasarian</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-1 block truncate">{registration.gender}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Team Status</span>
              <span className="text-xs font-bold text-[#0038A8] mt-1 block truncate">
                {registration.assignedTeam || 'Pending Allocation'}
              </span>
            </div>
          </div>

          {/* Department */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Departamento:</span>
              <span className="font-bold text-slate-800">{registration.department}</span>
            </div>
          </div>

          {/* Event Schedule & Venue Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 text-xs space-y-2.5">
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
            <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" />
                <span className="font-black text-[#0038A8]">Met Sports Park Center, Pasay City</span>
              </div>
              <a
                href="https://www.google.com/maps/place/Met+Park+Sports+Center/@14.532391,120.985929,17z/data=!3m1!4b1!4m6!3m5!1s0x3397cbf6d43d1797:0x22806ceb528b931!8m2!3d14.532391!4d120.985929!16s%2Fg%2F11b6_c8x0k"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0038A8] hover:underline"
              >
                <span>Tingnan ang Pin sa Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Medical Notes if provided */}
          {registration.medicalNotes && (
            <div className="p-3.5 rounded-2xl bg-red-50/60 border border-red-100 text-xs text-red-900">
              <div className="flex items-center gap-1.5 font-bold mb-1 text-red-700">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Medical Notes / Paalala:</span>
              </div>
              <p className="text-slate-700">{registration.medicalNotes}</p>
            </div>
          )}

          {/* Disclaimer Note Reminder */}
          <div className="text-[11px] text-slate-500 bg-[#FFCD00]/10 p-3.5 rounded-2xl border-l-4 border-[#FFCD00] font-medium">
            ℹ️ <strong>Paunawa:</strong> Ang pinal na koponan (Team Assignment) ay aayusin ng komite gamit ang balanced allocation algorithm para sa patas na palaro.
          </div>
        </div>

        {/* Bottom Card Footer */}
        <div className="bg-slate-100 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span className="font-bold tracking-wider text-slate-600">LARO NG LAHI • 2026 PASS</span>
          <span className="font-bold text-[#0038A8]">Bayanihan Spirit 🇵🇭</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 py-4 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>I-print / Save Pass</span>
        </button>

        <button
          onClick={onRegisterAnother}
          className="flex-1 py-4 px-5 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Magpatala Ulit</span>
        </button>
      </div>
    </div>
  );
};
