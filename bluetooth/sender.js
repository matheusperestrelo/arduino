/**
 * Command sender — converts strings to raw bytes and writes to the serial port.
 *
 * Equivalent to MIT App Inventor's:
 *   BluetoothClient.SendText("F")
 *
 * Each helper sends a single ASCII character. The Arduino reads it with
 * Serial.read() (SoftwareSerial.read()) and maps it to a movement.
 */

import { COMMANDS } from './config.js';
import { isConnected, getWriter } from './connection.js';
import { emit } from './events.js';

const _encoder = new TextEncoder();

/**
 * Core send function — mirrors BluetoothClient.SendText(cmd).
 * Converts the string to UTF-8 bytes before writing (handles special chars
 * safely; single ASCII chars produce identical output to sending raw chars).
 *
 * @param {string} cmd — single character command, e.g. "F"
 * @returns {Promise<boolean>}
 */
export async function sendCommand(cmd) {
  if (!isConnected()) {
    emit('error', { message: 'sendCommand: não conectado.' });
    return false;
  }

  const writer = getWriter();
  if (!writer) {
    emit('error', { message: 'sendCommand: writer não disponível.' });
    return false;
  }

  try {
    await writer.write(_encoder.encode(cmd));
    console.log(`[BT send] → "${cmd}" (0x${cmd.charCodeAt(0).toString(16).toUpperCase()})`);
    emit('sent', { command: cmd, byte: cmd.charCodeAt(0) });
    return true;
  } catch (e) {
    console.error(`[BT send] Erro ao enviar "${cmd}":`, e.message);
    emit('error', { message: `Falha ao enviar "${cmd}": ${e.message}` });
    return false;
  }
}

/** Alias explicit — same as BluetoothClient.SendText("X") */
export const sendPulse    = (cmd) => sendCommand(cmd);

export const sendForward  = () => sendCommand(COMMANDS.FORWARD);
export const sendBackward = () => sendCommand(COMMANDS.BACKWARD);
export const sendLeft     = () => sendCommand(COMMANDS.LEFT);
export const sendRight    = () => sendCommand(COMMANDS.RIGHT);
export const sendStop     = () => sendCommand(COMMANDS.STOP);
