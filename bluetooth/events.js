/**
 * Minimal pub/sub event bus for Bluetooth state changes.
 *
 * Events emitted:
 *   'connecting'       — connection attempt started
 *   'connected'        — port opened successfully
 *   'disconnected'     — port closed (expected or unexpected)
 *   'reconnecting'     — scheduled retry attempt
 *   'reconnect-failed' — all retry attempts exhausted
 *   'sent'             — command written to serial
 *   'error'            — any error with { message }
 */

const _listeners = {};

export function on(event, callback) {
  if (!_listeners[event]) _listeners[event] = [];
  _listeners[event].push(callback);
}

export function off(event, callback) {
  if (!_listeners[event]) return;
  _listeners[event] = _listeners[event].filter(cb => cb !== callback);
}

export function emit(event, data = {}) {
  (_listeners[event] || []).forEach(cb => {
    try { cb(data); } catch (e) { console.error(`[BT events] handler for "${event}" threw:`, e); }
  });
}
