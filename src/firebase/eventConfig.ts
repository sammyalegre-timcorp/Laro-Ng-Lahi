import {
  doc,
  setDoc,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from './config';
import {
  EventConfig,
  DEFAULT_EVENT_CONFIG,
  DEFAULT_DEADLINE_ISO,
  DEFAULT_DEADLINE_MS
} from '../types';

const EVENT_CONFIG_COLLECTION = 'event_config';
const REGISTRATION_SETTINGS_DOC_ID = 'registration_settings';

/**
 * Subscribes to real-time updates for event and registration configuration (deadline, cutoff, venue).
 */
export function subscribeToEventConfig(
  onUpdate: (config: EventConfig) => void,
  onError?: (err: Error) => void
) {
  const docRef = doc(db, EVENT_CONFIG_COLLECTION, REGISTRATION_SETTINGS_DOC_ID);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(DEFAULT_EVENT_CONFIG);
        return;
      }

      const d = snapshot.data();
      const deadlineIso = d.deadlineIso || DEFAULT_DEADLINE_ISO;
      const deadlineMs = typeof d.deadlineMs === 'number' && !isNaN(d.deadlineMs)
        ? d.deadlineMs
        : new Date(deadlineIso).getTime();

      const config: EventConfig = {
        id: snapshot.id,
        deadlineIso,
        deadlineMs: isNaN(deadlineMs) ? DEFAULT_DEADLINE_MS : deadlineMs,
        isManuallyClosed: Boolean(d.isManuallyClosed),
        isManuallyOpened: Boolean(d.isManuallyOpened),
        eventDate: d.eventDate || DEFAULT_EVENT_CONFIG.eventDate,
        eventVenue: d.eventVenue || DEFAULT_EVENT_CONFIG.eventVenue,
        customNotice: d.customNotice || '',
        updatedAt: d.updatedAt || '',
        updatedBy: d.updatedBy || ''
      };

      onUpdate(config);
    },
    (err) => {
      console.error('Firestore event_config subscription error:', err);
      if (onError) onError(err);
      onUpdate(DEFAULT_EVENT_CONFIG);
    }
  );
}

/**
 * Updates the registration deadline / cutoff and event settings in Firestore.
 */
export async function updateEventConfig(
  updates: Partial<EventConfig>,
  updatedBy: string = 'Admin'
): Promise<void> {
  const docRef = doc(db, EVENT_CONFIG_COLLECTION, REGISTRATION_SETTINGS_DOC_ID);

  const payload: Record<string, any> = {
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy
  };

  // Keep deadlineMs and deadlineIso strictly synchronized
  if (updates.deadlineIso) {
    const parsed = new Date(updates.deadlineIso).getTime();
    if (!isNaN(parsed)) {
      payload.deadlineMs = parsed;
    }
  } else if (updates.deadlineMs) {
    payload.deadlineIso = new Date(updates.deadlineMs).toISOString();
  }

  await setDoc(docRef, payload, { merge: true });
}

/**
 * Fetches the current event config once.
 */
export async function getEventConfigOnce(): Promise<EventConfig> {
  const docRef = doc(db, EVENT_CONFIG_COLLECTION, REGISTRATION_SETTINGS_DOC_ID);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return DEFAULT_EVENT_CONFIG;
  }
  const d = snapshot.data();
  const deadlineIso = d.deadlineIso || DEFAULT_DEADLINE_ISO;
  const deadlineMs = typeof d.deadlineMs === 'number' && !isNaN(d.deadlineMs)
    ? d.deadlineMs
    : new Date(deadlineIso).getTime();

  return {
    id: snapshot.id,
    deadlineIso,
    deadlineMs: isNaN(deadlineMs) ? DEFAULT_DEADLINE_MS : deadlineMs,
    isManuallyClosed: Boolean(d.isManuallyClosed),
    isManuallyOpened: Boolean(d.isManuallyOpened),
    eventDate: d.eventDate || DEFAULT_EVENT_CONFIG.eventDate,
    eventVenue: d.eventVenue || DEFAULT_EVENT_CONFIG.eventVenue,
    customNotice: d.customNotice || '',
    updatedAt: d.updatedAt || '',
    updatedBy: d.updatedBy || ''
  };
}
