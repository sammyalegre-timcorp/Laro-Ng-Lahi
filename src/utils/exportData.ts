import * as XLSX from 'xlsx';
import { Registration } from '../types';

export function getAgeBracket(age: number): string {
  if (age < 25) return 'Under 25';
  if (age <= 34) return '25 - 34';
  if (age <= 44) return '35 - 44';
  if (age <= 54) return '45 - 54';
  return '55 & Above';
}

export function exportToExcel(registrations: Registration[], filename = 'Laro_ng_Lahi_2026_Attendees') {
  const wb = XLSX.utils.book_new();

  // 1. All Attendees Sheet
  const attendeesData = registrations.map((r, index) => ({
    'No.': index + 1,
    'Registration ID': r.id || '',
    'Full Name': r.fullName,
    'Palayaw / Nickname': r.nickname || '-',
    'Employee Email': r.email || '-',
    'Age': r.age,
    'Age Group': getAgeBracket(r.age),
    'Gender': r.gender,
    'Department': r.department || 'Other',
    'Assigned Team': r.assignedTeam || 'Unassigned',
    'Medical / Health Notes': r.medicalNotes || 'None',
    'Status': r.status?.toUpperCase() || 'CONFIRMED',
    'Registered Date': r.createdAt ? new Date(r.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '-'
  }));

  const wsAttendees = XLSX.utils.json_to_sheet(attendeesData);
  
  // Set column widths
  wsAttendees['!cols'] = [
    { wch: 5 },  // No.
    { wch: 22 }, // Reg ID
    { wch: 26 }, // Full Name
    { wch: 18 }, // Nickname
    { wch: 32 }, // Email
    { wch: 8 },  // Age
    { wch: 14 }, // Age Group
    { wch: 16 }, // Gender
    { wch: 24 }, // Department
    { wch: 22 }, // Team
    { wch: 30 }, // Medical
    { wch: 14 }, // Status
    { wch: 22 }, // Date
  ];

  XLSX.utils.book_append_sheet(wb, wsAttendees, 'Master Attendee List');

  // 2. Team Roster Sheet
  const teamGroups: Record<string, Registration[]> = {};
  registrations.forEach(r => {
    const team = r.assignedTeam || 'Unassigned';
    if (!teamGroups[team]) teamGroups[team] = [];
    teamGroups[team].push(r);
  });

  const teamRosterData: any[] = [];
  Object.keys(teamGroups).sort().forEach(teamName => {
    const members = teamGroups[teamName];
    const avgAge = members.length ? (members.reduce((acc, m) => acc + m.age, 0) / members.length).toFixed(1) : '0';
    
    teamRosterData.push({
      'Team Name': `=== ${teamName.toUpperCase()} (${members.length} Members, Avg Age: ${avgAge}) ===`,
      'Player Name': '',
      'Palayaw': '',
      'Email': '',
      'Age': '',
      'Gender': '',
      'Department': '',
      'Medical Notes': ''
    });

    members.forEach((m, idx) => {
      teamRosterData.push({
        'Team Name': `${teamName}`,
        'Player Name': `${idx + 1}. ${m.fullName}`,
        'Palayaw': m.nickname || '-',
        'Email': m.email || '-',
        'Age': m.age,
        'Gender': m.gender,
        'Department': m.department || '-',
        'Medical Notes': m.medicalNotes || '-'
      });
    });

    // Blank row separator
    teamRosterData.push({});
  });

  const wsTeams = XLSX.utils.json_to_sheet(teamRosterData);
  wsTeams['!cols'] = [
    { wch: 26 },
    { wch: 28 },
    { wch: 16 },
    { wch: 32 },
    { wch: 8 },
    { wch: 14 },
    { wch: 24 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTeams, 'Team Rosters');

  // Generate and download
  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToCSV(registrations: Registration[], filename = 'Laro_ng_Lahi_2026_Attendees') {
  const headers = [
    'No',
    'Registration ID',
    'Full Name',
    'Palayaw / Nickname',
    'Employee Email',
    'Age',
    'Age Group',
    'Gender',
    'Department',
    'Assigned Team',
    'Medical / Health Notes',
    'Status',
    'Registered Date'
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = registrations.map((r, index) => [
    index + 1,
    escapeCSV(r.id || ''),
    escapeCSV(r.fullName),
    escapeCSV(r.nickname || ''),
    escapeCSV(r.email || ''),
    r.age,
    escapeCSV(getAgeBracket(r.age)),
    escapeCSV(r.gender),
    escapeCSV(r.department || ''),
    escapeCSV(r.assignedTeam || 'Unassigned'),
    escapeCSV(r.medicalNotes || ''),
    escapeCSV(r.status || 'confirmed'),
    escapeCSV(r.createdAt ? new Date(r.createdAt).toLocaleString('en-PH') : '')
  ].join(','));

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
