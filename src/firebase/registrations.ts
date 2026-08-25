import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';
import { Registration } from '../types';

const REGISTRATIONS_COLLECTION = 'registrations';

export async function submitRegistration(data: Omit<Registration, 'id' | 'createdAt'>): Promise<string> {
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
