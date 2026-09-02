import { Team, DEFAULT_TEAMS } from '../types';

export const PRESET_TEAM_COLORS = [
  { name: 'Navy Blue', hex: '#0038A8' },
  { name: 'Fiesta Red', hex: '#CE1126' },
  { name: 'Golden Sun', hex: '#D97706' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Mayon Purple', hex: '#7C3AED' },
  { name: 'Flaming Orange', hex: '#EA580C' },
  { name: 'Sampaguita Pink', hex: '#DB2777' },
  { name: 'Maharlika Bronze', hex: '#854D0E' },
  { name: 'Ocean Cyan', hex: '#0891B2' },
  { name: 'Tala Silver', hex: '#475569' },
  { name: 'Royal Indigo', hex: '#4338CA' },
  { name: 'Lime Green', hex: '#65A30D' },
  { name: 'Crimson Rose', hex: '#BE123C' },
  { name: 'Teal Blue', hex: '#0F766E' }
];

export const POPULAR_MASCOT_EMOJIS = [
  '🦅', '🐃', '☀️', '🌿', '🌋', '🔥', '🌸', '🛡️', '🌊', '⭐',
  '🦁', '🐯', '⚡', '🏆', '🥋', '🏹', '🐊', '🌴', '🥊', '🥥'
];

export function getTeamByName(name?: string | null, teams: Team[] = DEFAULT_TEAMS): Team | undefined {
  if (!name) return undefined;
  return teams.find(t => t.name.toLowerCase() === name.toLowerCase());
}

export function getTeamColor(teamName?: string | null, teams: Team[] = DEFAULT_TEAMS): string {
  if (!teamName) return '#64748B'; // slate-500
  const team = getTeamByName(teamName, teams);
  return team?.color || '#0038A8';
}

export function getTeamBadgeStyle(teamOrColor?: Team | string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  let hex = '#0038A8';
  if (typeof teamOrColor === 'string') {
    hex = teamOrColor.startsWith('#') ? teamOrColor : '#0038A8';
  } else if (teamOrColor?.color) {
    hex = teamOrColor.color;
  }

  // Generate pleasant alpha-blended badge styles
  return {
    backgroundColor: `${hex}18`, // ~10% opacity background
    color: hex,
    borderColor: `${hex}45` // ~27% opacity border
  };
}
