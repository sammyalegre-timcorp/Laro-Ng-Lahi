import { GameMasterAssignment } from '../types';

export interface CourtInfo {
  id: string; // 'court-1', 'court-2', etc.
  courtNumber: number;
  name: string; // 'Court 1'
  blueprintCode: string; // 'Badminton C1'
  fullName: string; // 'Court 1 • Badminton C1'
  type: 'badminton' | 'basketball_volleyball';
  sportLabel: string;
  // Visual positions on 1000x620 blueprint canvas
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  surfaceColor: string;
  linesColor: string;
}

export const VENUE_COURTS: CourtInfo[] = [
  {
    id: 'court-1',
    courtNumber: 1,
    name: 'Court 1',
    blueprintCode: 'Badminton C1',
    fullName: 'Court 1 • Badminton C1',
    type: 'badminton',
    sportLabel: 'Badminton Court',
    x: 550,
    y: 130,
    width: 155,
    height: 105,
    orientation: 'horizontal',
    surfaceColor: '#ea580c', // Matches orange in user's image
    linesColor: '#ffffff'
  },
  {
    id: 'court-2',
    courtNumber: 2,
    name: 'Court 2',
    blueprintCode: 'Badminton C2',
    fullName: 'Court 2 • Badminton C2',
    type: 'badminton',
    sportLabel: 'Badminton Court',
    x: 355,
    y: 130,
    width: 155,
    height: 105,
    orientation: 'horizontal',
    surfaceColor: '#ea580c',
    linesColor: '#ffffff'
  },
  {
    id: 'court-3',
    courtNumber: 3,
    name: 'Court 3',
    blueprintCode: 'Badminton C3',
    fullName: 'Court 3 • Badminton C3',
    type: 'badminton',
    sportLabel: 'Badminton Court',
    x: 160,
    y: 130,
    width: 155,
    height: 105,
    orientation: 'horizontal',
    surfaceColor: '#ea580c',
    linesColor: '#ffffff'
  },
  {
    id: 'court-4',
    courtNumber: 4,
    name: 'Court 4',
    blueprintCode: 'Badminton C4',
    fullName: 'Court 4 • Badminton C4',
    type: 'badminton',
    sportLabel: 'Badminton Court',
    x: 265,
    y: 285,
    width: 80,
    height: 190,
    orientation: 'vertical',
    surfaceColor: '#ea580c',
    linesColor: '#ffffff'
  },
  {
    id: 'court-5',
    courtNumber: 5,
    name: 'Court 5',
    blueprintCode: 'Badminton C5',
    fullName: 'Court 5 • Badminton C5',
    type: 'badminton',
    sportLabel: 'Badminton Court',
    x: 160,
    y: 285,
    width: 80,
    height: 190,
    orientation: 'vertical',
    surfaceColor: '#ea580c',
    linesColor: '#ffffff'
  },
  {
    id: 'court-6',
    courtNumber: 6,
    name: 'Court 6',
    blueprintCode: 'Basketball / Volleyball',
    fullName: 'Court 6 • Basketball / Volleyball Main Court',
    type: 'basketball_volleyball',
    sportLabel: 'Basketball & Volleyball Arena',
    x: 380,
    y: 285,
    width: 325,
    height: 190,
    orientation: 'horizontal',
    surfaceColor: '#ea580c',
    linesColor: '#ffffff'
  }
];

export const DEFAULT_EVENT_GAMES: GameMasterAssignment[] = [
  { id: 'def-1', gameName: 'Patintero', gameMaster: 'Game Master 1 (Arnel)', court: 'Court 1', time: '08:00 AM - 09:00 AM' },
  { id: 'def-2', gameName: 'Tumbang Preso', gameMaster: 'Game Master 2 (Bea)', court: 'Court 2', time: '08:00 AM - 09:00 AM' },
  { id: 'def-3', gameName: 'Hilahang Lubid (Tug of War)', gameMaster: 'Game Master 3 (Carlos)', court: 'Court 3', time: '09:00 AM - 10:00 AM' },
  { id: 'def-4', gameName: 'Karera ng Sako (Sack Race)', gameMaster: 'Game Master 4 (Dianne)', court: 'Court 4', time: '09:00 AM - 10:00 AM' },
  { id: 'def-5', gameName: 'Kadang-Kadang', gameMaster: 'Game Master 5 (Eric)', court: 'Court 5', time: '10:00 AM - 11:00 AM' },
  { id: 'def-6', gameName: 'Agawan Base', gameMaster: 'Game Master 6 (Faith)', court: 'Court 6', time: '10:00 AM - 11:00 AM' },
  { id: 'def-7', gameName: 'Luksong Baka', gameMaster: 'Game Master 7 (Gino)', court: 'Court 1', time: '01:00 PM - 02:00 PM' },
  { id: 'def-8', gameName: 'Piko', gameMaster: 'Game Master 8 (Hazel)', court: 'Court 2', time: '01:00 PM - 02:00 PM' },
  { id: 'def-9', gameName: 'Sipa', gameMaster: 'Game Master 9 (Ian)', court: 'Court 3', time: '02:00 PM - 03:00 PM' },
  { id: 'def-10', gameName: 'Luksong Tinik', gameMaster: 'Game Master 10 (Joy)', court: 'Court 4', time: '02:00 PM - 03:00 PM' },
  { id: 'def-11', gameName: 'Championship Finals (Volleyball)', gameMaster: 'Head Referee (Coach Marc)', court: 'Court 6', time: '03:00 PM - 04:30 PM' }
];

/**
 * Match any court string format (e.g. "Court 1", "Badminton C1", "C1", "Basketball")
 * to the corresponding CourtInfo.
 */
export function matchCourt(courtQuery: string | undefined | null): CourtInfo | null {
  if (!courtQuery) return null;
  const q = courtQuery.trim().toLowerCase();

  for (const c of VENUE_COURTS) {
    if (q === c.name.toLowerCase()) return c;
    if (q === c.blueprintCode.toLowerCase()) return c;
    if (q.includes(`court ${c.courtNumber}`) || q.includes(`c${c.courtNumber}`)) return c;
    if (c.courtNumber === 6 && (q.includes('basket') || q.includes('volley') || q.includes('main'))) return c;
  }

  // Exact digit matching
  const numMatch = q.match(/\b([1-6])\b/);
  if (numMatch) {
    const num = parseInt(numMatch[1], 10);
    return VENUE_COURTS.find(c => c.courtNumber === num) || null;
  }

  return null;
}

/**
 * Parse a single time string (e.g., "1:30 PM", "08:00 AM", "13:30") into total minutes from midnight.
 */
export function parseSingleTimeToMinutes(str: string): number | null {
  if (!str) return null;
  const clean = str.trim();

  // Handle 12-hour format: e.g. "1:30 PM", "01:30 PM", "8:00 AM", "12:00 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridiem = match12[3]?.toUpperCase();

    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Handle hour only with meridiem: e.g. "1 PM", "8 AM"
  const matchHour = clean.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (matchHour) {
    let hours = parseInt(matchHour[1], 10);
    const meridiem = matchHour[2].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60;
  }

  return null;
}

/**
 * Parse a time range string like "01:00 PM - 02:00 PM" into start and end minutes.
 */
export function parseTimeRangeToMinutes(rangeStr: string): { startMin: number; endMin: number } | null {
  if (!rangeStr) return null;
  const parts = rangeStr.split(/[-–—to]/i);
  if (parts.length < 2) {
    const single = parseSingleTimeToMinutes(rangeStr);
    if (single !== null) {
      return { startMin: single, endMin: single + 60 };
    }
    return null;
  }

  const startMin = parseSingleTimeToMinutes(parts[0]);
  const endMin = parseSingleTimeToMinutes(parts[1]);

  if (startMin === null || endMin === null) return null;
  return { startMin, endMin: endMin > startMin ? endMin : startMin + 60 };
}

/**
 * Format total minutes from midnight into 12-hour display: e.g. 810 -> "1:30 PM"
 */
export function formatMinutesTo12Hour(minutes: number): string {
  const norm = ((minutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const mins = norm % 60;
  const meridiem = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${mins.toString().padStart(2, '0')} ${meridiem}`;
}

export interface CourtGameStatus {
  court: CourtInfo;
  activeGame: GameMasterAssignment | null;
  activeProgressPercent: number;
  upcomingGame: GameMasterAssignment | null;
  allScheduledGames: {
    game: GameMasterAssignment;
    startMin: number;
    endMin: number;
    status: 'live' | 'upcoming' | 'finished';
  }[];
}

/**
 * Given a list of games and a specific time in minutes (e.g. 810 for 1:30 PM),
 * compute the status for each court.
 */
export function getCourtsStatusAtTime(
  games: GameMasterAssignment[],
  currentMinutes: number
): Record<string, CourtGameStatus> {
  const result: Record<string, CourtGameStatus> = {};

  for (const court of VENUE_COURTS) {
    // Find all games for this court
    const courtGames: {
      game: GameMasterAssignment;
      startMin: number;
      endMin: number;
      status: 'live' | 'upcoming' | 'finished';
    }[] = [];

    for (const g of games) {
      const matched = matchCourt(g.court);
      if (matched && matched.id === court.id) {
        const range = parseTimeRangeToMinutes(g.time);
        if (range) {
          let status: 'live' | 'upcoming' | 'finished' = 'upcoming';
          if (currentMinutes >= range.startMin && currentMinutes < range.endMin) {
            status = 'live';
          } else if (currentMinutes >= range.endMin) {
            status = 'finished';
          }
          courtGames.push({
            game: g,
            startMin: range.startMin,
            endMin: range.endMin,
            status
          });
        }
      }
    }

    // Sort by start time
    courtGames.sort((a, b) => a.startMin - b.startMin);

    // Active (ongoing) game
    const activeEntry = courtGames.find(
      cg => currentMinutes >= cg.startMin && currentMinutes < cg.endMin
    );

    let progress = 0;
    if (activeEntry) {
      const totalDur = activeEntry.endMin - activeEntry.startMin;
      const elapsed = currentMinutes - activeEntry.startMin;
      progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDur) * 100)));
    }

    // Upcoming next game
    const upcomingEntry = courtGames.find(cg => cg.startMin > currentMinutes);

    result[court.id] = {
      court,
      activeGame: activeEntry ? activeEntry.game : null,
      activeProgressPercent: progress,
      upcomingGame: upcomingEntry ? upcomingEntry.game : null,
      allScheduledGames: courtGames
    };
  }

  return result;
}
