/**
 * Audit Logger utility for tracking sensitive wallet events locally.
 * Logs are stored in local storage and capped to a maximum of 100 entries to prevent storage bloat.
 */

export interface AuditEvent {
  id: string;
  timestamp: number;
  category: 'transaction' | 'settings' | 'security';
  action: string;
  details: string;
}

const STORAGE_KEY = 'xpectre_audit_logs';
const MAX_LOGS = 100;

/**
 * Retrieves the current list of logged audit events from localStorage.
 */
export function getAuditEvents(): AuditEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to parse audit logs from localStorage:', err);
    return [];
  }
}

/**
 * Writes a new audit event to localStorage, maintaining a maximum capacity of MAX_LOGS.
 */
export function logAuditEvent(
  category: 'transaction' | 'settings' | 'security',
  action: string,
  details: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getAuditEvents();
    const newEvent: AuditEvent = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      category,
      action,
      details
    };

    // Add to the beginning of the list (newest first)
    const updatedLogs = [newEvent, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));

    // Dispatch a custom event so components can listen to log changes in real time
    window.dispatchEvent(new CustomEvent('xpectre_audit_log_added', { detail: newEvent }));
  } catch (err) {
    console.error('Failed to write audit log to localStorage:', err);
  }
}

/**
 * Clears all audit events from localStorage.
 */
export function clearAuditEvents(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('xpectre_audit_log_added'));
  } catch (err) {
    console.error('Failed to clear audit logs:', err);
  }
}
