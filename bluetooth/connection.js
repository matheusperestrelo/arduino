/**
 * Serial port connection layer for HC-05 via Web Serial API.
 *
 * HC-05 uses Bluetooth Classic SPP/RFCOMM. When paired on Windows/macOS it
 * appears as a virtual COM port — Web Serial API can then open it exactly
 * like a physical port. This replicates MIT App Inventor's BluetoothClient.
 *
 * Web Bluetooth API is intentionally NOT used: it only supports BLE and is
 * incompatible with the HC-05 Classic Bluetooth module.
 */

import { BT_CONFIG } from './config.js';
import { emit } from './events.js';
import { scheduleReconnect, cancelReconnect } from './reconnect.js';

let _port   = null;
let _writer = null;
let _connected = false;
let _encoder = new TextEncoder();

export const isConnected = () => _connected;
export const getWriter   = () => _writer;

/**
 * @param {{ silent?: boolean }} [opts]
 *   silent=true  — use a previously authorized port without prompting the user.
 *                  Used by auto-reconnect. Falls back to false if no saved port.
 * @returns {Promise<boolean>} true if connected successfully
 */
export async function connect({ silent = false } = {}) {
  if (_connected) return true;

  if (!('serial' in navigator)) {
    const msg = 'Web Serial API não suportada. Use Chrome ou Edge no desktop e pareie o HC-05 como porta COM antes de conectar.';
    console.error('[BT connect]', msg);
    emit('error', { message: msg });
    return false;
  }

  emit('connecting', { silent });
  console.log('[BT connect] Iniciando conexão...', { silent });

  try {
    if (silent) {
      const ports = await navigator.serial.getPorts();
      _port = ports[0] ?? null;
      if (!_port) {
        console.log('[BT connect] Nenhuma porta autorizada salva — reconexão silenciosa abortada.');
        return false;
      }
    } else {
      _port = await navigator.serial.requestPort();
    }

    await _port.open({ baudRate: BT_CONFIG.BAUD_RATE });

    // Get a raw writer so we control encoding explicitly (same as Arduino Serial.read())
    _writer = _port.writable.getWriter();
    _connected = true;

    // Detect unexpected disconnects (cable pull, BT dropout)
    _port.addEventListener('disconnect', _handleUnexpectedDisconnect);

    console.log('[BT connect] Conectado com sucesso!');
    emit('connected', {});
    return true;

  } catch (e) {
    // User cancelled the picker or port failed to open
    _port = null;
    _writer = null;
    console.error('[BT connect] Falha:', e.message);
    emit('error', { message: e.message });
    return false;
  }
}

/**
 * Close the port gracefully.
 * @param {{ reconnect?: boolean }} [opts]
 */
export async function disconnect({ reconnect = false } = {}) {
  if (!reconnect) cancelReconnect();

  _connected = false;

  try {
    if (_writer) {
      _writer.releaseLock();
      _writer = null;
    }
    if (_port) {
      _port.removeEventListener('disconnect', _handleUnexpectedDisconnect);
      await _port.close();
      _port = null;
    }
  } catch (_) {
    // Port may already be closed after a dropout — that's fine
    _port = null;
    _writer = null;
  }

  console.log('[BT connect] Desconectado.');
  emit('disconnected', { unexpected: false });
}

function _handleUnexpectedDisconnect() {
  console.warn('[BT connect] Conexão perdida inesperadamente — agendando reconexão.');
  _connected = false;
  _writer = null;
  _port = null;
  emit('disconnected', { unexpected: true });
  scheduleReconnect(connect);
}
