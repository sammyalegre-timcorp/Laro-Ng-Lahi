import * as XLSX from 'xlsx';
import { Registration, normalizeDepartmentName } from '../types';

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
    'Department': normalizeDepartmentName(r.department) || 'Other',
    'Assigned Team': r.assignedTeam || 'Unassigned',
    'T-Shirt Fit': r.shirtGenderCut ? `${r.shirtGenderCut}'s Cut` : 'Pending',
    'T-Shirt Size': r.shirtSize || 'Pending',
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
    { wch: 16 }, // T-Shirt Fit
    { wch: 16 }, // T-Shirt Size
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
      'T-Shirt Size': '',
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
        'Department': normalizeDepartmentName(m.department) || '-',
        'T-Shirt Size': m.shirtSize ? `${m.shirtGenderCut || 'Men'}'s ${m.shirtSize}` : 'Pending',
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
    { wch: 18 },
    { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTeams, 'Team Rosters');

  // 3. T-Shirt Supplier Summary Sheet
  const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const tshirtSummaryData: any[] = [];
  
  const mensCount: Record<string, number> = {};
  const womensCount: Record<string, number> = {};
  SIZES.forEach(s => {
    mensCount[s] = 0;
    womensCount[s] = 0;
  });
  let pendingCount = 0;

  registrations.forEach(r => {
    if (!r.shirtSize) {
      pendingCount++;
      return;
    }
    const cut = r.shirtGenderCut === 'Women' ? 'Women' : 'Men';
    const sz = r.shirtSize;
    if (cut === 'Women') {
      womensCount[sz] = (womensCount[sz] || 0) + 1;
    } else {
      mensCount[sz] = (mensCount[sz] || 0) + 1;
    }
  });

  SIZES.forEach(size => {
    tshirtSummaryData.push({
      'Size': size,
      "Men's Cut (Crew Neck) Quantity": mensCount[size] || 0,
      "Women's Cut (V-Neck Fit) Quantity": womensCount[size] || 0,
      'Total Quantity per Size': (mensCount[size] || 0) + (womensCount[size] || 0)
    });
  });

  const totalMens = Object.values(mensCount).reduce((a, b) => a + b, 0);
  const totalWomens = Object.values(womensCount).reduce((a, b) => a + b, 0);
  tshirtSummaryData.push({
    'Size': 'TOTAL ORDERED',
    "Men's Cut (Crew Neck) Quantity": totalMens,
    "Women's Cut (V-Neck Fit) Quantity": totalWomens,
    'Total Quantity per Size': totalMens + totalWomens
  });
  tshirtSummaryData.push({
    'Size': 'PENDING / NO SIZE SELECTED',
    "Men's Cut (Crew Neck) Quantity": '-',
    "Women's Cut (V-Neck Fit) Quantity": '-',
    'Total Quantity per Size': pendingCount
  });

  const wsTshirt = XLSX.utils.json_to_sheet(tshirtSummaryData);
  wsTshirt['!cols'] = [
    { wch: 18 },
    { wch: 32 },
    { wch: 34 },
    { wch: 26 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTshirt, 'T-Shirt Supplier Orders');

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
    'T-Shirt Fit',
    'T-Shirt Size',
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
    escapeCSV(normalizeDepartmentName(r.department) || ''),
    escapeCSV(r.assignedTeam || 'Unassigned'),
    escapeCSV(r.shirtGenderCut ? `${r.shirtGenderCut}'s Cut` : 'Pending'),
    escapeCSV(r.shirtSize || 'Pending'),
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
