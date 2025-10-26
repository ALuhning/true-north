import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'truenorth_device_id';
const LAST_SESSION_KEY = 'truenorth_last_session';

export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

export function setLastSession(sessionId: string): void {
  localStorage.setItem(LAST_SESSION_KEY, sessionId);
}

export function getLastSession(): string | null {
  return localStorage.getItem(LAST_SESSION_KEY);
}

export function clearLastSession(): void {
  localStorage.removeItem(LAST_SESSION_KEY);
}
