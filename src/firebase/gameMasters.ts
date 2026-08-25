import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { GameMasterAssignment } from '../types';

const GAME_MASTERS_COLLECTION = 'game_masters';

export async function addGameMasterEntry(data: Omit<GameMasterAssignment, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, GAME_MASTERS_COLLECTION), {
    gameName: data.gameName.trim(),
    gameMaster: data.gameMaster.trim(),
    court: data.court ? data.court.trim() : 'Court 1',
    time: data.time ? data.time.trim() : '',
    notes: data.notes?.trim() || '',
    order: data.order || Date.now(),
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

export function subscribeToGameMasters(
  onUpdate: (data: GameMasterAssignment[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, GAME_MASTERS_COLLECTION),
    orderBy('order', 'asc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: GameMasterAssignment[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          gameName: d.gameName || '',
          gameMaster: d.gameMaster || '',
          court: d.court || 'Court 1',
          time: d.time || '',
          notes: d.notes || '',
          order: d.order || 0,
          createdAt: d.createdAt || ''
        };
      });
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore game_masters subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function updateGameMasterEntry(id: string, updates: Partial<GameMasterAssignment>): Promise<void> {
  const docRef = doc(db, GAME_MASTERS_COLLECTION, id);
  await updateDoc(docRef, updates);
}

export async function deleteGameMasterEntry(id: string): Promise<void> {
  const docRef = doc(db, GAME_MASTERS_COLLECTION, id);
  await deleteDoc(docRef);
}
