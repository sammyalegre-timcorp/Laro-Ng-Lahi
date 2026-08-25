import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Printer,
  Sparkles,
  Trophy,
  UserCheck,
  Gamepad2,
  Clock,
  MapPin,
  AlertTriangle,
  Info,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { GameMasterAssignment } from '../types';
import {
  subscribeToGameMasters,
  addGameMasterEntry,
  updateGameMasterEntry,
  deleteGameMasterEntry
} from '../firebase/gameMasters';

export const COURTS = [
  'Court 1',
  'Court 2',
  'Court 3',
  'Court 4',
  'Court 5',
  'Court 6'
] as const;

export const STANDARD_TIME_SLOTS = [
  '08:00 AM - 09:00 AM',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM'
];

const DEFAULT_GAMES_LIST = [
  { game: 'Patintero', court: 'Court 1', time: '08:00 AM - 09:00 AM' },
  { game: 'Tumbang Preso', court: 'Court 2', time: '08:00 AM - 09:00 AM' },
  { game: 'Hilahang Lubid (Tug of War)', court: 'Court 3', time: '09:00 AM - 10:00 AM' },
  { game: 'Karera ng Sako (Sack Race)', court: 'Court 4', time: '09:00 AM - 10:00 AM' },
  { game: 'Kadang-Kadang', court: 'Court 5', time: '10:00 AM - 11:00 AM' },
  { game: 'Agawan Base', court: 'Court 6', time: '10:00 AM - 11:00 AM' },
  { game: 'Luksong Baka', court: 'Court 1', time: '01:00 PM - 02:00 PM' },
  { game: 'Piko', court: 'Court 2', time: '01:00 PM - 02:00 PM' },
  { game: 'Sipa', court: 'Court 3', time: '02:00 PM - 03:00 PM' },
  { game: 'Luksong Tinik', court: 'Court 4', time: '02:00 PM - 03:00 PM' }
];

export const GameRulesGuide: React.FC = () => {
  const [entries, setEntries] = useState<GameMasterAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for new entry
  const [newGame, setNewGame] = useState('');
  const [newGameMaster, setNewGameMaster] = useState('');
  const [newCourt, setNewCourt] = useState<string>('Court 1');
  const [newTime, setNewTime] = useState<string>(STANDARD_TIME_SLOTS[0]);
  const [customTime, setCustomTime] = useState('');
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Status message state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state
  const [filterCourt, setFilterCourt] = useState<string>('all');
  const [filterTime, setFilterTime] = useState<string>('all');

  // In-line editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGame, setEditGame] = useState('');
  const [editMaster, setEditMaster] = useState('');
  const [editCourt, setEditCourt] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Deletion state & modal
  const [itemToDelete, setItemToDelete] = useState<GameMasterAssignment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Subscribe to Firestore
  useEffect(() => {
    const unsubscribe = subscribeToGameMasters(
      (data) => {
        setEntries(data);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading game masters:', err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const getEffectiveNewTime = () => {
    return isCustomTime ? customTime.trim() : newTime.trim();
  };

  // Helper to normalize strings for comparison
  const normalize = (str: string) => str.trim().toLowerCase();

  // Validate conflict for Game Master & Time
  const checkGameMasterConflict = (
    gameMaster: string,
    time: string,
    excludeId?: string
  ): GameMasterAssignment | null => {
    if (!gameMaster.trim() || !time.trim()) return null;
    const normMaster = normalize(gameMaster);
    const normTime = normalize(time);

    return (
      entries.find(
        (e) =>
          e.id !== excludeId &&
          normalize(e.gameMaster) === normMaster &&
          normalize(e.time) === normTime
      ) || null
    );
  };

  // Validate conflict for Court & Time (Court Double-Booking)
  const checkCourtConflict = (
    court: string,
    time: string,
    excludeId?: string
  ): GameMasterAssignment | null => {
    if (!court.trim() || !time.trim()) return null;
    const normCourt = normalize(court);
    const normTime = normalize(time);

    return (
      entries.find(
        (e) =>
          e.id !== excludeId &&
          normalize(e.court) === normCourt &&
          normalize(e.time) === normTime
      ) || null
    );
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const gameName = newGame.trim();
    const gameMaster = newGameMaster.trim();
    const court = newCourt.trim();
    const time = getEffectiveNewTime();

    if (!gameName) {
      setErrorMessage('Pakilagay ang pangalan ng Laro (Game).');
      return;
    }
    if (!gameMaster) {
      setErrorMessage('Pakilagay ang pangalan ng Game Master.');
      return;
    }
    if (!court) {
      setErrorMessage('Pumili ng Court (Court 1 hanggang Court 6).');
      return;
    }
    if (!time) {
      setErrorMessage('Pakilagay o pumili ng Oras (Time) ng laro.');
      return;
    }

    // 1. COURT DOUBLE-BOOKING CHECK: Same Court on same Time
    const courtConflict = checkCourtConflict(court, time);
    if (courtConflict) {
      setErrorMessage(
        `❌ ERROR / INVALID (COURT DOUBLE-BOOKED): Ang "${court}" ay naka-iskedyul na para sa larong "${courtConflict.gameName}" (Game Master: ${courtConflict.gameMaster}) sa parehong oras (${courtConflict.time})! Pumili ng ibang Court o ibang Oras.`
      );
      return;
    }

    // 2. GAME MASTER CONFLICT CHECK: Same Game Master on same Time
    const gmConflict = checkGameMasterConflict(gameMaster, time);
    if (gmConflict) {
      setErrorMessage(
        `❌ ERROR / INVALID (GAME MASTER DOUBLE-BOOKED): Si "${gmConflict.gameMaster}" ay naka-assign na sa larong "${gmConflict.gameName}" sa ${gmConflict.court} sa parehong oras (${gmConflict.time})! Hindi maaaring magkasabay ang parehong Game Master sa iisang oras.`
      );
      return;
    }

    try {
      setIsAdding(true);
      await addGameMasterEntry({
        gameName,
        gameMaster,
        court,
        time,
        order: Date.now()
      });

      setSuccessMessage(`Matagumpay na naidagdag ang "${gameName}" para kay ${gameMaster} sa ${court} (${time})!`);
      setNewGame('');
      setNewGameMaster('');
      if (isCustomTime) {
        setCustomTime('');
        setIsCustomTime(false);
      }
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to add entry:', err);
      setErrorMessage('Hindi naidagdag ang laro. Pakisubukang muli.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (entry: GameMasterAssignment) => {
    setEditingId(entry.id || null);
    setEditGame(entry.gameName);
    setEditMaster(entry.gameMaster);
    setEditCourt(entry.court || 'Court 1');
    setEditTime(entry.time || STANDARD_TIME_SLOTS[0]);
    setEditErrorMessage(null);
  };

  const handleSaveEdit = async (id: string) => {
    setEditErrorMessage(null);
    const gameName = editGame.trim();
    const gameMaster = editMaster.trim();
    const court = editCourt.trim();
    const time = editTime.trim();

    if (!gameName || !gameMaster || !court || !time) {
      setEditErrorMessage('Paki-kumpleto ang lahat ng field.');
      return;
    }

    // 1. Check court conflict against other entries
    const courtConflict = checkCourtConflict(court, time, id);
    if (courtConflict) {
      setEditErrorMessage(
        `❌ ERROR / INVALID (COURT DOUBLE-BOOKED): Ang "${court}" ay naka-iskedyul na para sa larong "${courtConflict.gameName}" (Game Master: ${courtConflict.gameMaster}) sa parehong oras (${courtConflict.time})!`
      );
      return;
    }

    // 2. Check Game Master conflict against other entries
    const gmConflict = checkGameMasterConflict(gameMaster, time, id);
    if (gmConflict) {
      setEditErrorMessage(
        `❌ ERROR / INVALID (GAME MASTER DOUBLE-BOOKED): Si "${gmConflict.gameMaster}" ay mayroon nang laro (${gmConflict.gameName} sa ${gmConflict.court}) sa parehong oras (${gmConflict.time})!`
      );
      return;
    }

    try {
      await updateGameMasterEntry(id, {
        gameName,
        gameMaster,
        court,
        time
      });
      setEditingId(null);
      setSuccessMessage(`Matagumpay na na-update ang "${gameName}"!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save edit:', err);
      setEditErrorMessage('Hindi na-save ang pagbabago.');
    }
  };

  // Safe In-UI Deletion Handler
  const confirmDeleteEntry = async () => {
    if (!itemToDelete || !itemToDelete.id) return;
    const id = itemToDelete.id;
    const name = itemToDelete.gameName;

    try {
      setIsDeleting(true);
      await deleteGameMasterEntry(id);
      setItemToDelete(null);
      setSuccessMessage(`Matagumpay na natanggal ang larong "${name}" sa iskedyul.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to delete:', err);
      setErrorMessage('Hindi natanggal ang entry. Pakisubukang muli.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      for (let i = 0; i < DEFAULT_GAMES_LIST.length; i++) {
        const item = DEFAULT_GAMES_LIST[i];
        if (!entries.some((e) => normalize(e.gameName) === normalize(item.game))) {
          await addGameMasterEntry({
            gameName: item.game,
            gameMaster: `Game Master ${i + 1}`,
            court: item.court,
            time: item.time,
            order: Date.now() + i
          });
        }
      }
      setSuccessMessage('Nai-load na ang karaniwang Pinoy Games roster.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to seed default games:', err);
      setErrorMessage('Nagkaroon ng problema sa pag-load ng halimbawang laro.');
    }
  };

  // Filtered Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchCourt = filterCourt === 'all' || e.court === filterCourt;
      const matchTime = filterTime === 'all' || e.time === filterTime;
      return matchCourt && matchTime;
    });
  }, [entries, filterCourt, filterTime]);

  const getCourtBadgeColor = (courtName: string) => {
    switch (courtName) {
      case 'Court 1':
        return 'bg-blue-100 text-[#0038A8] border-blue-200';
      case 'Court 2':
        return 'bg-red-100 text-[#CE1126] border-red-200';
      case 'Court 3':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Court 4':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Court 5':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Court 6':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Tanggalin ang Laro sa Iskedyul?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Sigurado ka bang nais mong tanggalin ang <strong className="text-slate-900 font-black">"{itemToDelete.gameName}"</strong>?
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-600"><strong>Game Master:</strong> {itemToDelete.gameMaster}</div>
                  <div className="text-slate-600"><strong>Lugar / Oras:</strong> {itemToDelete.court} • {itemToDelete.time}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Kanselahin
              </button>
              <button
                type="button"
                onClick={confirmDeleteEntry}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Tinatanggal...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Oo, Tanggalin</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(0,56,168,0.05)] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#0038A8]/10 text-[#0038A8] text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                6 Courts Operations & Referee Schedule
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Games, Game Masters & <span className="text-[#0038A8]">Court Schedule</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Pamahalaan ang mga laro, nakatalagang Game Master, Court (Court 1-6), at Oras (Time) na may automated conflict & double-booking prevention.
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            <button
              onClick={() => window.print()}
              disabled={entries.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>I-print ang Schedule</span>
            </button>
          </div>
        </div>

        {/* Status / Error Notifications */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 flex items-start justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-xs uppercase tracking-wider text-red-900">Validasyon / Paalala</p>
                <p className="text-xs sm:text-sm font-semibold mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs sm:text-sm font-bold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form for New Game, Game Master, Court, and Time */}
        <div className="pt-6 print:hidden">
          <form onSubmit={handleAdd} className="bg-slate-50 p-5 sm:p-6 rounded-2xl border-2 border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span>Magdagdag ng Laro, Game Master, Court at Oras</span>
              </h3>
              {entries.length === 0 && (
                <button
                  type="button"
                  onClick={handleSeedDefaults}
                  className="text-xs text-[#0038A8] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>I-load ang Karaniwang Pinoy Games</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              {/* Column 1: Game Name */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Game (Pangalan ng Laro) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Gamepad2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Hal. Patintero"
                    value={newGame}
                    onChange={(e) => setNewGame(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Column 2: Game Master */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Game Master (Referee) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Hal. Coach Mark"
                    value={newGameMaster}
                    onChange={(e) => setNewGameMaster(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 transition-colors"
                  />
                </div>
              </div>

              {/* Column 3: Court (Court 1 - 6) */}
              <div className="sm:col-span-3">
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                  Court (6 Courts) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={newCourt}
                    onChange={(e) => setNewCourt(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                  >
                    {COURTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Column 4: Time */}
              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">
                    Time (Oras) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomTime(!isCustomTime)}
                    className="text-[10px] text-[#0038A8] font-bold hover:underline cursor-pointer"
                  >
                    {isCustomTime ? 'Select Preset' : 'Custom Time'}
                  </button>
                </div>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {isCustomTime ? (
                    <input
                      type="text"
                      placeholder="Hal. 08:30 AM - 09:30 AM"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 transition-colors"
                    />
                  ) : (
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-[#0038A8] focus:outline-none text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
                    >
                      {STANDARD_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-12 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAdding || !newGame.trim() || !newGameMaster.trim()}
                  className="px-6 py-3 bg-[#0038A8] hover:bg-[#002d86] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAdding ? 'Sinusuri at Idinaragdag...' : 'Idagdag sa Iskedyul'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Filter bar for Court & Time */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 text-xs print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#0038A8]" />
              <span>I-filter:</span>
            </span>

            <select
              value={filterCourt}
              onChange={(e) => setFilterCourt(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
            >
              <option value="all">Lahat ng Court (All 6 Courts)</option>
              {COURTS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50 font-bold text-slate-700 outline-none text-xs cursor-pointer"
            >
              <option value="all">Lahat ng Oras (All Times)</option>
              {STANDARD_TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(filterCourt !== 'all' || filterTime !== 'all') && (
              <button
                onClick={() => {
                  setFilterCourt('all');
                  setFilterTime('all');
                }}
                className="text-xs text-red-600 hover:underline font-bold px-2 py-1 cursor-pointer"
              >
                I-clear ang filter
              </button>
            )}
          </div>

          <span className="text-slate-400 font-bold text-xs">
            Ipinapakita ang {filteredEntries.length} sa {entries.length} laro
          </span>
        </div>

        {/* Edit Error message */}
        {editErrorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{editErrorMessage}</span>
          </div>
        )}

        {/* 4-Column Table: Game, Game Master, Court, Time */}
        <div className="mt-4">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] border-b border-slate-800">
                  <th className="p-4 w-10 text-center text-slate-400">#</th>
                  <th className="p-4 w-1/4">Game (Laro)</th>
                  <th className="p-4 w-1/4">Game Master (Referee)</th>
                  <th className="p-4 w-1/6">Court</th>
                  <th className="p-4 w-1/4">Time (Oras)</th>
                  <th className="p-4 w-28 text-right print:hidden">Aksyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                      Kinukuha ang listahan ng mga laro, court, at game masters...
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400">
                      <div className="max-w-md mx-auto space-y-3">
                        <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700 text-sm">Walang nakitang laro para sa napiling filter.</p>
                        <p className="text-xs text-slate-500">
                          Gamitin ang form sa itaas upang magdagdag ng mga laro at kanilang game masters, o i-click ang button sa ibaba.
                        </p>
                        {entries.length === 0 && (
                          <button
                            onClick={handleSeedDefaults}
                            className="px-4 py-2 rounded-xl bg-[#0038A8] text-white text-xs font-black uppercase tracking-wider hover:bg-[#002d86] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#FFCD00]" />
                            <span>I-load ang Karaniwang Pinoy Games</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry, index) => {
                    const isEditing = editingId === entry.id;

                    return (
                      <tr
                        key={entry.id || index}
                        className={`transition-colors ${
                          isEditing ? 'bg-amber-50/50' : 'hover:bg-blue-50/40 bg-white'
                        }`}
                      >
                        {/* Number Index */}
                        <td className="p-4 text-center font-mono font-bold text-slate-400">
                          {index + 1}
                        </td>

                        {/* Column 1: Game */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editGame}
                              onChange={(e) => setEditGame(e.target.value)}
                              className="w-full px-3 py-1.5 border-2 border-[#0038A8] rounded-lg font-bold text-slate-900 text-xs outline-none"
                              placeholder="Game Name"
                              autoFocus
                            />
                          ) : (
                            <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#0038A8]"></span>
                              <span>{entry.gameName}</span>
                            </div>
                          )}
                        </td>

                        {/* Column 2: Game Master */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editMaster}
                              onChange={(e) => setEditMaster(e.target.value)}
                              className="w-full px-3 py-1.5 border-2 border-[#0038A8] rounded-lg font-bold text-slate-900 text-xs outline-none"
                              placeholder="Game Master"
                            />
                          ) : (
                            <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                              <UserCheck className="w-3.5 h-3.5 text-[#0038A8]" />
                              <span>{entry.gameMaster}</span>
                            </div>
                          )}
                        </td>

                        {/* Column 3: Court */}
                        <td className="p-4">
                          {isEditing ? (
                            <select
                              value={editCourt}
                              onChange={(e) => setEditCourt(e.target.value)}
                              className="w-full px-2 py-1.5 border-2 border-[#0038A8] rounded-lg font-bold text-slate-900 text-xs outline-none"
                            >
                              {COURTS.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 border ${getCourtBadgeColor(
                                entry.court
                              )}`}
                            >
                              <MapPin className="w-3 h-3" />
                              <span>{entry.court || 'Court 1'}</span>
                            </span>
                          )}
                        </td>

                        {/* Column 4: Time */}
                        <td className="p-4">
                          {isEditing ? (
                            <div className="space-y-1">
                              <select
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                className="w-full px-2 py-1.5 border-2 border-[#0038A8] rounded-lg font-bold text-slate-900 text-xs outline-none"
                              >
                                {STANDARD_TIME_SLOTS.map((slot) => (
                                  <option key={slot} value={slot}>
                                    {slot}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="text"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                                placeholder="O i-type ang oras..."
                                className="w-full px-2 py-1 border border-slate-300 rounded text-[11px]"
                              />
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                              <Clock className="w-3.5 h-3.5 text-[#0038A8]" />
                              <span>{entry.time || 'TBD'}</span>
                            </div>
                          )}
                        </td>

                        {/* Actions (Hidden during print) */}
                        <td className="p-4 text-right print:hidden">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveEdit(entry.id!)}
                                className="p-2 bg-[#00A86B] hover:bg-[#008f5b] text-white rounded-lg transition-colors cursor-pointer shadow-sm flex items-center gap-1 text-xs font-bold"
                                title="I-save"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Save</span>
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                                title="Kanselahin"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(entry)}
                                className="p-2 text-slate-500 hover:text-[#0038A8] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                                title="I-edit ang detalye"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setItemToDelete(entry)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer group"
                                title="Tanggalin ang laro"
                              >
                                <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Quick Footer summary / info */}
          {entries.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#0038A8]" />
                <span>
                  Ligtas ang iskedyul: Automated double-booking validation sa Game Master at Court availability.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSeedDefaults}
                className="text-[#0038A8] hover:underline font-bold mt-2 sm:mt-0 print:hidden cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Magdagdag pa ng Tradisyunal na Pinoy Games</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
