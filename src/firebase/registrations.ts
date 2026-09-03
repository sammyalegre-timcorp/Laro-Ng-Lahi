import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from './config';
import { Registration } from '../types';

const REGISTRATIONS_COLLECTION = 'registrations';

/**
 * Normalizes an attendee's full name by removing periods, commas, extra whitespace and converting to lowercase.
 */
export function normalizeAttendeeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[.,\-_#@]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes an email address for case-insensitive comparison.
 */
export function normalizeEmail(email?: string): string {
  return (email || '').toLowerCase().trim();
}

/**
 * Helper to check if a given name or email matches any existing registration.
 */
export function findDuplicateRegistration(
  registrations: Registration[],
  candidate: { fullName: string; email?: string },
  excludeId?: string
): { isDuplicate: boolean; matchedField: 'email' | 'fullName' | null; existing?: Registration } {
  const candName = normalizeAttendeeName(candidate.fullName);
  const candEmail = normalizeEmail(candidate.email);

  for (const reg of registrations) {
    if (excludeId && reg.id === excludeId) continue;

    // Check email match if both have emails
    if (candEmail && reg.email && normalizeEmail(reg.email) === candEmail) {
      return { isDuplicate: true, matchedField: 'email', existing: reg };
    }

    // Check full name match
    if (candName && normalizeAttendeeName(reg.fullName) === candName) {
      return { isDuplicate: true, matchedField: 'fullName', existing: reg };
    }
  }

  return { isDuplicate: false, matchedField: null };
}

export async function submitRegistration(data: Omit<Registration, 'id' | 'createdAt'>): Promise<string> {
  // Query all current registrations to strictly enforce uniqueness directly in Firestore
  const snap = await getDocs(collection(db, REGISTRATIONS_COLLECTION));
  const existingList: Registration[] = snap.docs.map((docSnap) => {
    const d = docSnap.data();
    return {
      id: docSnap.id,
      fullName: d.fullName || '',
      nickname: d.nickname || '',
      email: d.email || '',
      age: Number(d.age) || 0,
      gender: d.gender || 'Male',
      department: d.department || '',
      customDepartment: d.customDepartment || '',
      medicalNotes: d.medicalNotes || '',
      assignedTeam: d.assignedTeam || null,
      status: d.status || 'confirmed',
      createdAt: d.createdAt || ''
    };
  });

  const dupCheck = findDuplicateRegistration(existingList, {
    fullName: data.fullName,
    email: data.email
  });

  if (dupCheck.isDuplicate && dupCheck.existing) {
    const reason = dupCheck.matchedField === 'email'
      ? `ang email na "${data.email}"`
      : `ang pangalang "${data.fullName}"`;
    throw new Error(
      `Bawal ang duplicate registration: Naka-rehistro na po ${reason} para kay ${dupCheck.existing.fullName} (${dupCheck.existing.department || 'TIM Corp'}). Bawat kalahok ay mayroon lamang isang (1) opisyal na rehistrasyon.`
    );
  }

  const docRef = await addDoc(collection(db, REGISTRATIONS_COLLECTION), {
    ...data,
    createdAt: new Date().toISOString(),
    status: data.status || 'confirmed'
  });
  return docRef.id;
}

export function subscribeToRegistrations(
  onUpdate: (data: Registration[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, REGISTRATIONS_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Registration[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          fullName: d.fullName || '',
          nickname: d.nickname || '',
          age: Number(d.age) || 0,
          gender: d.gender || 'Male',
          department: d.department || '',
          customDepartment: d.customDepartment || '',
          employeeId: d.employeeId || '',
          email: d.email || '',
          phone: d.phone || '',
          shirtSize: d.shirtSize || 'L',
          favoriteGames: Array.isArray(d.favoriteGames) ? d.favoriteGames : [],
          medicalNotes: d.medicalNotes || '',
          emergencyContactName: d.emergencyContactName || '',
          emergencyContactPhone: d.emergencyContactPhone || '',
          assignedTeam: d.assignedTeam || null,
          status: d.status || 'confirmed',
          createdAt: d.createdAt || new Date().toISOString()
        };
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore registrations subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function updateRegistration(id: string, updates: Partial<Registration>): Promise<void> {
  const docRef = doc(db, REGISTRATIONS_COLLECTION, id);
  await updateDoc(docRef, updates);
}

export async function deleteRegistration(id: string): Promise<void> {
  const docRef = doc(db, REGISTRATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function batchDeleteRegistrations(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of ids) {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, id);
    batch.delete(docRef);
  }
  await batch.commit();
}

export async function batchUpdateTeams(assignments: { id: string; teamName: string | null }[]): Promise<void> {
  const batch = writeBatch(db);
  for (const item of assignments) {
    const docRef = doc(db, REGISTRATIONS_COLLECTION, item.id);
    batch.update(docRef, { assignedTeam: item.teamName });
  }
  await batch.commit();
}
