const connectBtn = document.getElementById('btn-connect');
const statusBadge = document.getElementById('connection-status');
const terminal = document.getElementById('terminal');
const coreLight = document.querySelector('.core-light');
const controlBtns = document.querySelectorAll('.control-btn');

let port;
let writer;
let isConnected = false;
let useMock = false;
let currentCommand = null;

// Sistema de log do terminal
function log(msg, type = 'system') {
    const el = document.createElement('div');
    el.className = `terminal-line ${type}`;
    const time = new Date().toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    el.textContent = `[${time}] ${msg}`;
    terminal.appendChild(el);
    terminal.scrollTop = terminal.scrollHeight;
}

function updateUIConnected() {
    statusBadge.textContent = useMock ? 'Simulação' : 'Conectado';
    statusBadge.className = 'status connected';
    connectBtn.innerHTML = '<i data-lucide="bluetooth-connected"></i><span>Desconectar</span>';
    lucide.createIcons();
    connectBtn.style.background = 'rgba(0, 255, 136, 0.1)';
    connectBtn.style.color = 'var(--success)';
    connectBtn.style.borderColor = 'rgba(0, 255, 136, 0.3)';
}

function updateUIDisconnected() {
    statusBadge.textContent = 'Desconectado';
    statusBadge.className = 'status disconnected';
    connectBtn.innerHTML = '<i data-lucide="bluetooth"></i><span>Conectar Serial / Bluetooth</span>';
    lucide.createIcons();
    connectBtn.style = '';
}

// Conexão usando a Web Serial API (Compatível com Chrome/Edge no PC e Android)
async function connect() {
    if (isConnected) {
        // Desconectar
        if (!useMock && port) {
            try {
                writer.releaseLock();
                await port.close();
            } catch (e) {
                console.error(e);
            }
        }
        isConnected = false;
        useMock = false;
        updateUIDisconnected();
        log('Desconectado', 'system');
        return;
    }

    if (!('serial' in navigator)) {
        log('Web Serial API não suportada neste navegador.', 'error');
        // Fallback UI
        isConnected = true;
        useMock = true;
        updateUIConnected();
        log('Modo de simulação ativado (Apenas UI)', 'system');
        return;
    }

    try {
        log('Solicitando acesso à porta Serial...', 'system');
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        
        const textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(port.writable);
        writer = textEncoder.writable.getWriter();
        
        isConnected = true;
        useMock = false;
        updateUIConnected();
        log('Conectado com sucesso!', 'success');
    } catch (e) {
        log('Erro: ' + e.message, 'error');
        log('Iniciando modo de simulação UI', 'system');
        isConnected = true;
        useMock = true;
        updateUIConnected();
    }
}

connectBtn.addEventListener('click', connect);

// Enviar comandos
async function sendCommand(cmd, isRelease = false) {
    if (!isConnected) return;
    
    // Evita enviar o mesmo comando repetidamente
    if (!isRelease && currentCommand === cmd) return;
    currentCommand = isRelease ? null : cmd;

    if (isRelease) {
        coreLight.classList.remove('active');
    } else {
        coreLight.classList.add('active');
    }

    log(`Enviando: ${cmd}`, 'sent');

    if (!useMock && writer) {
        try {
            await writer.write(cmd);
        } catch (e) {
            log('Erro ao escrever: ' + e.message, 'error');
        }
    }
}

// Configuração dos eventos de botão
// Precisamos suportar Mouse (PC) e Touch (Celular)
controlBtns.forEach(btn => {
    const cmd = btn.getAttribute('data-command');

    const pressAction = (e) => {
        e.preventDefault();
        if (!isConnected) {
            log('Conecte primeiro!', 'error');
            return;
        }
        btn.classList.add('active');
        sendCommand(cmd);
    };

    const releaseAction = (e) => {
        e.preventDefault();
        btn.classList.remove('active');
        // Ao soltar qualquer botão, manda o comando de Parar ('S')
        sendCommand('S', true);
    };

    // Eventos de Mouse
    btn.addEventListener('mousedown', pressAction);
    btn.addEventListener('mouseup', releaseAction);
    btn.addEventListener('mouseleave', (e) => {
        if (btn.classList.contains('active')) releaseAction(e);
    });

    // Eventos de Touch
    btn.addEventListener('touchstart', pressAction, { passive: false });
    btn.addEventListener('touchend', releaseAction, { passive: false });
    btn.addEventListener('touchcancel', releaseAction, { passive: false });
});

// Suporte para teclado (Setas e WASD)
window.addEventListener('keydown', (e) => {
    if (e.repeat) return; // Ignora eventos repetidos ao segurar a tecla
    let btn;
    switch(e.key.toLowerCase()) {
        case 'arrowup': case 'w': btn = document.getElementById('btn-up'); break;
        case 'arrowdown': case 's': btn = document.getElementById('btn-down'); break;
        case 'arrowleft': case 'a': btn = document.getElementById('btn-left'); break;
        case 'arrowright': case 'd': btn = document.getElementById('btn-right'); break;
    }
    if (btn) {
        btn.dispatchEvent(new Event('mousedown'));
    }
});

window.addEventListener('keyup', (e) => {
    let btn;
    switch(e.key.toLowerCase()) {
        case 'arrowup': case 'w': btn = document.getElementById('btn-up'); break;
        case 'arrowdown': case 's': btn = document.getElementById('btn-down'); break;
        case 'arrowleft': case 'a': btn = document.getElementById('btn-left'); break;
        case 'arrowright': case 'd': btn = document.getElementById('btn-right'); break;
    }
    if (btn) {
        btn.dispatchEvent(new Event('mouseup'));
    }
});
