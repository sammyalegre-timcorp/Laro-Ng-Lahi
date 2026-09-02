import React, { useState, useEffect } from 'react';
import {
  X,
  Palette,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Team, DEFAULT_TEAMS, Registration } from '../types';
import { PRESET_TEAM_COLORS, POPULAR_MASCOT_EMOJIS, getTeamBadgeStyle } from '../utils/teamUtils';
import { saveAllTeams, resetTeamsToDefault, syncRenamedTeamsInRegistrations } from '../firebase/teams';

interface TeamManagementModalProps {
  teams: Team[];
  registrations: Registration[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  teams,
  registrations,
  onClose,
  onSuccess
}) => {
  const [editableTeams, setEditableTeams] = useState<Team[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeColorPickerTeamId, setActiveColorPickerTeamId] = useState<string | null>(null);
  const [activeEmojiPickerTeamId, setActiveEmojiPickerTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (teams && teams.length > 0) {
      setEditableTeams(JSON.parse(JSON.stringify(teams)));
    } else {
      setEditableTeams(JSON.parse(JSON.stringify(DEFAULT_TEAMS)));
    }
  }, [teams]);

  const handleFieldChange = (id: string, field: keyof Team, value: string) => {
    setEditableTeams(prev =>
      prev.map(t => {
        if (t.id === id) {
          return { ...t, [field]: value };
        }
        return t;
      })
    );
  };

  const handleAddNewTeam = () => {
    const newIndex = editableTeams.length + 1;
    const fallbackColor = PRESET_TEAM_COLORS[newIndex % PRESET_TEAM_COLORS.length].hex;
    const fallbackEmoji = POPULAR_MASCOT_EMOJIS[newIndex % POPULAR_MASCOT_EMOJIS.length];

    const newTeam: Team = {
      id: `team-custom-${Date.now()}`,
      name: `Team ${newIndex} (Koponan)`,
      tagline: 'Lakas at Sigla ng Koponan',
      color: fallbackColor,
      bgBadge: 'bg-slate-100',
      borderBadge: 'border-slate-300',
      textBadge: 'text-slate-800',
      iconName: fallbackEmoji
    };

    setEditableTeams(prev => [...prev, newTeam]);
  };

  const handleDeleteTeam = (id: string, name: string) => {
    const assignedMembers = registrations.filter(r => r.assignedTeam === name).length;
    if (assignedMembers > 0) {
      const confirmMsg = `Mayroong ${assignedMembers} kalahok na kasalukuyang naka-assign sa "${name}". Kapag binura ito, mananatili sila sa listahan ngunit mawawalan ng active team. Nais mo bang ituloy?`;
      if (!window.confirm(confirmMsg)) {
        return;
      }
    }
    setEditableTeams(prev => prev.filter(t => t.id !== id));
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Sigurado ka bang nais mong ibalik ang lahat ng Teams at Kulay sa orihinal na default settings?')) {
      return;
    }
    try {
      setIsResetting(true);
      await resetTeamsToDefault();
      setEditableTeams(JSON.parse(JSON.stringify(DEFAULT_TEAMS)));
      setSaveSuccessMsg('Matagumpay na naibalik sa orihinal na default teams!');
      setTimeout(() => setSaveSuccessMsg(null), 3500);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to reset teams:', err);
      setErrorMsg('Hindi nagawang i-reset ang teams. Pakisubukang muli.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    // Validations
    for (const team of editableTeams) {
      if (!team.name.trim()) {
        setErrorMsg('Ang bawat team ay dapat may Pangalan (Team Name).');
        return;
      }
      if (!team.color.trim()) {
        setErrorMsg('Ang bawat team ay dapat may Kulay (Hex Color).');
        return;
      }
    }

    // Check duplicates
    const names = editableTeams.map(t => t.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    if (names.length !== uniqueNames.size) {
      setErrorMsg('Bawal ang magkaparehong Pangalan ng Team. Pakibago ang duplikado.');
      return;
    }

    try {
      setIsSaving(true);

      // Build renamed mapping: oldName -> newName
      const renamedMap: Record<string, string> = {};
      editableTeams.forEach(newTeam => {
        const original = teams.find(t => t.id === newTeam.id);
        if (original && original.name !== newTeam.name.trim()) {
          renamedMap[original.name] = newTeam.name.trim();
        }
      });

      // Save teams in Firestore
      await saveAllTeams(editableTeams);

      // Automatically update participants who had old team names
      if (Object.keys(renamedMap).length > 0) {
        await syncRenamedTeamsInRegistrations(renamedMap);
      }

      setSaveSuccessMsg('Matagumpay na nai-save ang mga Pangalan at Kulay ng Teams!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Failed to save team settings:', err);
      setErrorMsg('Nagkaroon ng problema sa pag-save. Pakisubukang muli.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0038A8] via-[#002776] to-[#001b52] p-5 sm:p-6 text-white flex items-center justify-between shrink-0 relative">
          <div className="h-1.5 w-full bg-[#FFCD00] absolute top-0 left-0"></div>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-md">
              <Palette className="w-6 h-6 text-[#FFCD00]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFCD00]/20 text-[#FFCD00] text-[10px] font-black uppercase tracking-wider mb-1">
                <Shield className="w-3 h-3" />
                Admin Team Customizer
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                Pamahalaan ang Teams, Pangalan at Kulay
              </h3>
              <p className="text-xs text-blue-200 font-medium mt-1">
                I-customize ang opisyal na pangalan, motto, kulay (hex), at mascot ng bawat koponan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {saveSuccessMsg && (
          <div className="m-4 mb-0 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#00A86B] shrink-0" />
            <span className="font-bold">{saveSuccessMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="m-4 mb-0 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-[#CE1126] shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Teams List Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kabuuang Koponan: <span className="text-[#0038A8] font-black">{editableTeams.length} Teams</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isResetting || isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ibalik sa Default</span>
              </button>
              <button
                type="button"
                onClick={handleAddNewTeam}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0038A8] hover:bg-blue-900 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Magdagdag ng Team</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editableTeams.map((team, index) => {
              const badgeStyle = getTeamBadgeStyle(team.color);
              const assignedCount = registrations.filter(r => r.assignedTeam === team.name).length;

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl border-2 border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between space-y-3"
                >
                  {/* Top Color Accent Line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* Top Row: Index, Mascot Icon & Live Badge Preview */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black text-xs flex items-center justify-center">
                        #{index + 1}
                      </span>

                      {/* Mascot Emoji Button / Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveEmojiPickerTeamId(
                              activeEmojiPickerTeamId === team.id ? null : team.id
                            )
                          }
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-lg transition-transform hover:scale-110 cursor-pointer"
                          title="Pumili ng Mascot Emoji"
                        >
                          {team.iconName || '🏆'}
                        </button>

                        {/* Emoji Popover */}
                        {activeEmojiPickerTeamId === team.id && (
                          <div className="absolute top-11 left-0 z-30 bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 grid grid-cols-5 gap-1.5 w-48 animate-in fade-in zoom-in-95">
                            {POPULAR_MASCOT_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  handleFieldChange(team.id, 'iconName', emoji);
                                  setActiveEmojiPickerTeamId(null);
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-base transition-transform hover:scale-125 cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Live Badge Preview */}
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-xs transition-colors"
                        style={badgeStyle}
                      >
                        <span>{team.iconName || '🏆'}</span>
                        <span>{team.name || 'Pangalan ng Team'}</span>
                      </div>
                    </div>

                    {/* Member Count & Delete */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {assignedCount} members
                      </span>
                      {editableTeams.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteTeam(team.id, team.name)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Burahin ang Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="space-y-2.5">
                    {/* Team Name Input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                        Pangalan ng Team (Team Name)
                      </label>
                      <input
                        type="text"
                        value={team.name}
                        onChange={e => handleFieldChange(team.id, 'name', e.target.value)}
                        placeholder="Hal. Team Asul (Agila)"
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0038A8] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Tagline Input */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                        Motto / Tagline
                      </label>
                      <input
                        type="text"
                        value={team.tagline || ''}
                        onChange={e => handleFieldChange(team.id, 'tagline', e.target.value)}
                        placeholder="Hal. Bilis at Lipad ng Agila"
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#0038A8] focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Color Customizer */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Kulay ng Team (Hex & Palette)
                        </label>
                        <span className="text-[10px] font-mono font-bold text-slate-600">
                          {team.color}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Native Color Picker Circle */}
                        <div className="relative shrink-0">
                          <input
                            type="color"
                            value={team.color}
                            onChange={e => handleFieldChange(team.id, 'color', e.target.value)}
                            className="w-8 h-8 rounded-xl border-2 border-slate-300 p-0 cursor-pointer overflow-hidden"
                            title="Pumili ng custom color"
                          />
                        </div>

                        {/* Quick Presets Swatches */}
                        <div className="flex flex-wrap items-center gap-1.5 flex-1">
                          {PRESET_TEAM_COLORS.slice(0, 7).map(preset => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleFieldChange(team.id, 'color', preset.hex)}
                              className={`w-6 h-6 rounded-lg transition-transform hover:scale-125 border ${
                                team.color.toLowerCase() === preset.hex.toLowerCase()
                                  ? 'ring-2 ring-slate-800 scale-110'
                                  : 'border-white/80'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                            />
                          ))}
                          {PRESET_TEAM_COLORS.slice(7, 14).map(preset => (
                            <button
                              key={preset.hex}
                              type="button"
                              onClick={() => handleFieldChange(team.id, 'color', preset.hex)}
                              className={`w-6 h-6 rounded-lg transition-transform hover:scale-125 border ${
                                team.color.toLowerCase() === preset.hex.toLowerCase()
                                  ? 'ring-2 ring-slate-800 scale-110'
                                  : 'border-white/80'
                              }`}
                              style={{ backgroundColor: preset.hex }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0038A8]" />
            <span>
              Awtomatikong mag-a-update ang mga badges at team assignments sa roster pagka-save.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0038A8] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Nise-save sa Firestore...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#FFCD00]" />
                  <span>I-save ang Teams & Kulay</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
