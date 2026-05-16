import { connect, disconnect, isConnected } from './bluetooth/connection.js';
import { sendCommand, sendStop } from './bluetooth/sender.js';
import { on } from './bluetooth/events.js';

// ─── DOM refs ────────────────────────────────────────────────────────────────
const connectBtn   = document.getElementById('btn-connect');
const statusBadge  = document.getElementById('connection-status');
const terminal     = document.getElementById('terminal');
const coreLight    = document.querySelector('.core-light');
const controlBtns  = document.querySelectorAll('.control-btn');

// ─── Terminal log ─────────────────────────────────────────────────────────────
function log(msg, type = 'system') {
  const el   = document.createElement('div');
  el.className = `terminal-line ${type}`;
  const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  el.textContent = `[${time}] ${msg}`;
  terminal.appendChild(el);
  terminal.scrollTop = terminal.scrollHeight;
}

// ─── UI state helpers ─────────────────────────────────────────────────────────
function setUIConnected() {
  statusBadge.textContent = 'Conectado';
  statusBadge.className   = 'status connected';
  connectBtn.innerHTML    = '<i data-lucide="bluetooth-connected"></i><span>Desconectar</span>';
  connectBtn.style.background   = 'rgba(0, 255, 136, 0.1)';
  connectBtn.style.color        = 'var(--success)';
  connectBtn.style.borderColor  = 'rgba(0, 255, 136, 0.3)';
  lucide.createIcons();
}

function setUIDisconnected() {
  statusBadge.textContent = 'Desconectado';
  statusBadge.className   = 'status disconnected';
  connectBtn.innerHTML    = '<i data-lucide="bluetooth"></i><span>Conectar Bluetooth</span>';
  connectBtn.style.cssText = '';
  lucide.createIcons();
}

function setUIReconnecting(attempt) {
  statusBadge.textContent = `Reconectando… #${attempt}`;
  statusBadge.className   = 'status disconnected';
}

// ─── Bluetooth event wiring ───────────────────────────────────────────────────
on('connecting',       ()               => log('Conectando à porta serial…', 'system'));
on('connected',        ()               => { setUIConnected();  log('Conectado com sucesso!', 'success'); });
on('disconnected',     ({ unexpected }) => { setUIDisconnected(); log(unexpected ? 'Conexão perdida!' : 'Desconectado.', unexpected ? 'error' : 'system'); });
on('reconnecting',     ({ attempt, delayMs }) => { setUIReconnecting(attempt); log(`Tentando reconectar… tentativa ${attempt} em ${delayMs / 1000}s`, 'system'); });
on('reconnect-failed', ()               => log('Reconexão falhou. Conecte manualmente.', 'error'));
on('sent',             ({ command })    => log(`→ "${command}"`, 'sent'));
on('error',            ({ message })    => log(`Erro: ${message}`, 'error'));

// ─── Connect button ───────────────────────────────────────────────────────────
connectBtn.addEventListener('click', async () => {
  if (isConnected()) {
    await disconnect();
  } else {
    await connect();
  }
});

// ─── Control buttons (mouse + touch) ─────────────────────────────────────────
controlBtns.forEach(btn => {
  const cmd = btn.getAttribute('data-command');

  const onPress = (e) => {
    e.preventDefault();
    if (!isConnected()) { log('Conecte primeiro!', 'error'); return; }
    btn.classList.add('active');
    coreLight.classList.add('active');
    sendCommand(cmd);
  };

  const onRelease = (e) => {
    e.preventDefault();
    btn.classList.remove('active');
    coreLight.classList.remove('active');
    sendStop();
  };

  btn.addEventListener('mousedown',  onPress);
  btn.addEventListener('mouseup',    onRelease);
  btn.addEventListener('mouseleave', (e) => { if (btn.classList.contains('active')) onRelease(e); });

  btn.addEventListener('touchstart',  onPress,   { passive: false });
  btn.addEventListener('touchend',    onRelease, { passive: false });
  btn.addEventListener('touchcancel', onRelease, { passive: false });
});

// ─── Keyboard (setas + WASD) ──────────────────────────────────────────────────
const KEY_TO_BTN_ID = {
  arrowup: 'btn-up', w: 'btn-up',
  arrowdown: 'btn-down', s: 'btn-down',
  arrowleft: 'btn-left', a: 'btn-left',
  arrowright: 'btn-right', d: 'btn-right',
};

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const id = KEY_TO_BTN_ID[e.key.toLowerCase()];
  if (id) document.getElementById(id)?.dispatchEvent(new MouseEvent('mousedown'));
});

window.addEventListener('keyup', (e) => {
  const id = KEY_TO_BTN_ID[e.key.toLowerCase()];
  if (id) document.getElementById(id)?.dispatchEvent(new MouseEvent('mouseup'));
});
