import { Registration, Team } from '../types';

export interface BalancedTeamResult {
  team: Team;
  members: Registration[];
  averageAge: number;
  minAge: number;
  maxAge: number;
  genderCount: {
    male: number;
    female: number;
    other: number;
  };
  departmentCount: Record<string, number>;
}

/**
 * Multi-factor greedy snake balancing algorithm for Laro ng Lahi
 * Balances:
 * 1. Age (Equalizes average age and age distribution across teams)
 * 2. Gender (Even gender ratio across all teams)
 * 3. Department (Distributes departments across teams to encourage company-wide bonding)
 */
export function balanceTeams(
  participants: Registration[],
  teams: Team[]
): Record<string, string> {
  if (!participants.length || !teams.length) return {};

  const teamCount = teams.length;
  // Bucket members by gender first, then sort by age descending
  const males = participants.filter(p => p.gender === 'Male').sort((a, b) => b.age - a.age);
  const females = participants.filter(p => p.gender === 'Female').sort((a, b) => b.age - a.age);
  const others = participants.filter(p => p.gender !== 'Male' && p.gender !== 'Female').sort((a, b) => b.age - a.age);

  // Initialize team buckets with running statistics
  const teamAssignments: Record<string, string> = {};
  const teamStats: {
    id: string;
    name: string;
    members: Registration[];
    totalAge: number;
    maleCount: number;
    femaleCount: number;
    deptCounts: Record<string, number>;
  }[] = teams.map(t => ({
    id: t.id,
    name: t.name,
    members: [],
    totalAge: 0,
    maleCount: 0,
    femaleCount: 0,
    deptCounts: {}
  }));

  // Distribute helper using greedy snake scoring
  const distributeGroup = (group: Registration[], genderType: 'male' | 'female' | 'other') => {
    group.forEach((person, idx) => {
      // Find the best team for this person:
      // Lowest member count -> Lowest total/average age -> Lowest department count
      const sortedTeams = [...teamStats].sort((t1, t2) => {
        // First priority: Team size parity (keep sizes equal +/- 1)
        if (t1.members.length !== t2.members.length) {
          return t1.members.length - t2.members.length;
        }

        // Second priority: Gender balance within team
        if (genderType === 'male' && t1.maleCount !== t2.maleCount) {
          return t1.maleCount - t2.maleCount;
        }
        if (genderType === 'female' && t1.femaleCount !== t2.femaleCount) {
          return t1.femaleCount - t2.femaleCount;
        }

        // Third priority: Average age balancing
        const avgAge1 = t1.members.length ? t1.totalAge / t1.members.length : 0;
        const avgAge2 = t2.members.length ? t2.totalAge / t2.members.length : 0;
        if (Math.abs(avgAge1 - avgAge2) > 0.5) {
          return avgAge1 - avgAge2;
        }

        // Fourth priority: Department diversity
        const deptKey = person.department || 'Other';
        const d1 = t1.deptCounts[deptKey] || 0;
        const d2 = t2.deptCounts[deptKey] || 0;
        return d1 - d2;
      });

      const chosenTeam = sortedTeams[0];
      chosenTeam.members.push(person);
      chosenTeam.totalAge += person.age;
      if (genderType === 'male') chosenTeam.maleCount++;
      if (genderType === 'female') chosenTeam.femaleCount++;
      const deptKey = person.department || 'Other';
      chosenTeam.deptCounts[deptKey] = (chosenTeam.deptCounts[deptKey] || 0) + 1;

      if (person.id) {
        teamAssignments[person.id] = chosenTeam.name;
      }
    });
  };

  // Run distribution on each cohort
  distributeGroup(males, 'male');
  distributeGroup(females, 'female');
  distributeGroup(others, 'other');

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

    const genderCount = {
      male: members.filter(m => m.gender === 'Male').length,
      female: members.filter(m => m.gender === 'Female').length,
      other: members.filter(m => m.gender !== 'Male' && m.gender !== 'Female').length
    };

    const departmentCount: Record<string, number> = {};
    members.forEach(m => {
      const dept = m.department === 'Other / Custom' ? (m.customDepartment || 'Other') : m.department;
      departmentCount[dept] = (departmentCount[dept] || 0) + 1;
    });

    return {
      team,
      members,
      averageAge,
      minAge,
      maxAge,
      genderCount,
      departmentCount
    };
  });
}
