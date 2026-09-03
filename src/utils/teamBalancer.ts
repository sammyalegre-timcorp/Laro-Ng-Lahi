import { Registration, Team } from '../types';

export type AgeTier = 'young' | 'mid' | 'older';

export const AGE_TIER_CONFIG = {
  youngMax: 29, // Age <= 29: Younger / High Energy runners
  olderMin: 37  // Age >= 37: Older / Veterans / More likely to cheer or support
};

export function getAgeTier(age: number): AgeTier {
  if (age <= AGE_TIER_CONFIG.youngMax) return 'young';
  if (age >= AGE_TIER_CONFIG.olderMin) return 'older';
  return 'mid';
}

export interface BalancedTeamResult {
  team: Team;
  members: Registration[];
  averageAge: number;
  minAge: number;
  maxAge: number;
  ageDistribution: {
    young: number; // <= 29: High energy runners
    mid: number;   // 30-36: Active
    older: number; // >= 37: Veteran / Support
  };
  genderCount: {
    male: number;
    female: number;
    other: number;
  };
  departmentCount: Record<string, number>;
}

/**
 * Multi-factor energy and demographic balancing algorithm for Laro ng Lahi.
 * Specifically ensures that:
 * 1. Younger, high-energy participants (<= 29) are evenly distributed across all teams
 *    so no single team has an unfair athletic/stamina advantage in physical games.
 * 2. Older colleagues (>= 37), who may prefer cheering or less physically demanding roles,
 *    are also evenly spread out rather than concentrated on one team.
 * 3. Mid-range (30-36) participants are evenly balanced.
 * 4. Gender balance (males and females) is kept equal across all teams.
 * 5. Department representation is mixed for company-wide camaraderie.
 */
export function balanceTeams(
  participants: Registration[],
  teams: Team[]
): Record<string, string> {
  if (!participants.length || !teams.length) return {};

  const teamAssignments: Record<string, string> = {};
  const teamStats = teams.map(t => ({
    id: t.id,
    name: t.name,
    members: [] as Registration[],
    totalAge: 0,
    maleCount: 0,
    femaleCount: 0,
    youngCount: 0,
    midCount: 0,
    olderCount: 0,
    deptCounts: {} as Record<string, number>
  }));

  // Group participants into focused cohorts to balance both age-energy tiers and gender
  // Order of distribution:
  // 1. Young males (highest physical energy runners)
  // 2. Young females (highest physical energy runners)
  // 3. Older males (veterans / support)
  // 4. Older females (veterans / support)
  // 5. Mid-range males
  // 6. Mid-range females
  // 7. Other gender identities
  const cohorts: Registration[][] = [
    participants.filter(p => p.gender === 'Male' && getAgeTier(p.age) === 'young').sort((a, b) => a.age - b.age),
    participants.filter(p => p.gender === 'Female' && getAgeTier(p.age) === 'young').sort((a, b) => a.age - b.age),
    participants.filter(p => p.gender === 'Male' && getAgeTier(p.age) === 'older').sort((a, b) => b.age - a.age),
    participants.filter(p => p.gender === 'Female' && getAgeTier(p.age) === 'older').sort((a, b) => b.age - a.age),
    participants.filter(p => p.gender === 'Male' && getAgeTier(p.age) === 'mid').sort((a, b) => a.age - b.age),
    participants.filter(p => p.gender === 'Female' && getAgeTier(p.age) === 'mid').sort((a, b) => a.age - b.age),
    participants.filter(p => p.gender !== 'Male' && p.gender !== 'Female').sort((a, b) => a.age - b.age)
  ];

  cohorts.forEach(cohort => {
    cohort.forEach(person => {
      const tier = getAgeTier(person.age);
      const isMale = person.gender === 'Male';
      const isFemale = person.gender === 'Female';
      const deptKey = person.department || 'Other';

      // Pick the optimal team for this participant
      const sortedTeams = [...teamStats].sort((t1, t2) => {
        // Priority 1: Team size parity (keep sizes equal +/- 1)
        if (t1.members.length !== t2.members.length) {
          return t1.members.length - t2.members.length;
        }

        // Priority 2: Spread out the specific age tier (Young vs Older vs Mid)
        if (tier === 'young' && t1.youngCount !== t2.youngCount) {
          return t1.youngCount - t2.youngCount;
        }
        if (tier === 'older' && t1.olderCount !== t2.olderCount) {
          return t1.olderCount - t2.olderCount;
        }
        if (tier === 'mid' && t1.midCount !== t2.midCount) {
          return t1.midCount - t2.midCount;
        }

        // Priority 3: Gender balance within team
        if (isMale && t1.maleCount !== t2.maleCount) {
          return t1.maleCount - t2.maleCount;
        }
        if (isFemale && t1.femaleCount !== t2.femaleCount) {
          return t1.femaleCount - t2.femaleCount;
        }

        // Priority 4: Department diversity (mix different departments)
        const d1 = t1.deptCounts[deptKey] || 0;
        const d2 = t2.deptCounts[deptKey] || 0;
        if (d1 !== d2) {
          return d1 - d2;
        }

        // Priority 5: Total age tie-breaker
        return t1.totalAge - t2.totalAge;
      });

      const chosenTeam = sortedTeams[0];
      chosenTeam.members.push(person);
      chosenTeam.totalAge += person.age;

      if (isMale) chosenTeam.maleCount++;
      if (isFemale) chosenTeam.femaleCount++;

      if (tier === 'young') chosenTeam.youngCount++;
      else if (tier === 'older') chosenTeam.olderCount++;
      else chosenTeam.midCount++;

      chosenTeam.deptCounts[deptKey] = (chosenTeam.deptCounts[deptKey] || 0) + 1;

      if (person.id) {
        teamAssignments[person.id] = chosenTeam.name;
      }
    });
  });

  return teamAssignments;
}

export function computeTeamStats(
  registrations: Registration[],
  teams: Team[]
): BalancedTeamResult[] {
  return teams.map(team => {
    const members = registrations.filter(r => r.assignedTeam === team.name);
    const totalAge = members.reduce((sum, r) => sum + r.age, 0);
    const ages = members.map(m => m.age);
    const averageAge = members.length ? Math.round((totalAge / members.length) * 10) / 10 : 0;
    const minAge = ages.length ? Math.min(...ages) : 0;
    const maxAge = ages.length ? Math.max(...ages) : 0;

    const ageDistribution = {
      young: members.filter(m => getAgeTier(m.age) === 'young').length,
      mid: members.filter(m => getAgeTier(m.age) === 'mid').length,
      older: members.filter(m => getAgeTier(m.age) === 'older').length
    };

    const genderCount = {
      male: members.filter(m => m.gender === 'Male').length,
      female: members.filter(m => m.gender === 'Female').length,
      other: members.filter(m => m.gender !== 'Male' && m.gender !== 'Female').length
    };

    const departmentCount: Record<string, number> = {};
    members.forEach(m => {
      const dept = m.department || 'Other';
      departmentCount[dept] = (departmentCount[dept] || 0) + 1;
    });

    return {
      team,
      members,
      averageAge,
      minAge,
      maxAge,
      ageDistribution,
      genderCount,
      departmentCount
    };
  });
}
