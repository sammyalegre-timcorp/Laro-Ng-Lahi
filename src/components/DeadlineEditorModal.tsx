import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Save,
  Radio,
  Bell
} from 'lucide-react';
import {
  EventConfig,
  DEFAULT_DEADLINE_ISO,
  formatDeadlineDisplay,
  isRegistrationClosedWithConfig
} from '../types';
import { updateEventConfig } from '../firebase/eventConfig';

interface DeadlineEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventConfig: EventConfig;
  onSuccessToast?: (msg: string) => void;
}

// Converts a timestamp/ISO string into YYYY-MM-DD and HH:mm parts in Philippine Time (UTC+8)
function getPstParts(isoOrMs: string | number) {
  const date = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  const baseTime = isNaN(date.getTime()) ? new Date(DEFAULT_DEADLINE_ISO).getTime() : date.getTime();
  
  // Calculate UTC+8
  const utc = baseTime + (new Date(baseTime).getTimezoneOffset() * 60000);
  const pst = new Date(utc + (3600000 * 8));

  const y = pst.getFullYear();
  const m = String(pst.getMonth() + 1).padStart(2, '0');
  const d = String(pst.getDate()).padStart(2, '0');
  const dateString = `${y}-${m}-${d}`;

  const rawHours = pst.getHours();
  const rawMinutes = pst.getMinutes();
  const hours12 = rawHours % 12 || 12;
  const ampm = rawHours >= 12 ? 'PM' : 'AM';
  const timeString = `${String(rawHours).padStart(2, '0')}:${String(rawMinutes).padStart(2, '0')}`;

  return {
    dateString,
    timeString,
    hours12,
    minutes: rawMinutes,
    ampm
  };
}

// Converts a YYYY-MM-DD string and HH:mm string (treated as PST / UTC+8) back to an ISO string
function pstPartsToIso(dateStr: string, timeStr: string): string {
  if (!dateStr) return DEFAULT_DEADLINE_ISO;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = (timeStr || '19:00').split(':').map(Number);

  // Construct Date in UTC by subtracting 8 hours
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 8, minutes, 0, 0));
  return utcDate.toISOString();
}

export const DeadlineEditorModal: React.FC<DeadlineEditorModalProps> = ({
  isOpen,
  onClose,
  eventConfig,
  onSuccessToast
}) => {
  const initialParts = getPstParts(eventConfig.deadlineIso || eventConfig.deadlineMs);

  const [dateVal, setDateVal] = useState<string>(initialParts.dateString);
  const [timeVal, setTimeVal] = useState<string>(initialParts.timeString);
  const [statusMode, setStatusMode] = useState<'auto' | 'force-open' | 'force-close'>(() => {
    if (eventConfig.isManuallyClosed) return 'force-close';
    if (eventConfig.isManuallyOpened) return 'force-open';
    return 'auto';
  });
  const [customNotice, setCustomNotice] = useState<string>(eventConfig.customNotice || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute preview based on current form inputs
  const currentIsoPreview = pstPartsToIso(dateVal, timeVal);
  const previewFormatted = formatDeadlineDisplay(currentIsoPreview);
  const previewMs = new Date(currentIsoPreview).getTime();
  const isTimeInPast = previewMs < Date.now();

  // Apply Quick Presets
  const handleApplyPreset = (type: 'plus1h' | 'plus1d' | 'plus3d' | 'plus1w' | 'tonight' | 'default') => {
    setErrorMessage(null);
    let targetDate: Date;

    if (type === 'default') {
      const parts = getPstParts(DEFAULT_DEADLINE_ISO);
      setDateVal(parts.dateString);
      setTimeVal(parts.timeString);
      setStatusMode('auto');
      return;
    }

    if (type === 'tonight') {
      const now = new Date();
      // Tonight 11:59 PM in PST
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const pst = new Date(utc + (3600000 * 8));
      const parts = getPstParts(pst.getTime());
      setDateVal(parts.dateString);
      setTimeVal('23:59');
      setStatusMode('auto');
      return;
    }

    // Offset from current or form date
    const base = isTimeInPast ? Date.now() : previewMs;
    const offsets = {
      plus1h: 60 * 60 * 1000,
      plus1d: 24 * 60 * 60 * 1000,
      plus3d: 3 * 24 * 60 * 60 * 1000,
      plus1w: 7 * 24 * 60 * 60 * 1000,
    };

    targetDate = new Date(base + offsets[type]);
    const parts = getPstParts(targetDate.getTime());
    setDateVal(parts.dateString);
    setTimeVal(parts.timeString);
    setStatusMode('auto');
  };

  const handleSave = async () => {
    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      if (!dateVal) {
        setErrorMessage('Paki-pili ang petsa ng deadline / cutoff.');
        setIsSubmitting(false);
        return;
      }

      const iso = pstPartsToIso(dateVal, timeVal);
      const ms = new Date(iso).getTime();

      if (isNaN(ms)) {
        setErrorMessage('Hindi wasto ang napiling petsa o oras. Pakisubukang muli.');
        setIsSubmitting(false);
        return;
      }

      await updateEventConfig({
        deadlineIso: iso,
        deadlineMs: ms,
        isManuallyClosed: statusMode === 'force-close',
        isManuallyOpened: statusMode === 'force-open',
        customNotice: customNotice.trim()
      }, 'Admin User');

      if (onSuccessToast) {
        onSuccessToast('Matagumpay na na-update ang registration deadline at cutoff!');
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to update event config deadline:', err);
      setErrorMessage(err.message || 'Nagkaroon ng problema sa pag-save ng deadline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#0038A8] to-[#002776] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFCD00] text-[#0038A8] flex items-center justify-center font-black shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFCD00] block">
                Palarong Pinoy 2026 Admin Configuration
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                I-edit ang Registration Deadline & Cutoff
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Live Preview Card */}
          <div className="bg-gradient-to-br from-blue-50 via-slate-50 to-amber-50/60 p-4 sm:p-5 rounded-2xl border-2 border-blue-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0038A8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live Preview ng Bagong Deadline (PST)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                statusMode === 'force-close' || (statusMode === 'auto' && isTimeInPast)
                  ? 'bg-red-100 text-red-700'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {statusMode === 'force-close'
                  ? 'Sarado (Force Close)'
                  : statusMode === 'force-open'
                  ? 'Bukas (Force Open)'
                  : isTimeInPast
                  ? 'Nagsara Na (Expired)'
                  : 'Bukas ang Rehistrasyon'}
              </span>
            </div>

            <div className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {previewFormatted.tagalog}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              English: <span className="font-semibold text-slate-700">{previewFormatted.english}</span>
            </p>
          </div>

          {/* Date & Time Picker Controls */}
          <div className="space-y-4">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Itakda ang Petsa at Oras (Philippine Standard Time)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0038A8]" />
                  Petsa ng Deadline (Date)
                </label>
                <input
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] text-sm font-bold text-slate-900 outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0038A8]" />
                  Oras ng Cutoff (Time PST)
                </label>
                <input
                  type="time"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] text-sm font-bold text-slate-900 outline-hidden bg-slate-50/50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mabilisang Palawig (Quick Presets)
              </span>
              <span className="text-[10px] text-slate-400 font-medium">I-click para mabilisang itakda</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('plus1h')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0038A8] hover:border-blue-300 border border-slate-200 text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
              >
                +1 Oras (+1 hr)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('plus1d')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0038A8] hover:border-blue-300 border border-slate-200 text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
              >
                +1 Araw (+1 day)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('plus3d')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0038A8] hover:border-blue-300 border border-slate-200 text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
              >
                +3 Araw (+3 days)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('plus1w')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-[#0038A8] hover:border-blue-300 border border-slate-200 text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
              >
                +1 Linggo (+1 wk)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('tonight')}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 border border-slate-200 text-xs font-bold text-slate-700 transition-all text-center cursor-pointer"
              >
                Mamayang 11:59 PM
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('default')}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ibalik sa Orihinal</span>
              </button>
            </div>
          </div>

          {/* Registration Override Mode */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Mode ng Rehistrasyon (Status Control)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStatusMode('auto')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  statusMode === 'auto'
                    ? 'border-[#0038A8] bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-900">Awtomatiko</span>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    statusMode === 'auto' ? 'border-[#0038A8]' : 'border-slate-300'
                  }`}>
                    {statusMode === 'auto' && <div className="w-1.5 h-1.5 rounded-full bg-[#0038A8]" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Kusang magsasara kapag sumapit na ang itinakdang petsa at oras.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusMode('force-open')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  statusMode === 'force-open'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-900">Manatiling Bukas</span>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    statusMode === 'force-open' ? 'border-emerald-600' : 'border-slate-300'
                  }`}>
                    {statusMode === 'force-open' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Buksan kahit lampas na sa itinakdang deadline (Overridden).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusMode('force-close')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  statusMode === 'force-close'
                    ? 'border-red-600 bg-red-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-red-900">Isara Na Agad</span>
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    statusMode === 'force-close' ? 'border-red-600' : 'border-slate-300'
                  }`}>
                    {statusMode === 'force-close' && <div className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Ihinto agad ang pagpapatala anuman ang oras ngayon (Emergency Cutoff).
                </p>
              </button>
            </div>
          </div>

          {/* Optional Announcement Note */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Espesyal na Pabatid / Paalala (Optional Note for Attendees)</span>
            </label>
            <input
              type="text"
              value={customNotice}
              onChange={(e) => setCustomNotice(e.target.value)}
              placeholder="Hal. Pinalawig ang rehistrasyon para sa lahat ng empleyado!"
              className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] text-xs font-medium text-slate-900 outline-hidden"
            />
            <p className="text-[11px] text-slate-400">
              Lalabas ang paalalang ito sa itaas ng registration page at sa countdown timer.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-50"
          >
            Kanselahin
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#0038A8] hover:bg-[#002776] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sine-save sa Database...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>I-save ang Bagong Deadline</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
