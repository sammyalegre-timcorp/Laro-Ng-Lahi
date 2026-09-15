import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GameMasterAssignment } from '../types';
import { subscribeToGameMasters } from '../firebase/gameMasters';
import {
  VENUE_COURTS,
  DEFAULT_EVENT_GAMES,
  CourtInfo,
  CourtGameStatus,
  formatMinutesTo12Hour,
  getCourtsStatusAtTime,
  parseTimeRangeToMinutes
} from '../utils/floorPlanUtils';

interface InteractiveFloorPlanProps {
  initialMinutes?: number; // default 810 (1:30 PM)
  onNavigateToSchedule?: () => void;
  compact?: boolean;
}

export const InteractiveFloorPlan: React.FC<InteractiveFloorPlanProps> = ({
  initialMinutes = 810, // 1:30 PM
  onNavigateToSchedule,
  compact = false
}) => {
  // Current time in minutes from midnight (1:30 PM = 810)
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialMinutes);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [entries, setEntries] = useState<GameMasterAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredCourtId, setHoveredCourtId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [timeInputVal, setTimeInputVal] = useState<string>('13:30');

  const animationTimerRef = useRef<any>(null);

  // Subscribe to live Firestore games
  useEffect(() => {
    const unsubscribe = subscribeToGameMasters(
      (data) => {
        if (data && data.length > 0) {
          setEntries(data);
        } else {
          // Fallback to default schedule so user immediately sees games
          setEntries(DEFAULT_EVENT_GAMES);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching game assignments:', err);
        setEntries(DEFAULT_EVENT_GAMES);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Compute status of all 6 courts at selected time
  const courtsStatus = useMemo(() => {
    const gamesList = entries.length > 0 ? entries : DEFAULT_EVENT_GAMES;
    return getCourtsStatusAtTime(gamesList, selectedMinutes);
  }, [entries, selectedMinutes]);

  // Count active vs idle courts
  const activeCount = useMemo(() => {
    return (Object.values(courtsStatus) as CourtGameStatus[]).filter(
      (c) => c.activeGame !== null
    ).length;
  }, [courtsStatus]);

  // Animation player effect (plays through the day: 7:30 AM to 5:30 PM)
  useEffect(() => {
    if (isPlaying) {
      animationTimerRef.current = setInterval(() => {
        setSelectedMinutes((prev) => {
          // 07:30 AM is 450 min, 05:30 PM is 1050 min
          if (prev >= 1050) {
            setIsPlaying(false);
            return 480; // reset to 8:00 AM
          }
          return prev + 10; // advance 10 minutes every tick
        });
      }, 700);
    } else {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    }
    return () => {
      if (animationTimerRef.current) clearInterval(animationTimerRef.current);
    };
  }, [isPlaying]);

  // Sync time input value when selectedMinutes changes
  useEffect(() => {
    const hours = Math.floor(selectedMinutes / 60);
    const mins = selectedMinutes % 60;
    setTimeInputVal(
      `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    );
  }, [selectedMinutes]);

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setSelectedMinutes(parseInt(e.target.value, 10));
  };

  const handleCustomTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setTimeInputVal(e.target.value);
    const parts = e.target.value.split(':');
    if (parts.length === 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        setSelectedMinutes(h * 60 + m);
      }
    }
  };

  const handleSetCurrentClockTime = () => {
    setIsPlaying(false);
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    // Clamp to event window 7:30 AM - 5:30 PM or set exactly
    setSelectedMinutes(mins);
  };

  // Quick preset buttons
  const timePresets = [
    { label: '8:30 AM', minutes: 510, desc: 'Opening Games' },
    { label: '9:30 AM', minutes: 570, desc: 'Morning Rounds' },
    { label: '10:30 AM', minutes: 630, desc: 'Pre-Lunch Clash' },
    { label: '12:00 PM', minutes: 720, desc: 'Lunch Break' },
    { label: '1:30 PM', minutes: 810, desc: 'Afternoon Heat (Halimbawa)', isExample: true },
    { label: '2:30 PM', minutes: 870, desc: 'Semi-Finals' },
    { label: '4:00 PM', minutes: 960, desc: 'Championship' }
  ];

  const selectedCourtDetails = selectedCourtId ? courtsStatus[selectedCourtId] : null;

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200/90 shadow-[0_20px_50px_rgba(0,56,168,0.08)] overflow-hidden">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#0038A8] via-[#002b80] to-[#001f5c] text-white p-5 sm:p-6 relative overflow-hidden">
        {/* Glow accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCD00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-12 w-40 h-40 bg-[#CE1126]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFCD00] text-[#0038A8] flex items-center justify-center shrink-0 shadow-md font-black">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCD00] block">
                  Met Sports Park Center • Live Venue Floor Plan
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  6 Courts Interactive
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>Iskedyul ng mga Laro sa Floor Plan</span>
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                Piliin ang oras (hal. 1:30 PM) upang makita kung aling mga laro ang kasalukuyang nagaganap sa bawat court.
              </p>
            </div>
          </div>

          {/* Time Display & Active Courts Pill */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto bg-black/30 backdrop-blur-md p-2.5 rounded-2xl border border-white/15">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
              <Clock className="w-4 h-4 text-[#FFCD00] animate-spin-slow" />
              <div className="text-left">
                <span className="text-[9px] uppercase tracking-wider text-slate-300 block font-bold">
                  Napiling Oras
                </span>
                <span className="text-base sm:text-lg font-black text-[#FFCD00] tracking-wide">
                  {formatMinutesTo12Hour(selectedMinutes)}
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-center">
              <span className="text-[9px] uppercase tracking-wider text-slate-300 block font-bold">
                Kondisyon
              </span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {activeCount} / 6 Courts May Laro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Time Controls Strip */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 space-y-3.5">
        {/* Row 1: Quick Preset Buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-700">
            <Clock className="w-3.5 h-3.5 text-[#0038A8]" />
            <span>Mabilisang Oras (Presets):</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {timePresets.map((preset) => {
              const isActive = Math.abs(selectedMinutes - preset.minutes) < 10;
              return (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedMinutes(preset.minutes);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#0038A8] text-white shadow-md shadow-blue-900/20 scale-105 ring-2 ring-blue-400/40'
                      : preset.isExample
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title={`${preset.desc} (${preset.label})`}
                >
                  {preset.isExample && <Sparkles className="w-3 h-3 text-amber-600" />}
                  <span>{preset.label}</span>
                  {preset.isExample && (
                    <span className="px-1 py-0.2 rounded bg-amber-500 text-white text-[9px] uppercase font-black">
                      Halimbawa
                    </span>
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={handleSetCurrentClockTime}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold transition-colors cursor-pointer"
              title="Gamitin ang kasalukuyang oras ng orasan"
            >
              Oras Ngayon
            </button>
          </div>
        </div>

        {/* Row 2: Continuous Timeline Slider & Playback Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs shrink-0 ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#0038A8] hover:bg-blue-900 text-white'
            }`}
            title={isPlaying ? 'I-pause ang timeline' : 'I-play ang buong araw na iskedyul'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>I-pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>I-play ang Timeline</span>
              </>
            )}
          </button>

          {/* Time Slider */}
          <div className="flex-1 flex flex-col justify-center px-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>07:30 AM (Assembly)</span>
              <span className="font-black text-[#0038A8] text-xs">
                {formatMinutesTo12Hour(selectedMinutes)}
              </span>
              <span>05:30 PM (Pack-up)</span>
            </div>
            <input
              type="range"
              min={450} // 7:30 AM
              max={1050} // 5:30 PM
              step={5}
              value={selectedMinutes}
              onChange={handleTimeSliderChange}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0038A8]"
            />
          </div>

          {/* Direct Time Input */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <input
              type="time"
              value={timeInputVal}
              onChange={handleCustomTimeInput}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0038A8]"
              title="Maglagay ng tiyak na oras"
            />
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setSelectedMinutes(810); // Reset to 1:30 PM
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="I-reset sa 1:30 PM"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Floor Plan Area */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Interactive Floor Plan SVG Frame */}
        <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-300 bg-[#f8fafc] shadow-inner select-none">
          {/* Blueprint Background Grid & Legend bar */}
          <div className="absolute top-2.5 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span className="text-[11px] font-black text-slate-800">
                MET SPORTS PARK CENTER FLOOR PLAN
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">• Pasay City</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs text-[10px] font-bold text-slate-600 pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kasalukuyang Naglalaro (Live)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Bakante / Break</span>
              </div>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 1000 620"
              className="w-full h-auto min-w-[720px] max-w-full block font-sans"
              style={{ maxHeight: compact ? '480px' : '650px' }}
            >
              <defs>
                {/* Subtle CAD Hatch Pattern for walls */}
                <pattern id="cadHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#cbd5e1" strokeWidth="1" />
                </pattern>

                {/* Basketball wood/court gradient */}
                <linearGradient id="basketballGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>

                {/* Badminton court gradient */}
                <linearGradient id="badmintonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>

                {/* Active Live Glowing Court Gradient */}
                <linearGradient id="activeCourtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>

                {/* Lobby Gradient (Magenta/Berry matching blueprint) */}
                <linearGradient id="lobbyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#be185d" />
                  <stop offset="100%" stopColor="#9d174d" />
                </linearGradient>

                {/* Drop shadow for active cards */}
                <filter id="courtGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#059669" floodOpacity="0.35" />
                </filter>
              </defs>

              {/* Background Canvas */}
              <rect x="0" y="0" width="1000" height="620" fill="#f8fafc" />

              {/* Architectural Grid Lines */}
              <g stroke="#e2e8f0" strokeWidth="0.75" strokeDasharray="3,3">
                <line x1="40" y1="120" x2="940" y2="120" />
                <line x1="40" y1="260" x2="940" y2="260" />
                <line x1="40" y1="495" x2="940" y2="495" />
                <line x1="140" y1="20" x2="140" y2="590" />
                <line x1="360" y1="20" x2="360" y2="590" />
                <line x1="720" y1="20" x2="720" y2="590" />
              </g>

              {/* Surrounding Roads Labels */}
              {/* Left: Roxas Blvd */}
              <g transform="translate(18, 310) rotate(-90)">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="18"
                  fontWeight="900"
                  letterSpacing="4"
                >
                  ROXAS BLVD
                </text>
                <line x1="-120" y1="8" x2="120" y2="8" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4" />
              </g>

              {/* Right: Metrobank Ave */}
              <g transform="translate(982, 310) rotate(90)">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="18"
                  fontWeight="900"
                  letterSpacing="4"
                >
                  METROBANK AVE
                </text>
                <line x1="-120" y1="8" x2="120" y2="8" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4" />
              </g>

              {/* Outer Building Structural Walls */}
              <rect
                x="45"
                y="20"
                width="895"
                height="570"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
                rx="4"
              />

              {/* Top Facilities Row */}
              {/* Secondary Lobby (Top-Left, Magenta polygon) */}
              <polygon
                points="45,20 150,20 165,115 45,115"
                fill="url(#lobbyGrad)"
                stroke="#831843"
                strokeWidth="2"
              />
              <text x="95" y="65" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900">
                SECONDARY
              </text>
              <text x="95" y="80" textAnchor="middle" fill="#fbcfe8" fontSize="10" fontWeight="700">
                LOBBY
              </text>

              {/* Convenience Store */}
              <rect x="175" y="25" width="180" height="90" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <text x="265" y="65" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="800">
                CONVENIENCE STORE
              </text>
              <text x="265" y="78" textAnchor="middle" fill="#94a3b8" fontSize="9">
                129 SQM • TENANTED
              </text>

              {/* Fire Exit */}
              <rect x="365" y="25" width="40" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x="385" y="65" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="800">
                FIRE EXIT
              </text>

              {/* Tenanted Space 120 SQM */}
              <rect x="415" y="25" width="200" height="90" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <text x="515" y="65" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="800">
                COMMERCIAL SPACE
              </text>
              <text x="515" y="78" textAnchor="middle" fill="#94a3b8" fontSize="9">
                120 SQM
              </text>

              {/* Kitchen Storage */}
              <rect x="625" y="25" width="95" height="90" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x="672" y="65" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">
                KITCHEN / STORAGE
              </text>

              {/* Sports Bar / Retail (319 SQM) on the upper right */}
              <rect x="730" y="25" width="200" height="235" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
              <text x="830" y="130" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="900">
                SPORTS BAR & RETAIL
              </text>
              <text x="830" y="146" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
                319 SQM
              </text>

              {/* Main Lobby (Bottom-Right, Magenta Rectangle) */}
              <rect
                x="720"
                y="340"
                width="145"
                height="105"
                fill="url(#lobbyGrad)"
                stroke="#831843"
                strokeWidth="2"
                rx="4"
              />
              <text x="792" y="388" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="900">
                MAIN LOBBY
              </text>
              <text x="792" y="405" textAnchor="middle" fill="#fbcfe8" fontSize="10" fontWeight="700">
                Primary Entrance & Registration
              </text>

              {/* Admin / Clinic */}
              <rect x="730" y="455" width="115" height="60" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <text x="787" y="485" textAnchor="middle" fill="#475569" fontSize="9" fontWeight="800">
                ADMIN / CLINIC
              </text>
              <text x="787" y="497" textAnchor="middle" fill="#94a3b8" fontSize="8">
                53 SQM
              </text>

              {/* Back of House */}
              <rect x="730" y="525" width="115" height="55" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <text x="787" y="555" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">
                BACK OF HOUSE
              </text>

              {/* Bottom Tenanted Space */}
              <rect x="130" y="495" width="195" height="85" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" />
              <text x="227" y="540" textAnchor="middle" fill="#475569" fontSize="10" fontWeight="800">
                TENANTED SPACE
              </text>
              <text x="227" y="553" textAnchor="middle" fill="#94a3b8" fontSize="9">
                183 SQM
              </text>

              {/* Restrooms, Lockers, Showers */}
              <rect x="335" y="495" width="375" height="85" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
              <g stroke="#cbd5e1" strokeWidth="1">
                <line x1="430" y1="495" x2="430" y2="580" />
                <line x1="525" y1="495" x2="525" y2="580" />
                <line x1="620" y1="495" x2="620" y2="580" />
              </g>
              <text x="382" y="540" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">
                MALE LOCKERS
              </text>
              <text x="477" y="540" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">
                FEMALE LOCKERS
              </text>
              <text x="572" y="540" textAnchor="middle" fill="#64748b" fontSize="9" fontWeight="800">
                RESTROOMS
              </text>
              <text x="667" y="540" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="800">
                FIRE EXIT / PUMP
              </text>

              {/* Open Alley Banner along bottom */}
              <rect x="45" y="580" width="895" height="10" fill="#e2e8f0" />
              <text x="492" y="588" textAnchor="middle" fill="#64748b" fontSize="7" fontWeight="bold">
                OPEN ALLEY / EMERGENCY PASSAGEWAY
              </text>

              {/* Bleachers / Pathwalk Annotations */}
              <text x="430" y="260" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="2">
                BLEACHER / PATHWALK
              </text>
              <g transform="translate(100, 380) rotate(-90)">
                <text x="0" y="0" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold" letterSpacing="2">
                  BLEACHER / PATHWALK
                </text>
              </g>

              {/* ============================================================ */}
              {/* THE 6 COURTS RENDERING WITH LIVE INTERACTION                 */}
              {/* ============================================================ */}
              {VENUE_COURTS.map((court) => {
                const status = courtsStatus[court.id];
                const isLive = status?.activeGame !== null;
                const isSelected = selectedCourtId === court.id;
                const isHovered = hoveredCourtId === court.id;

                const baseFill = isLive ? 'url(#activeCourtGrad)' : 'url(#badmintonGrad)';
                const strokeColor = isSelected
                  ? '#FFCD00'
                  : isLive
                  ? '#22c55e'
                  : isHovered
                  ? '#0038A8'
                  : '#ffffff';
                const strokeWidth = isSelected ? 4 : isLive ? 3 : 1.5;

                return (
                  <g
                    key={court.id}
                    id={`court-svg-${court.id}`}
                    className="cursor-pointer transition-all duration-300 group"
                    onClick={() =>
                      setSelectedCourtId(selectedCourtId === court.id ? null : court.id)
                    }
                    onMouseEnter={() => setHoveredCourtId(court.id)}
                    onMouseLeave={() => setHoveredCourtId(null)}
                  >
                    {/* Outer Court Boundary */}
                    <rect
                      x={court.x}
                      y={court.y}
                      width={court.width}
                      height={court.height}
                      fill={baseFill}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      rx={6}
                      filter={isLive || isSelected ? 'url(#courtGlow)' : undefined}
                    />

                    {/* Internal Court Markings depending on type & orientation */}
                    {court.type === 'badminton' ? (
                      court.orientation === 'horizontal' ? (
                        /* Horizontal Badminton Court Lines */
                        <g stroke="#ffffff" strokeWidth="1" opacity="0.65">
                          {/* Inner singles sideline */}
                          <line x1={court.x + 8} y1={court.y + 7} x2={court.x + court.width - 8} y2={court.y + 7} />
                          <line x1={court.x + 8} y1={court.y + court.height - 7} x2={court.x + court.width - 8} y2={court.y + court.height - 7} />
                          {/* Doubles back service lines */}
                          <line x1={court.x + 15} y1={court.y + 7} x2={court.x + 15} y2={court.y + court.height - 7} />
                          <line x1={court.x + court.width - 15} y1={court.y + 7} x2={court.x + court.width - 15} y2={court.y + court.height - 7} />
                          {/* Center net line */}
                          <line
                            x1={court.x + court.width / 2}
                            y1={court.y}
                            x2={court.x + court.width / 2}
                            y2={court.y + court.height}
                            strokeWidth="2"
                            stroke="#ffffff"
                          />
                          {/* Short service lines */}
                          <line
                            x1={court.x + court.width / 2 - 25}
                            y1={court.y + 7}
                            x2={court.x + court.width / 2 - 25}
                            y2={court.y + court.height - 7}
                          />
                          <line
                            x1={court.x + court.width / 2 + 25}
                            y1={court.y + 7}
                            x2={court.x + court.width / 2 + 25}
                            y2={court.y + court.height - 7}
                          />
                        </g>
                      ) : (
                        /* Vertical Badminton Court Lines */
                        <g stroke="#ffffff" strokeWidth="1" opacity="0.65">
                          {/* Inner singles sideline */}
                          <line x1={court.x + 6} y1={court.y + 10} x2={court.x + 6} y2={court.y + court.height - 10} />
                          <line x1={court.x + court.width - 6} y1={court.y + 10} x2={court.x + court.width - 6} y2={court.y + court.height - 10} />
                          {/* Doubles back service line */}
                          <line x1={court.x + 6} y1={court.y + 18} x2={court.x + court.width - 6} y2={court.y + 18} />
                          <line x1={court.x + 6} y1={court.y + court.height - 18} x2={court.x + court.width - 6} y2={court.y + court.height - 18} />
                          {/* Center net line */}
                          <line
                            x1={court.x}
                            y1={court.y + court.height / 2}
                            x2={court.x + court.width}
                            y2={court.y + court.height / 2}
                            strokeWidth="2"
                            stroke="#ffffff"
                          />
                        </g>
                      )
                    ) : (
                      /* Basketball / Volleyball Arena Court Lines */
                      <g stroke="#ffffff" strokeWidth="1.5" opacity="0.75">
                        {/* Half court line */}
                        <line
                          x1={court.x + court.width / 2}
                          y1={court.y}
                          x2={court.x + court.width / 2}
                          y2={court.y + court.height}
                          strokeWidth="2"
                        />
                        {/* Center circle */}
                        <circle
                          cx={court.x + court.width / 2}
                          cy={court.y + court.height / 2}
                          r="28"
                          fill="none"
                          strokeWidth="2"
                        />
                        {/* Left Key / Paint */}
                        <rect x={court.x} y={court.y + 60} width="65" height="70" fill="none" strokeWidth="2" />
                        <path
                          d={`M ${court.x + 65} ${court.y + 60} A 35 35 0 0 1 ${court.x + 65} ${court.y + 130}`}
                          fill="none"
                          strokeWidth="2"
                        />
                        {/* Left 3-Point Arc */}
                        <path
                          d={`M ${court.x} ${court.y + 20} Q ${court.x + 100} ${court.y + 95} ${court.x} ${court.y + 170}`}
                          fill="none"
                          strokeWidth="1.75"
                        />
                        {/* Right Key / Paint */}
                        <rect
                          x={court.x + court.width - 65}
                          y={court.y + 60}
                          width="65"
                          height="70"
                          fill="none"
                          strokeWidth="2"
                        />
                        <path
                          d={`M ${court.x + court.width - 65} ${court.y + 60} A 35 35 0 0 0 ${court.x + court.width - 65} ${court.y + 130}`}
                          fill="none"
                          strokeWidth="2"
                        />
                        {/* Right 3-Point Arc */}
                        <path
                          d={`M ${court.x + court.width} ${court.y + 20} Q ${court.x + court.width - 100} ${court.y + 95} ${court.x + court.width} ${court.y + 170}`}
                          fill="none"
                          strokeWidth="1.75"
                        />
                      </g>
                    )}

                    {/* Court Name / Header Badge */}
                    <rect
                      x={court.x + 6}
                      y={court.y + 6}
                      width={court.width - 12}
                      height={20}
                      fill="#0f172a"
                      opacity="0.85"
                      rx={4}
                    />
                    <text
                      x={court.x + court.width / 2}
                      y={court.y + 19}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="900"
                      letterSpacing="0.5"
                    >
                      {court.blueprintCode}
                    </text>

                    {/* LIVE / STATUS OVERLAY CARD INSIDE THE COURT */}
                    {isLive ? (
                      /* ACTIVE / ONGOING GAME BADGE */
                      <g>
                        {/* Glowing banner container */}
                        <rect
                          x={court.x + 8}
                          y={court.y + (court.orientation === 'vertical' ? 32 : 30)}
                          width={court.width - 16}
                          height={court.orientation === 'vertical' ? 146 : 65}
                          fill="#ffffff"
                          stroke="#22c55e"
                          strokeWidth="1.5"
                          rx={6}
                          filter="url(#courtGlow)"
                        />

                        {/* LIVE Indicator Pill */}
                        <rect
                          x={court.x + 12}
                          y={court.y + (court.orientation === 'vertical' ? 36 : 34)}
                          width={court.width - 24}
                          height={15}
                          fill="#16a34a"
                          rx={3}
                        />
                        <circle
                          cx={court.x + 20}
                          cy={court.y + (court.orientation === 'vertical' ? 43.5 : 41.5)}
                          r="3"
                          fill="#ffffff"
                        />
                        <text
                          x={court.x + court.width / 2 + 3}
                          y={court.y + (court.orientation === 'vertical' ? 47 : 45)}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="8"
                          fontWeight="900"
                        >
                          🔴 LIVE SA ORAS NA ITO
                        </text>

                        {/* Game Name */}
                        <text
                          x={court.x + court.width / 2}
                          y={court.y + (court.orientation === 'vertical' ? 68 : 61)}
                          textAnchor="middle"
                          fill="#0f172a"
                          fontSize={court.orientation === 'vertical' ? '10' : '11.5'}
                          fontWeight="900"
                        >
                          {status.activeGame?.gameName}
                        </text>

                        {/* Game Master info */}
                        <text
                          x={court.x + court.width / 2}
                          y={court.y + (court.orientation === 'vertical' ? 84 : 75)}
                          textAnchor="middle"
                          fill="#0038A8"
                          fontSize={court.orientation === 'vertical' ? '8' : '9'}
                          fontWeight="800"
                        >
                          {status.activeGame?.gameMaster}
                        </text>

                        {/* Scheduled time */}
                        <text
                          x={court.x + court.width / 2}
                          y={court.y + (court.orientation === 'vertical' ? 98 : 87)}
                          textAnchor="middle"
                          fill="#64748b"
                          fontSize="8"
                          fontWeight="bold"
                        >
                          {status.activeGame?.time}
                        </text>

                        {/* Progress Bar inside court */}
                        <rect
                          x={court.x + 14}
                          y={court.y + (court.orientation === 'vertical' ? 106 : court.height - 12)}
                          width={court.width - 28}
                          height={3.5}
                          fill="#e2e8f0"
                          rx={1.5}
                        />
                        <rect
                          x={court.x + 14}
                          y={court.y + (court.orientation === 'vertical' ? 106 : court.height - 12)}
                          width={((court.width - 28) * status.activeProgressPercent) / 100}
                          height={3.5}
                          fill="#16a34a"
                          rx={1.5}
                        />

                        {court.orientation === 'vertical' && (
                          <text
                            x={court.x + court.width / 2}
                            y={court.y + 122}
                            textAnchor="middle"
                            fill="#16a34a"
                            fontSize="8"
                            fontWeight="800"
                          >
                            {status.activeProgressPercent}% tapos na
                          </text>
                        )}
                      </g>
                    ) : (
                      /* AVAILABLE / IDLE COURT */
                      <g>
                        <rect
                          x={court.x + 8}
                          y={court.y + (court.orientation === 'vertical' ? 34 : 32)}
                          width={court.width - 16}
                          height={court.orientation === 'vertical' ? 142 : 62}
                          fill="#0f172a"
                          opacity="0.8"
                          rx={5}
                        />

                        <text
                          x={court.x + court.width / 2}
                          y={court.y + (court.orientation === 'vertical' ? 55 : 52)}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="9"
                          fontWeight="700"
                        >
                          BAKANTE / WALANG LARO
                        </text>

                        <text
                          x={court.x + court.width / 2}
                          y={court.y + (court.orientation === 'vertical' ? 70 : 66)}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="800"
                        >
                          {court.name}
                        </text>

                        {/* Show upcoming game if exists */}
                        {status?.upcomingGame ? (
                          <g>
                            <rect
                              x={court.x + 12}
                              y={court.y + (court.orientation === 'vertical' ? 84 : 74)}
                              width={court.width - 24}
                              height={16}
                              fill="#334155"
                              rx={3}
                            />
                            <text
                              x={court.x + court.width / 2}
                              y={court.y + (court.orientation === 'vertical' ? 95 : 85)}
                              textAnchor="middle"
                              fill="#fcd34d"
                              fontSize="7.5"
                              fontWeight="800"
                            >
                              ⏳ Susunod: {status.upcomingGame.gameName}
                            </text>
                            <text
                              x={court.x + court.width / 2}
                              y={court.y + (court.orientation === 'vertical' ? 112 : court.height - 7)}
                              textAnchor="middle"
                              fill="#94a3b8"
                              fontSize="7"
                              fontWeight="600"
                            >
                              {status.upcomingGame.time.split('-')[0]?.trim()}
                            </text>
                          </g>
                        ) : (
                          <text
                            x={court.x + court.width / 2}
                            y={court.y + (court.orientation === 'vertical' ? 95 : 82)}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="7.5"
                            fontWeight="600"
                          >
                            Walang susunod na laro
                          </text>
                        )}
                      </g>
                    )}

                    {/* Interactive Selection Highlight Ring */}
                    {isSelected && (
                      <rect
                        x={court.x - 2}
                        y={court.y - 2}
                        width={court.width + 4}
                        height={court.height + 4}
                        fill="none"
                        stroke="#FFCD00"
                        strokeWidth="3"
                        strokeDasharray="6,4"
                        rx={8}
                      />
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Court Details Drawer (Opens when clicking any court) */}
        {selectedCourtDetails && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-[#0038A8]/30 rounded-2xl p-4 sm:p-5 shadow-md relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setSelectedCourtId(null)}
              className="absolute top-3.5 right-3.5 w-7 h-7 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0038A8] text-white text-[10px] font-black uppercase">
                    {selectedCourtDetails.court.name}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Blueprint Code: {selectedCourtDetails.court.blueprintCode}
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-black text-slate-900">
                  {selectedCourtDetails.court.fullName}
                </h4>
                <p className="text-xs text-slate-600">
                  {selectedCourtDetails.court.sportLabel} • Pasay Sportsfest 2026
                </p>
              </div>

              {/* Status at selected time */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs min-w-[240px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">
                  Katayuan sa {formatMinutesTo12Hour(selectedMinutes)}:
                </div>
                {selectedCourtDetails.activeGame ? (
                  <div className="flex items-start gap-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black block">
                        KASALUKUYANG NAGLALARO (LIVE)
                      </span>
                      <span className="text-sm font-black text-slate-900 block">
                        {selectedCourtDetails.activeGame.gameName}
                      </span>
                      <span className="text-[11px] text-slate-600 block">
                        Referee / Game Master: <strong>{selectedCourtDetails.activeGame.gameMaster}</strong>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                        Iskedyul: {selectedCourtDetails.activeGame.time} ({selectedCourtDetails.activeProgressPercent}% tapos na)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-slate-600">
                    <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-black text-slate-800 block">
                        Walang Laro (Bakante)
                      </span>
                      {selectedCourtDetails.upcomingGame ? (
                        <span className="text-xs text-amber-700 block">
                          Susunod na laro: <strong>{selectedCourtDetails.upcomingGame.gameName}</strong> sa ganap na {selectedCourtDetails.upcomingGame.time}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 block">
                          Walang naka-iskedyul na laro para sa natitirang bahagi ng araw.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Full Schedule for this court */}
            <div className="mt-4 pt-3.5 border-t border-slate-200">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block mb-2">
                Buong Iskedyul ng Laro sa {selectedCourtDetails.court.name} para sa Palaro:
              </span>

              {selectedCourtDetails.allScheduledGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {selectedCourtDetails.allScheduledGames.map((entry, idx) => {
                    const isEntryActive = entry.status === 'live';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          isEntryActive
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-xs'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-black text-slate-900 truncate">
                            {entry.game.gameName}
                          </span>
                          {isEntryActive && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                              LIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">
                          GM: <strong>{entry.game.gameMaster}</strong>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                          <span>{entry.game.time}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMinutes(entry.startMin + 5);
                              setIsPlaying(false);
                            }}
                            className="text-[#0038A8] hover:underline font-bold text-[10px] cursor-pointer"
                          >
                            Tingnan Oras →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  Walang naka-iskedyul na laro sa court na ito. Maaari kayong magdagdag sa Admin Schedule.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6-Courts Summary Cards Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-[#0038A8]" />
              <span>Katayuan ng Lahat ng 6 Courts (Status sa {formatMinutesTo12Hour(selectedMinutes)}):</span>
            </span>

            {onNavigateToSchedule && (
              <button
                type="button"
                onClick={onNavigateToSchedule}
                className="text-xs font-black text-[#0038A8] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Pamahalaan ang Iskedyul (Admin Schedule)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {VENUE_COURTS.map((court) => {
              const status = courtsStatus[court.id];
              const isLive = status?.activeGame !== null;
              const isSelected = selectedCourtId === court.id;

              return (
                <div
                  key={court.id}
                  onClick={() =>
                    setSelectedCourtId(selectedCourtId === court.id ? null : court.id)
                  }
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0038A8] bg-blue-50/60 shadow-sm'
                      : isLive
                      ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">
                          {court.name}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          ({court.blueprintCode})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {court.sportLabel}
                      </span>
                    </div>

                    {isLive ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase shrink-0">
                        Bakante
                      </span>
                    )}
                  </div>

                  {isLive ? (
                    <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs">
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {status.activeGame?.gameName}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-slate-600 mt-0.5">
                        <span>GM: {status.activeGame?.gameMaster}</span>
                        <span className="font-bold text-emerald-700">{status.activeGame?.time}</span>
                      </div>
                    </div>
                  ) : status?.upcomingGame ? (
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Susunod na Laro:
                      </span>
                      <span className="font-bold text-slate-800 truncate block">
                        {status.upcomingGame.gameName}
                      </span>
                      <span className="text-[10px] text-amber-700 font-semibold block">
                        {status.upcomingGame.time}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 text-[10px] text-slate-400 italic">
                      Walang nakatalagang laro sa ngayon.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Helpful Info Note */}
        <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-950 font-medium">
          <Info className="w-4 h-4 text-[#0038A8] shrink-0" />
          <span>
            Ang floor plan ay nakabatay sa opisyal na architectural layout ng Met Sports Park Center (Pasay City).
            Awtomatikong naka-synchronize ito sa database ng Game Masters at Court Schedules ng Palaro 2026.
          </span>
        </div>
      </div>
    </div>
  );
};
