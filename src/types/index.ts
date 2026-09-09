export interface DepartmentItem {
  name: string;
  units: string[];
  description: string;
}

export const DEPARTMENT_DETAILS: DepartmentItem[] = [
  {
    name: 'Customer Success and Service Delivery Management',
    units: [
      'Customer Excellence & Operations',
      'Service Delivery Management',
      'Managed Services Monitoring and Operations – Managed Systems',
      'Managed Services Monitoring and Operations – Managed SOC',
      'Managed Services Monitoring and Operations – SOC Engineering',
      'Managed Services Monitoring and Operations – Managed NOC',
      'Nexusguard'
    ],
    description: 'Customer Excellence, SDM, Managed NOC/SOC/Systems, Nexusguard'
  },
  {
    name: 'Enterprise Sales (Non-Banking) (SI)',
    units: [
      'ENT Sales',
      'ENT Technology Solutions'
    ],
    description: 'ENT Sales, ENT Technology Solutions'
  },
  {
    name: 'Financial Services and Investment Banking (SI)',
    units: [
      'FSI Sales',
      'FSI Technology Solutions'
    ],
    description: 'FSI Sales, FSI Technology Solutions'
  },
  {
    name: 'Governance, Risk, Compliance and Information Security',
    units: [
      'GRC',
      'GRC Information Security'
    ],
    description: 'GRC, GRC Information Security'
  },
  {
    name: 'Information and Communications Technology',
    units: [
      'IT Security Operations',
      'Network Engineering',
      'Network Operations'
    ],
    description: 'IT Security Operations, Network Engineering, Network Operations'
  },
  {
    name: 'Management',
    units: [
      'General Management Unit'
    ],
    description: 'General Management Unit'
  },
  {
    name: 'Marketing',
    units: [
      'General Marketing Unit'
    ],
    description: 'General Marketing Unit'
  },
  {
    name: 'Operations',
    units: [
      'Operations Excellence',
      'Sales Excellence',
      'Billing & Collection'
    ],
    description: 'Operations Excellence, Sales Excellence, Billing & Collection'
  },
  {
    name: 'Organizational Capability and Design',
    units: [
      'OCD',
      'TIM Sales Acceleration Program (TSAP)'
    ],
    description: 'OCD, TIM Sales Acceleration Program (TSAP)'
  },
  {
    name: 'Project Management Office',
    units: [
      'Project Management Office',
      'Program Management',
      'Business and Systems Consultant Unit',
      'PMO Operations',
      'Mondelez'
    ],
    description: 'PMO, Program Management, Business & Systems Consultant, Mondelez'
  },
  {
    name: 'Technical Solutions Delivery',
    units: [
      'TSD – Cloud Ops, L2/L3',
      'TSD – Cloud Engineering',
      'TSD – Cloud Security',
      'TSD – Offensive Security (Red Team)',
      'TSD – SI Network Security',
      'TSD – SI Systems',
      'TSD – SI Tools & Apps'
    ],
    description: 'Cloud Ops, Cloud Engineering, Security, Red Team, SI Systems'
  },
  {
    name: 'Technology Solutions and ICT Products',
    units: [
      'Technology Solutions',
      'ICT Products & Engineering'
    ],
    description: 'Technology Solutions, ICT Products & Engineering'
  },
  {
    name: 'Value Added Services',
    units: [
      'VAS Sales',
      'VAS Technology Solutions',
      'VAS Products and Innovation',
      'VAS Operations',
      'VAS Channel & Partnerships'
    ],
    description: 'VAS Sales, Tech, Products & Innovation, Operations, Partnerships'
  }
];

export const DEPARTMENTS = [
  'Customer Success and Service Delivery Management',
  'Enterprise Sales (Non-Banking) (SI)',
  'Financial Services and Investment Banking (SI)',
  'Governance, Risk, Compliance and Information Security',
  'Information and Communications Technology',
  'Management',
  'Marketing',
  'Operations',
  'Organizational Capability and Design',
  'Project Management Office',
  'Technical Solutions Delivery',
  'Technology Solutions and ICT Products',
  'Value Added Services'
] as const;

export type Department = typeof DEPARTMENTS[number];

/**
 * Returns the unit descriptions for a department, with tolerant matching for legacy department names.
 */
export function getDepartmentUnits(departmentName: string): string[] {
  if (!departmentName) return [];
  const normalized = departmentName.trim().toLowerCase();
  const match = DEPARTMENT_DETAILS.find(d => {
    const dName = d.name.toLowerCase();
    if (dName === normalized) return true;
    if (normalized.includes('financial services') && dName.includes('financial services')) return true;
    if (normalized.includes('enterprise sales') && dName.includes('enterprise sales')) return true;
    if (normalized.includes('technical solutions') && dName.includes('technical solutions')) return true;
    if (normalized.includes('technology solutions') && dName.includes('technology solutions')) return true;
    return false;
  });
  return match?.units || [];
}

export interface Registration {
  id?: string;
  fullName: string;
  nickname?: string; // Palayaw
  age: number;
  gender: 'Male' | 'Female' | string;
  department: string;
  medicalNotes?: string;
  assignedTeam?: string | null;
  status: 'confirmed' | 'pending' | 'checked-in' | 'cancelled';
  createdAt: string;

  // Legacy / optional fields for backwards compatibility
  customDepartment?: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  shirtSize?: string;
  shirtGenderCut?: 'Men' | 'Women' | string;
  shirtUpdatedDate?: string;
  favoriteGames?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface ShirtMeasurement {
  size: string;
  length: number; // inches
  widthPaikot: number; // circumference in inches
  flatWidth: number; // flat chest / armpit to armpit (widthPaikot / 2) in inches
}

export const MENS_SHIRT_SIZES: ShirtMeasurement[] = [
  { size: 'XS', length: 27, widthPaikot: 36, flatWidth: 18 },
  { size: 'S', length: 28, widthPaikot: 38, flatWidth: 19 },
  { size: 'M', length: 29, widthPaikot: 40, flatWidth: 20 },
  { size: 'L', length: 30, widthPaikot: 42, flatWidth: 21 },
  { size: 'XL', length: 31, widthPaikot: 44, flatWidth: 22 },
  { size: '2XL', length: 32, widthPaikot: 46, flatWidth: 23 },
  { size: '3XL', length: 33, widthPaikot: 48, flatWidth: 24 },
  { size: '4XL', length: 34, widthPaikot: 50, flatWidth: 25 },
  { size: '5XL', length: 35, widthPaikot: 52, flatWidth: 26 },
];

export const WOMENS_SHIRT_SIZES: ShirtMeasurement[] = [
  { size: 'XS', length: 24, widthPaikot: 34, flatWidth: 17 },
  { size: 'S', length: 25, widthPaikot: 36, flatWidth: 18 },
  { size: 'M', length: 26, widthPaikot: 38, flatWidth: 19 },
  { size: 'L', length: 27, widthPaikot: 40, flatWidth: 20 },
  { size: 'XL', length: 28, widthPaikot: 42, flatWidth: 21 },
  { size: '2XL', length: 29, widthPaikot: 44, flatWidth: 22 },
  { size: '3XL', length: 30, widthPaikot: 46, flatWidth: 23 },
  { size: '4XL', length: 31, widthPaikot: 48, flatWidth: 24 },
  { size: '5XL', length: 32, widthPaikot: 50, flatWidth: 25 },
];

export const ALL_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;

export interface GameMasterAssignment {
  id?: string;
  gameName: string;
  gameMaster: string;
  court: string; // e.g. "Court 1", "Court 2", "Court 3", "Court 4", "Court 5", "Court 6"
  time: string; // e.g. "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM"
  notes?: string;
  order?: number;
  createdAt?: string;
}

export interface Team {
  id: string;
  name: string;
  tagline: string;
  color: string;
  bgBadge: string;
  borderBadge: string;
  textBadge: string;
  iconName: string;
}

export const FILIPINO_GAMES = [
  {
    id: 'patintero',
    name: 'Patintero',
    tagline: 'Harangang Taga',
    category: 'Agility & Strategy',
    description: 'Bilis ng takbo at galing sa pag-ilag laban sa mga tagabantay sa linya.',
    icon: '🏃‍♂️',
    intensity: 'High'
  },
  {
    id: 'tumbang-preso',
    name: 'Tumbang Preso',
    tagline: 'Tamaan ang Lata',
    category: 'Precision & Speed',
    description: 'Gamitin ang pamato upang patumbahin ang lata habang umiiwas sa taya.',
    icon: '🥫',
    intensity: 'Medium'
  },
  {
    id: 'hilahang-lubid',
    name: 'Hilahang Lubid',
    tagline: 'Tug of War',
    category: 'Pure Strength & Teamwork',
    description: 'Sama-samang lakas at pwersa upang mahila ang kalabang koponan.',
    icon: '🪢',
    intensity: 'High'
  },
  {
    id: 'karera-ng-sako',
    name: 'Karera ng Sako',
    tagline: 'Sack Race Relay',
    category: 'Balance & Speed',
    description: 'Lukso at talon hanggang sa finish line gamit ang sako ng bigas.',
    icon: '🥔',
    intensity: 'Medium'
  },
  {
    id: 'kadang-kadang',
    name: 'Kadang-Kadang',
    tagline: 'Bao & Bamboo Stilts',
    category: 'Balance & Rhythm',
    description: 'Balanse sa bao ng niyog na may lubid o patpat na kawayan.',
    icon: '🥥',
    intensity: 'Medium'
  },
  {
    id: 'agawan-base',
    name: 'Agawan Base',
    tagline: 'Capture the Base',
    category: 'Strategy & Stamina',
    description: 'Agawan ng teritoryo at pagligtas sa mga bihag na kakampi.',
    icon: '🚩',
    intensity: 'High'
  },
  {
    id: 'luksong-baka',
    name: 'Luksong Baka',
    tagline: 'Jump Over the Cow',
    category: 'Elevation & Acrobatics',
    description: 'Pagtalon sa ibabaw ng nakayukong kalaro nang hindi sumasayad.',
    icon: '🐂',
    intensity: 'High'
  },
  {
    id: 'piko',
    name: 'Piko',
    tagline: 'Hopscotch',
    category: 'Balance & Hop',
    description: 'Paghagis ng pamato sa mga kahon at pagtalon sa isang paa.',
    icon: '🩴',
    intensity: 'Low'
  },
  {
    id: 'sipa',
    name: 'Sipa',
    tagline: 'Lead Washer Kick',
    category: 'Coordination & Focus',
    description: 'Pagsipa sa tingga na may balahibo nang hindi lumalapag sa lupa.',
    icon: '🪶',
    intensity: 'Medium'
  },
  {
    id: 'holen',
    name: 'Holen / Jolen',
    tagline: 'Marbles Target',
    category: 'Focus & Precision',
    description: 'Asinta at pitik ng marmol na holen papunta sa target o butas.',
    icon: '🔮',
    intensity: 'Low'
  }
] as const;

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 'team-asul',
    name: 'Team Asul (Agila)',
    tagline: 'Bilis at Lipad ng Agila',
    color: '#0038A8',
    bgBadge: 'bg-blue-100',
    borderBadge: 'border-blue-300',
    textBadge: 'text-blue-800',
    iconName: '🦅'
  },
  {
    id: 'team-pula',
    name: 'Team Pula (Tamaraw)',
    tagline: 'Lakas at Sigla ng Tamaraw',
    color: '#CE1126',
    bgBadge: 'bg-red-100',
    borderBadge: 'border-red-300',
    textBadge: 'text-red-800',
    iconName: '🐃'
  },
  {
    id: 'team-dilaw',
    name: 'Team Dilaw (Araw)',
    tagline: 'Liwanag at Init ng Tagumpay',
    color: '#D97706',
    bgBadge: 'bg-amber-100',
    borderBadge: 'border-amber-300',
    textBadge: 'text-amber-800',
    iconName: '☀️'
  },
  {
    id: 'team-berde',
    name: 'Team Berde (Haribon)',
    tagline: 'Katatagan at Diwang Bayanihan',
    color: '#059669',
    bgBadge: 'bg-emerald-100',
    borderBadge: 'border-emerald-300',
    textBadge: 'text-emerald-800',
    iconName: '🌿'
  },
  {
    id: 'team-lila',
    name: 'Team Lila (Mayon)',
    tagline: 'Alab at Pasyon ng Bulkang Mayon',
    color: '#7C3AED',
    bgBadge: 'bg-purple-100',
    borderBadge: 'border-purple-300',
    textBadge: 'text-purple-800',
    iconName: '🌋'
  },
  {
    id: 'team-kahel',
    name: 'Team Kahel (Banyuhay)',
    tagline: 'Bagong Sibol at Nagbabagang Diwa',
    color: '#EA580C',
    bgBadge: 'bg-orange-100',
    borderBadge: 'border-orange-300',
    textBadge: 'text-orange-800',
    iconName: '🔥'
  },
  {
    id: 'team-rosas',
    name: 'Team Rosas (Sampaguita)',
    tagline: 'Bango ng Tagumpay at Kagitingan',
    color: '#DB2777',
    bgBadge: 'bg-pink-100',
    borderBadge: 'border-pink-300',
    textBadge: 'text-pink-800',
    iconName: '🌸'
  },
  {
    id: 'team-kayumanggi',
    name: 'Team Kayumanggi (Maharlika)',
    tagline: 'Dangal at Tapang ng Maharlika',
    color: '#854D0E',
    bgBadge: 'bg-yellow-100',
    borderBadge: 'border-yellow-300',
    textBadge: 'text-yellow-800',
    iconName: '🛡️'
  },
  {
    id: 'team-bughaw',
    name: 'Team Bughaw (Alon)',
    tagline: 'Lakas at Daluyong ng Karagatan',
    color: '#0891B2',
    bgBadge: 'bg-cyan-100',
    borderBadge: 'border-cyan-300',
    textBadge: 'text-cyan-800',
    iconName: '🌊'
  },
  {
    id: 'team-pilak',
    name: 'Team Pilak (Tala)',
    tagline: 'Ningning at Talino ng mga Bituin',
    color: '#475569',
    bgBadge: 'bg-slate-100',
    borderBadge: 'border-slate-300',
    textBadge: 'text-slate-800',
    iconName: '⭐'
  }
];
