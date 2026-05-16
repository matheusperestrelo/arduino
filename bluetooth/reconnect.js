import { BT_CONFIG } from './config.js';
import { emit } from './events.js';

let _timer = null;
let _attempts = 0;

/**
 * Schedule an auto-reconnect attempt with exponential backoff.
 * @param {Function} connectFn — the connect() function from connection.js
 */
export function scheduleReconnect(connectFn) {
  if (_attempts >= BT_CONFIG.MAX_RECONNECT_ATTEMPTS) {
    console.warn('[BT reconnect] Max attempts reached, giving up.');
    emit('reconnect-failed', { attempts: _attempts });
    _attempts = 0;
    return;
  }

  const delay = Math.min(
    BT_CONFIG.RECONNECT_BASE_DELAY_MS * Math.pow(BT_CONFIG.RECONNECT_BACKOFF_FACTOR, _attempts),
    BT_CONFIG.RECONNECT_MAX_DELAY_MS
  );

  _attempts++;
  console.log(`[BT reconnect] Attempt ${_attempts} in ${delay}ms`);
  emit('reconnecting', { attempt: _attempts, delayMs: delay });

  _timer = setTimeout(async () => {
    // Try silently with a previously authorized port (no user prompt)
    const success = await connectFn({ silent: true });
    if (success) {
      _attempts = 0;
    } else {
      scheduleReconnect(connectFn);
    }
  }, delay);
}

export function cancelReconnect() {
  if (_timer) {
    clearTimeout(_timer);
    _timer = null;
  }
  _attempts = 0;
}
