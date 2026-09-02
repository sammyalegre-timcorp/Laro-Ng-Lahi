import React, { useState } from 'react';
import { X, Printer } from 'lucide-react';
import { Registration, Team, DEFAULT_TEAMS } from '../types';

interface PrintableRosterModalProps {
  registrations: Registration[];
  teams?: Team[];
  onClose: () => void;
}

export const PrintableRosterModal: React.FC<PrintableRosterModalProps> = ({
  registrations,
  teams = DEFAULT_TEAMS,
  onClose
}) => {
  const [filterTeam, setFilterTeam] = useState<string>('all');

  const filteredRegistrations = registrations.filter(r => {
    if (filterTeam === 'all') return true;
    if (filterTeam === 'unassigned') return !r.assignedTeam;
    return r.assignedTeam === filterTeam;
  });

  // Group by team
  const teamGroups: Record<string, Registration[]> = {};
  filteredRegistrations.forEach(r => {
    const key = r.assignedTeam || 'Unassigned / Pending Allocation';
    if (!teamGroups[key]) teamGroups[key] = [];
    teamGroups[key].push(r);
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0038A8] p-5 text-white flex items-center justify-between shrink-0 print:hidden relative">
          <div className="h-1.5 w-full bg-[#CE1126] absolute top-0 left-0"></div>
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-[#FFCD00]" />
            <div>
              <h3 className="text-lg font-black tracking-tight">
                Printable Team Roster & Attendance Sheet
              </h3>
              <p className="text-xs text-blue-200">
                Opisyal na masterlist para sa attendance at onsite check-in
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

        {/* Filter Controls (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-600">I-filter ang Team:</span>
            <select
              value={filterTeam}
              onChange={e => setFilterTeam(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="all">Lahat ng Koponan (All Teams)</option>
              {teams.map(t => (
                <option key={t.id} value={t.name}>{t.iconName ? `${t.iconName} ` : ''}{t.name}</option>
              ))}
              <option value="unassigned">Unassigned Only</option>
            </select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>I-print Ngayon (Print / Save PDF)</span>
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 print:p-0 print:overflow-visible">
          {/* Printable Header */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b-2 border-slate-900 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl p-1 border border-slate-200 flex items-center justify-center shrink-0">
                <img
                  src="https://marketing.timcorp.net.ph/hubfs/Employee%20Appreciation%202026/laro%20ng%20lahi%20logo.png"
                  alt="Laro ng Lahi Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider">
                  LARO NG LAHI 2026 — PALARONG PINOY
                </h1>
                <p className="text-xs sm:text-sm font-bold text-[#0038A8] uppercase tracking-widest mt-0.5">
                  Official Team Rosters & Attendance Sign-in Log
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Nai-generate noong: {new Date().toLocaleString('en-PH')} • Kabuuang Kalahok: {filteredRegistrations.length}
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">TIM Corp</span>
              <span className="text-xs font-black text-slate-700">Official Roster Sheet</span>
            </div>
          </div>

          {Object.keys(teamGroups).sort().map(teamName => {
            const members = teamGroups[teamName];
            const avgAge = members.length
              ? (members.reduce((sum, m) => sum + m.age, 0) / members.length).toFixed(1)
              : '0';

            return (
              <div key={teamName} className="space-y-3 page-break-inside-avoid">
                <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-300 print:bg-slate-200">
                  <h4 className="font-black text-base text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>🏆</span>
                    <span>{teamName}</span>
                    <span className="text-xs font-normal text-slate-600 lowercase">
                      ({members.length} mga manlalaro)
                    </span>
                  </h4>
                  <span className="text-xs font-bold text-slate-700">
                    Average Age: {avgAge} yrs
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                        <th className="p-2 border-r border-slate-300">Pangalan ng Kalahok</th>
                        <th className="p-2 border-r border-slate-300 w-28">Palayaw</th>
                        <th className="p-2 border-r border-slate-300 w-14 text-center">Edad</th>
                        <th className="p-2 border-r border-slate-300 w-16 text-center">Kasarian</th>
                        <th className="p-2 border-r border-slate-300">Departamento</th>
                        <th className="p-2 border-r border-slate-300">Health / Medical Notes</th>
                        <th className="p-2 w-32 text-center">Lagda (Signature)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m, idx) => (
                        <tr key={m.id || idx} className="border-b border-slate-300 hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{m.fullName}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-700 font-semibold">{m.nickname || '-'}</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">{m.age}</td>
                          <td className="p-2 border-r border-slate-300 text-center">{m.gender.slice(0, 1)}</td>
                          <td className="p-2 border-r border-slate-300">{m.department}</td>
                          <td className="p-2 border-r border-slate-300 text-[11px] text-slate-600">{m.medicalNotes || '-'}</td>
                          <td className="p-2 border-slate-300 h-8"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
