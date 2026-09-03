import React, { useState, useMemo } from 'react';
import {
  X,
  Shuffle,
  Save,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ChevronDown,
  Zap,
  Heart
} from 'lucide-react';
import { Registration, Team, DEFAULT_TEAMS } from '../types';
import { balanceTeams, computeTeamStats, getAgeTier, AGE_TIER_CONFIG } from '../utils/teamBalancer';
import { batchUpdateTeams } from '../firebase/registrations';

interface TeamBalancerModalProps {
  registrations: Registration[];
  teams?: Team[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamBalancerModal: React.FC<TeamBalancerModalProps> = ({
  registrations,
  teams = DEFAULT_TEAMS,
  onClose,
  onSuccess
}) => {
  const [numTeams, setNumTeams] = useState<number>(() => Math.min(4, Math.max(2, teams.length)));
  const [isSaving, setIsSaving] = useState(false);

  // Available counts based on current teams length
  const availableCounts = useMemo(() => {
    const max = Math.max(2, teams.length);
    const counts: number[] = [];
    for (let i = 2; i <= max; i++) {
      counts.push(i);
    }
    return counts;
  }, [teams.length]);

  // Selected teams subset
  const currentTeams = useMemo(() => {
    return teams.slice(0, numTeams);
  }, [teams, numTeams]);

  // Working state of assignments: registrantId -> teamName
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    registrations.forEach(r => {
      if (r.id && r.assignedTeam) {
        initial[r.id] = r.assignedTeam;
      }
    });
    return initial;
  });

  // Automatically calculate preview list with simulated assignments
  const previewRegistrations = useMemo(() => {
    return registrations.map(r => ({
      ...r,
      assignedTeam: r.id ? (assignments[r.id] || null) : null
    }));
  }, [registrations, assignments]);

  const teamStats = useMemo(() => {
    return computeTeamStats(previewRegistrations, currentTeams);
  }, [previewRegistrations, currentTeams]);

  // Calculate Overall Balance & Energy Spread Metrics
  const activeTeams = useMemo(() => teamStats.filter(t => t.members.length > 0), [teamStats]);
  const youngCounts = useMemo(() => activeTeams.map(t => t.ageDistribution.young), [activeTeams]);
  const olderCounts = useMemo(() => activeTeams.map(t => t.ageDistribution.older), [activeTeams]);

  const minYoung = youngCounts.length ? Math.min(...youngCounts) : 0;
  const maxYoung = youngCounts.length ? Math.max(...youngCounts) : 0;
  const youngSpreadGap = maxYoung - minYoung;

  const minOlder = olderCounts.length ? Math.min(...olderCounts) : 0;
  const maxOlder = olderCounts.length ? Math.max(...olderCounts) : 0;
  const olderSpreadGap = maxOlder - minOlder;

  // Well balanced if younger runners and older participants differ by at most 1 across teams
  const isEnergySpreadBalanced = youngSpreadGap <= 1 && olderSpreadGap <= 1;

  const handleAutoBalance = () => {
    const newAssignments = balanceTeams(registrations, currentTeams);
    setAssignments(newAssignments);
  };

  const handleGroupCountChange = (count: number) => {
    setNumTeams(count);
    const newTeams = teams.slice(0, count);
    const newAssignments = balanceTeams(registrations, newTeams);
    setAssignments(newAssignments);
  };

  const handleManualAssign = (registrantId: string, teamName: string) => {
    setAssignments(prev => ({
      ...prev,
      [registrantId]: teamName
    }));
  };

  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      const updates = registrations
        .filter(r => r.id)
        .map(r => ({
          id: r.id!,
          teamName: assignments[r.id!] || null
        }));

      await batchUpdateTeams(updates);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to commit team assignments:', err);
      alert('Nagkaroon ng error sa pag-save ng teams. Pakisubukang muli.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-7xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0038A8] p-5 sm:p-6 text-white flex items-center justify-between shrink-0 relative">
          <div className="h-1.5 w-full bg-[#CE1126] absolute top-0 left-0"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFCD00] text-[#0038A8] flex items-center justify-center font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>Smart Group Allocator & Team Balancer</span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                  Energy & Age Balanced
                </span>
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                Ikinakalat nang pantay ang mas bata (high energy sa laro) at nakatatanda (cheering & gabay) para walang dehado sa bilis o lakas!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Control Bar - Group selection from 2 to 10 */}
        <div className="p-4 sm:p-5 bg-amber-50/70 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Pumili ng Bilang ng Groups:
            </span>
            <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-2xl border border-amber-300 shadow-xs">
              {availableCounts.map(count => (
                <button
                  key={count}
                  onClick={() => handleGroupCountChange(count)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    numTeams === count
                      ? 'bg-[#0038A8] text-white shadow-xs scale-105'
                      : 'text-slate-700 hover:bg-amber-100/70'
                  }`}
                  title={`${count} Groups / Teams`}
                >
                  {count} {count >= 8 ? '⭐ ' : ''}Groups
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoBalance}
              className="px-5 py-2.5 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 text-white text-xs sm:text-sm font-extrabold shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>Re-run Auto-Balance</span>
            </button>
          </div>
        </div>

        {/* Balance Status Meter - Visualizing Energy and Age Spread */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Kalahok:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-black">
                {registrations.length} Tao
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700">Koponan:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0038A8] font-black">
                {numTeams} Active Teams
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span>Bata (&le;{AGE_TIER_CONFIG.youngMax}y):</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-black border border-emerald-200" title="Pantay na bilang ng mga mas bata na may lakas tumakbo sa mga laro">
                {minYoung === maxYoung ? `${minYoung}` : `${minYoung}–${maxYoung}`} bawat team
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                <span>Nakatatanda (&ge;{AGE_TIER_CONFIG.olderMin}y):</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-black border border-purple-200" title="Pantay na bilang ng nakatatanda para sa suporta, cheering, at gabay">
                {minOlder === maxOlder ? `${minOlder}` : `${minOlder}–${maxOlder}`} bawat team
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 shadow-2xs ${
                isEnergySpreadBalanced
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {isEnergySpreadBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <span>
                {isEnergySpreadBalanced
                  ? 'Patas ang Enerhiya & Edad sa Lahat ng Team'
                  : 'May Bahagyang Agwat sa Distribusyon'}
              </span>
            </span>
          </div>
        </div>

        {/* Main Content - Dynamic Responsive Team Columns (Supporting 8, 9, 10 groups cleanly) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {teamStats.map(({ team, members, averageAge, ageDistribution, genderCount }) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Team Header */}
                <div
                  className="p-3.5 text-white text-center relative"
                  style={{ backgroundColor: team.color }}
                >
                  <span className="text-2xl block mb-0.5">{team.iconName}</span>
                  <h4 className="text-sm font-black tracking-tight leading-tight">{team.name}</h4>
                  <p className="text-[10px] text-white/90 italic truncate mt-0.5">{team.tagline}</p>
                </div>

                {/* Team Metrics Summary - Highlighting Energy/Age Tiers */}
                <div className="p-2.5 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[9px] text-slate-400 uppercase font-black block">Members</span>
                    <span className="font-black text-slate-800 text-xs">{members.length}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-2xs" title="Mas bata, mataas ang enerhiya para sa laro">
                    <span className="text-[9px] text-emerald-700 uppercase font-black block flex items-center justify-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" /> &le;{AGE_TIER_CONFIG.youngMax}y
                    </span>
                    <span className="font-black text-emerald-800 text-xs">{ageDistribution.young} active</span>
                  </div>
                  <div className="bg-white p-1.5 rounded-xl border border-purple-200 bg-purple-50/40 shadow-2xs" title="Nakatatanda / suporta / cheering">
                    <span className="text-[9px] text-purple-700 uppercase font-black block flex items-center justify-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 fill-purple-600 text-purple-600" /> &ge;{AGE_TIER_CONFIG.olderMin}y
                    </span>
                    <span className="font-black text-purple-800 text-xs">{ageDistribution.older} veteran</span>
                  </div>
                  <div className="col-span-3 bg-white p-1 rounded-xl border border-slate-200 text-[10px] flex justify-around font-bold">
                    <span className="text-blue-700">👦 {genderCount.male} M</span>
                    <span className="text-rose-600">👩 {genderCount.female} F</span>
                    <span className="text-slate-600 font-medium">🏃 {ageDistribution.mid} Mid-Age</span>
                  </div>
                </div>

                {/* Member Roster with quick manual dropdown */}
                <div className="p-2 space-y-1.5 flex-1 max-h-64 overflow-y-auto">
                  {members.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 font-medium">
                      Walang miyembro. I-click ang "Auto-Balance".
                    </div>
                  ) : (
                    members.map(member => (
                      <div
                        key={member.id}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 text-xs transition-colors flex items-center justify-between gap-1"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 truncate text-[11px]">
                            {member.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            {member.age <= AGE_TIER_CONFIG.youngMax ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[9px] inline-flex items-center gap-0.5" title="Mas Bata / High Energy">
                                <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                                {member.age}y
                              </span>
                            ) : member.age >= AGE_TIER_CONFIG.olderMin ? (
                              <span className="px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800 font-extrabold text-[9px] inline-flex items-center gap-0.5" title="Nakatatanda / Support & Cheering">
                                <Heart className="w-2.5 h-2.5 fill-purple-600 text-purple-600" />
                                {member.age}y
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-slate-700 font-semibold text-[9px]">
                                {member.age}y
                              </span>
                            )}
                            <span className="text-slate-300">•</span>
                            <span className="truncate max-w-[70px] text-slate-500 font-medium">{member.department}</span>
                          </div>
                        </div>

                        {/* Quick Team Switcher */}
                        <select
                          value={assignments[member.id!] || ''}
                          onChange={e => handleManualAssign(member.id!, e.target.value)}
                          className="text-[9px] py-1 px-1 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 focus:border-[#0038A8] outline-hidden shrink-0 max-w-[85px] cursor-pointer"
                        >
                          {currentTeams.map(t => (
                            <option key={t.id} value={t.name}>
                              {t.name.replace('Team ', '')}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 text-center sm:text-left font-medium">
            💡 Sinusuportahan ang <strong>2 hanggang 10 Groups</strong>. Pagkatapos i-balance, i-click ang <strong>"I-save ang Teams sa Firebase"</strong>.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Kanselahin
            </button>
            <button
              onClick={handleSaveToFirebase}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Isinesave sa Firestore...' : 'I-save ang Teams sa Firebase'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
