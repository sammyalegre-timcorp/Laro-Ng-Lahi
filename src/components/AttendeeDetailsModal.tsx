import React, { useState } from 'react';
import {
  X,
  User,
  Trash2,
  Save,
  Shield,
  HeartPulse,
  Edit3
} from 'lucide-react';
import { Registration, Team, DEFAULT_TEAMS, DEPARTMENTS } from '../types';
import { updateRegistration, deleteRegistration } from '../firebase/registrations';
import { getTeamBadgeStyle } from '../utils/teamUtils';

interface AttendeeDetailsModalProps {
  attendee: Registration;
  teams?: Team[];
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export const AttendeeDetailsModal: React.FC<AttendeeDetailsModalProps> = ({
  attendee,
  teams = DEFAULT_TEAMS,
  onClose,
  onUpdated,
  onDeleted
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<Registration>({ ...attendee });
  const [customDeptText, setCustomDeptText] = useState(
    attendee.department && !(DEPARTMENTS as readonly string[]).includes(attendee.department)
      ? attendee.department
      : ''
  );

  const handleSave = async () => {
    if (!attendee.id) return;
    try {
      setIsSaving(true);
      const isCustomDept = formData.department === 'Ibang Departamento' || formData.department === 'Iba' || !(DEPARTMENTS as readonly string[]).includes(formData.department);
      const finalDepartment = isCustomDept
        ? (customDeptText.trim() || 'Ibang Departamento')
        : formData.department.trim();

      await updateRegistration(attendee.id, {
        fullName: formData.fullName.trim(),
        nickname: formData.nickname?.trim() || '',
        age: Number(formData.age),
        gender: formData.gender,
        department: finalDepartment,
        assignedTeam: formData.assignedTeam || null,
        status: formData.status,
        medicalNotes: formData.medicalNotes?.trim() || ''
      });
      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to update registration:', err);
      alert('Hindi nai-save ang pagbabago. Pakisubukang muli.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!attendee.id) return;
    try {
      setIsDeleting(true);
      await deleteRegistration(attendee.id);
      onClose();
      if (onDeleted) onDeleted();
      else if (onUpdated) onUpdated();
    } catch (err) {
      console.error('Failed to delete registration:', err);
      alert('Hindi na-delete ang kalahok. Pakisubukang muli.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0038A8] p-5 text-white flex items-center justify-between relative">
          <div className="h-1.5 w-full bg-[#CE1126] absolute top-0 left-0"></div>
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#FFCD00]" />
            <h3 className="text-lg font-black tracking-tight">
              {isEditing ? 'I-edit ang Impormasyon ng Kalahok' : 'Detalye ng Kalahok'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isEditing ? (
            /* Editing Form Mode */
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Palayaw / Nickname</label>
                  <input
                    type="text"
                    value={formData.nickname || ''}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Edad (Age)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Kasarian (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-medium cursor-pointer"
                  >
                    <option value="Male">Male (Lalaki)</option>
                    <option value="Female">Female (Babae)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Departamento</label>
                  <select
                    value={
                      formData.department === 'Ibang Departamento' || formData.department === 'Iba' || !(DEPARTMENTS as readonly string[]).includes(formData.department)
                        ? 'Ibang Departamento'
                        : formData.department
                    }
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'Ibang Departamento') {
                        setFormData({ ...formData, department: 'Ibang Departamento' });
                      } else {
                        setFormData({ ...formData, department: val });
                        setCustomDeptText('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-medium cursor-pointer"
                  >
                    <option value="" disabled>-- Pumili ng Departamento --</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                    <option value="Ibang Departamento">Ibang Departamento</option>
                  </select>

                  {(formData.department === 'Ibang Departamento' || formData.department === 'Iba' || !(DEPARTMENTS as readonly string[]).includes(formData.department)) && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={customDeptText}
                        onChange={e => {
                          setCustomDeptText(e.target.value);
                          setFormData(prev => ({ ...prev, department: e.target.value }));
                        }}
                        placeholder="I-type ang Departamento..."
                        className="w-full px-3.5 py-2 rounded-xl border-2 border-blue-200 focus:border-[#0038A8] outline-hidden font-medium text-sm bg-blue-50/40"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Assigned Team</label>
                  <select
                    value={formData.assignedTeam || ''}
                    onChange={e => setFormData({ ...formData, assignedTeam: e.target.value || null })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-blue-200 bg-blue-50/50 font-bold text-[#0038A8] focus:border-[#0038A8] outline-hidden cursor-pointer"
                  >
                    <option value="">(Unassigned)</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.name}>{t.iconName ? `${t.iconName} ` : ''}{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Registration Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden font-bold cursor-pointer"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="checked-in">Checked-In (Onsite)</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500">
                      Medical / Health Notes <span className="text-[#CE1126]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, medicalNotes: 'N/A' })}
                      className="text-[10px] font-bold text-[#0038A8] hover:underline"
                    >
                      I-set bilang "N/A"
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={formData.medicalNotes || ''}
                    onChange={e => setFormData({ ...formData, medicalNotes: e.target.value })}
                    placeholder='Hal. Asthma, knee injury, o "N/A" kung walang sakit'
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#0038A8] outline-hidden text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* View Details Mode */
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="flex items-start justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                    {attendee.fullName}
                  </h4>
                  {attendee.nickname && (
                    <p className="text-sm text-slate-600 mt-0.5">
                      Palayaw: <strong className="text-[#0038A8]">"{attendee.nickname}"</strong>
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-[#0038A8]/10 text-[#0038A8] font-bold">
                      {attendee.department}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-mono">
                      ID: {attendee.id?.slice(0, 8)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-black tracking-widest">Koponan</span>
                  <span className="text-xs font-black text-[#0038A8] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs inline-block mt-1">
                    {attendee.assignedTeam || 'Walang Team'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Edad</span>
                  <span className="text-lg font-black text-[#0038A8]">{attendee.age} yrs</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Kasarian</span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">{attendee.gender}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Status</span>
                  <span className="text-xs font-black text-[#00A86B] block mt-1 uppercase">{attendee.status}</span>
                </div>
              </div>

              {/* Medical Notes */}
              {attendee.medicalNotes && attendee.medicalNotes.trim().toUpperCase() !== 'N/A' && attendee.medicalNotes.trim().toUpperCase() !== 'NONE' ? (
                <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-red-700">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medical Notes / Paalala sa Kalusugan:</span>
                  </div>
                  <p className="text-slate-700 text-sm font-medium">{attendee.medicalNotes}</p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Medical Notes: <strong className="text-slate-800 font-mono">N/A</strong> (Walang iniindang sakit o injury)</span>
                </div>
              )}

              {/* Date registered */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 font-medium">
                <span>Narehistro noong: {attendee.createdAt ? new Date(attendee.createdAt).toLocaleString('en-PH') : 'N/A'}</span>
                <span>Firestore Sync Verified</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2 w-full justify-between animate-in fade-in">
              <span className="text-xs text-red-700 font-bold">Sigurado kang i-delete ang entry na ito?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  Kanselahin
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Oo, I-delete'}
                </button>
              </div>
            </div>
          ) : isEditing ? (
            <div className="flex items-center gap-2 w-full justify-end">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Kanselahin
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'I-save ang Pagbabago'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>I-delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-[#0038A8] hover:bg-[#002d86] text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>I-edit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
