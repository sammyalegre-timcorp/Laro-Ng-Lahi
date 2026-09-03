import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Calendar,
  Building,
  Mail,
  User,
  ArrowRight
} from 'lucide-react';
import { Registration } from '../types';
import { deleteRegistration, batchDeleteRegistrations } from '../firebase/registrations';

interface DuplicateResolverModalProps {
  duplicateGroups: Registration[][];
  onClose: () => void;
  onResolved: (message: string) => void;
}

export const DuplicateResolverModal: React.FC<DuplicateResolverModalProps> = ({
  duplicateGroups,
  onClose,
  onResolved
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedKeepMap, setSelectedKeepMap] = useState<Record<number, string>>(() => {
    // Default each group to keep the newest record (or record with assigned team)
    const initial: Record<number, string> = {};
    duplicateGroups.forEach((group, groupIdx) => {
      const sorted = [...group].sort((a, b) => {
        // Prefer one with assignedTeam
        if (a.assignedTeam && !b.assignedTeam) return -1;
        if (!a.assignedTeam && b.assignedTeam) return 1;
        // Prefer one with email
        if (a.email && !b.email) return -1;
        if (!a.email && b.email) return 1;
        // Otherwise newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      if (sorted[0]?.id) {
        initial[groupIdx] = sorted[0].id;
      }
    });
    return initial;
  });

  const totalDuplicatesToRemove = duplicateGroups.reduce(
    (acc, group) => acc + (group.length - 1),
    0
  );

  const handleKeepSingle = async (group: Registration[], keepId: string) => {
    const toDelete = group
      .filter(r => r.id && r.id !== keepId)
      .map(r => r.id as string);

    if (toDelete.length === 0) return;

    try {
      setIsProcessing(true);
      await batchDeleteRegistrations(toDelete);
      onResolved(`Na-alis ang ${toDelete.length} duplicate copy.`);
    } catch (err) {
      console.error('Failed to resolve duplicate:', err);
      alert('Nagkaroon ng problema sa pag-alis ng duplicate.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteIndividual = async (id: string) => {
    try {
      setIsProcessing(true);
      await deleteRegistration(id);
      onResolved('Na-delete ang kopya ng duplicate.');
    } catch (err) {
      console.error('Failed to delete duplicate entry:', err);
      alert('Hindi na-delete ang entry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAutoCleanAll = async () => {
    const allToDelete: string[] = [];

    duplicateGroups.forEach((group, groupIdx) => {
      const keepId = selectedKeepMap[groupIdx] || group[0]?.id;
      group.forEach(r => {
        if (r.id && r.id !== keepId) {
          allToDelete.push(r.id);
        }
      });
    });

    if (allToDelete.length === 0) return;

    const confirmed = window.confirm(
      `Sigurado ka bang nais linisin ang ${allToDelete.length} duplicate registrations? Pananatilihin ang napiling pinakamainam na kopya para sa bawat kalahok.`
    );
    if (!confirmed) return;

    try {
      setIsProcessing(true);
      await batchDeleteRegistrations(allToDelete);
      onResolved(`Matagumpay na nalinis ang ${allToDelete.length} duplicate registrations!`);
      onClose();
    } catch (err) {
      console.error('Failed to auto clean duplicates:', err);
      alert('Nagkaroon ng problema sa pag-clean ng duplicates.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#CE1126] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <AlertTriangle className="w-6 h-6 text-[#FFCD00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                  Duplicate Attendee Resolver
                </span>
                <span className="text-xs bg-[#FFCD00] text-slate-900 font-bold px-2 py-0.5 rounded-full">
                  {duplicateGroups.length} Grupo
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                Ayusin ang mga Duplicate na Kalahok
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Callout */}
        <div className="p-4 sm:p-5 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start gap-2.5 text-xs text-amber-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              May natuklasang <strong>{totalDuplicatesToRemove} sobrang duplicate na rehistrasyon</strong> mula sa {duplicateGroups.length} kalahok.
              Pumili kung aling kopya ang pananatilihin o i-click ang Auto-Clean.
            </div>
          </div>
          <button
            onClick={handleAutoCleanAll}
            disabled={isProcessing || duplicateGroups.length === 0}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#FFCD00]" />
            <span>1-Click Auto-Clean Lahat</span>
          </button>
        </div>

        {/* Duplicate Groups List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {duplicateGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-[#00A86B] mx-auto mb-3" />
              <h3 className="font-black text-slate-900 text-lg">Walang Natagpuang Duplicates!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Lahat ng mga nakarehistrong kalahok ay may natatanging pangalan at email.
              </p>
            </div>
          ) : (
            duplicateGroups.map((group, groupIdx) => {
              const primaryName = group[0]?.fullName || 'Kalahok';
              const keepId = selectedKeepMap[groupIdx] || group[0]?.id;

              return (
                <div
                  key={groupIdx}
                  className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Group Header */}
                  <div className="p-3.5 sm:p-4 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#0038A8]" />
                      <h3 className="font-black text-slate-900 text-sm sm:text-base">
                        {primaryName}
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#CE1126]/10 text-[#CE1126]">
                        {group.length} rehistrasyon
                      </span>
                    </div>

                    <button
                      onClick={() => handleKeepSingle(group, keepId)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-[#00A86B] hover:bg-[#008f5b] text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Panatilihin ang Napili</span>
                    </button>
                  </div>

                  {/* Group Copies */}
                  <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.map((item, itemIdx) => {
                      const isSelectedToKeep = keepId === item.id;

                      return (
                        <div
                          key={item.id || itemIdx}
                          onClick={() => {
                            if (item.id) {
                              setSelectedKeepMap(prev => ({
                                ...prev,
                                [groupIdx]: item.id!
                              }));
                            }
                          }}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer relative ${
                            isSelectedToKeep
                              ? 'border-[#0038A8] bg-blue-50/50 shadow-xs'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`keep-group-${groupIdx}`}
                                checked={isSelectedToKeep}
                                onChange={() => {
                                  if (item.id) {
                                    setSelectedKeepMap(prev => ({
                                      ...prev,
                                      [groupIdx]: item.id!
                                    }));
                                  }
                                }}
                                className="w-4 h-4 text-[#0038A8] focus:ring-[#0038A8]"
                              />
                              <span className="text-xs font-bold text-slate-800">
                                Kopya #{itemIdx + 1}
                              </span>
                            </div>

                            {isSelectedToKeep ? (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0038A8] text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Pananatilihin
                              </span>
                            ) : (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  if (item.id) handleDeleteIndividual(item.id);
                                }}
                                disabled={isProcessing}
                                title="Burahin itong kopya"
                                className="text-slate-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="space-y-1 text-xs text-slate-600">
                            <div>
                              Palayaw: <strong className="text-slate-900 font-bold">{item.nickname || '-'}</strong>
                            </div>
                            {item.email && (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-[#0038A8]">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Edad: <strong className="text-slate-700">{item.age}</strong></span>
                              <span>Kasarian: <strong className="text-slate-700">{item.gender}</strong></span>
                              <span>Dept: <strong className="text-slate-700">{item.department}</strong></span>
                            </div>
                            {item.assignedTeam && (
                              <div className="text-[11px] font-bold text-purple-700">
                                Koponan: {item.assignedTeam}
                              </div>
                            )}
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                              <span>Petsa: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="font-mono">ID: {item.id?.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-600 cursor-pointer"
          >
            Isara (Close)
          </button>

          {duplicateGroups.length > 0 && (
            <button
              onClick={handleAutoCleanAll}
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-[#CE1126] hover:bg-[#a80e1e] text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Linisin ang mga Duplicate ({totalDuplicatesToRemove})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
