import React, { useState, useEffect } from 'react';
import { Timer, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Registration deadline: September 18, 2026 at 7:00:00 PM Philippine Standard Time (UTC+8)
const DEADLINE_ISO = '2026-09-18T19:00:00+08:00';
export const REGISTRATION_DEADLINE_MS = new Date(DEADLINE_ISO).getTime();

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

function calculateTimeRemaining(): TimeRemaining {
  const now = Date.now();
  const diff = REGISTRATION_DEADLINE_MS - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalMs: 0,
    };
  }

  const seconds = Math.floor((diff / 1000) % 60);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalMs: diff,
  };
}

export const RegistrationCountdown: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTimeRemaining);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.isExpired) {
    return (
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-red-500 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest font-black text-yellow-300">
                Patalastas sa Rehistrasyon
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Sarado na ang Opisyal na Pagpapatala
              </h3>
              <p className="text-xs text-red-100 font-medium">
                Nagsara ang rehistrasyon noong Setyembre 18, 2026, 7:00 PM (Philippine Standard Time).
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-white text-red-700 font-black text-xs uppercase tracking-wider shadow-sm">
            Registration Closed
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0038A8] via-[#002776] to-[#001b52] text-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,56,168,0.18)] border border-blue-400/20 mb-8">
      {/* Decorative Fiesta Glow Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCD00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-[#CE1126]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#FFCD00] to-amber-300 text-[#0038A8] flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Timer className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFCD00]/20 text-[#FFCD00] text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFCD00] animate-ping" />
                Live Countdown
              </span>
              <span className="text-[11px] text-blue-200 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#FFCD00]" />
                Philippine Standard Time (PST)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Oras Bago Magsara ang Pagpapatala
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium">
              Huling araw ng rehistrasyon: <strong className="text-[#FFCD00]">Biyernes, Setyembre 18, 2026 • 7:00 PM</strong>
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-xs text-amber-200 font-bold">
              <span>📅 Araw ng Palaro:</span>
              <span className="text-white font-black">Oct. 13, 2026 (8:00 am - 9:00 pm)</span>
              <span>•</span>
              <span className="text-[#FFCD00]">Met Sports Park</span>
            </div>
          </div>
        </div>

        {/* Right Countdown Blocks */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
          {/* Days */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-white/15 min-w-[62px] sm:min-w-[76px] text-center shadow-inner">
            <span className="text-2xl sm:text-4xl font-black text-[#FFCD00] font-mono tracking-tight leading-none">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-200 mt-1">
              {timeLeft.days === 1 ? 'Araw' : 'Araw'}
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-white/15 min-w-[62px] sm:min-w-[76px] text-center shadow-inner">
            <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-200 mt-1">
              Oras
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-white/15 min-w-[62px] sm:min-w-[76px] text-center shadow-inner">
            <span className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-blue-200 mt-1">
              Minuto
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center bg-[#CE1126]/40 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-[#CE1126]/50 min-w-[62px] sm:min-w-[76px] text-center shadow-inner">
            <span className="text-2xl sm:text-4xl font-black text-rose-200 font-mono tracking-tight leading-none animate-pulse">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-rose-200 mt-1">
              Segundo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
