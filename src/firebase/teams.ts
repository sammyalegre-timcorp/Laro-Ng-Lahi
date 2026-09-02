import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Team, DEFAULT_TEAMS } from '../types';

const TEAMS_COLLECTION = 'teams';

export function subscribeToTeams(
  onUpdate: (teams: Team[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, TEAMS_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate(DEFAULT_TEAMS);
        return;
      }
      const teams: Team[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || '',
          tagline: d.tagline || '',
          color: d.color || '#0038A8',
          bgBadge: d.bgBadge || 'bg-blue-100',
          borderBadge: d.borderBadge || 'border-blue-300',
          textBadge: d.textBadge || 'text-blue-800',
          iconName: d.iconName || '🏆'
        };
      });

      // Keep default order if they match default IDs, or preserve order
      const orderMap = new Map(DEFAULT_TEAMS.map((t, idx) => [t.id, idx]));
      teams.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999;
        return orderA - orderB;
      });

      onUpdate(teams);
    },
    (err) => {
      console.error('Firestore teams subscription error:', err);
      if (onError) onError(err);
      onUpdate(DEFAULT_TEAMS);
    }
  );
}

export async function saveTeam(team: Team): Promise<void> {
  const docRef = doc(db, TEAMS_COLLECTION, team.id);
  await setDoc(docRef, team, { merge: true });
}

export async function saveAllTeams(teams: Team[]): Promise<void> {
  const batch = writeBatch(db);
  for (const team of teams) {
    const docRef = doc(db, TEAMS_COLLECTION, team.id);
    batch.set(docRef, team);
  }
  await batch.commit();
}

export async function deleteTeamFromFirebase(teamId: string): Promise<void> {
  const docRef = doc(db, TEAMS_COLLECTION, teamId);
  await deleteDoc(docRef);
}

export async function resetTeamsToDefault(): Promise<void> {
  const batch = writeBatch(db);
  const snapshot = await getDocs(collection(db, TEAMS_COLLECTION));
  snapshot.docs.forEach((d) => {
    batch.delete(d.ref);
  });
  DEFAULT_TEAMS.forEach((team) => {
    const docRef = doc(db, TEAMS_COLLECTION, team.id);
    batch.set(docRef, team);
  });
  await batch.commit();
}

export async function syncRenamedTeamsInRegistrations(renamedMap: Record<string, string>): Promise<void> {
  const oldNames = Object.keys(renamedMap);
  if (oldNames.length === 0) return;

  const snapshot = await getDocs(collection(db, 'registrations'));
  const batch = writeBatch(db);
  let changed = 0;

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.assignedTeam && renamedMap[data.assignedTeam]) {
      batch.update(docSnap.ref, { assignedTeam: renamedMap[data.assignedTeam] });
      changed++;
    }
  });

  if (changed > 0) {
    await batch.commit();
  }
}
