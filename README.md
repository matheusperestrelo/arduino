# Rover Control — Carrinho Bluetooth com Arduino

Controle de carrinho via Bluetooth Clássico (HC-05) pelo navegador.

---

## Hardware necessário

| Componente | Quantidade |
|---|---|
| Arduino Uno (ou compatível) | 1 |
| Módulo Bluetooth HC-05 | 1 |
| Driver de motor L9110S (ponte H dupla) | 1 |
| Motores DC (2 ou 4 rodas) | 2–4 |
| Fonte de alimentação para os motores (4–6V) | 1 |
| Jumpers / fios | — |

---

## Esquema de ligação

### HC-05 → Arduino

| Pino HC-05 | Pino Arduino |
|---|---|
| VCC | 5V |
| GND | GND |
| TXD | **2** (RX do SoftwareSerial) |
| RXD | **7** (TX do SoftwareSerial) ⚠️ use divisor de tensão 5V→3.3V |

> O HC-05 opera em 3.3V no pino RXD. Conectar diretamente 5V pode danificar o módulo.
> Solução simples: divisor resistivo com R1=1kΩ e R2=2kΩ entre o pino 7 do Arduino e o RXD do HC-05.

### L9110S → Arduino

| Pino L9110S | Pino Arduino | Motor |
|---|---|---|
| A-IA | 6 | Motor 1 |
| A-IB | 4 | Motor 1 |
| B-IA | 8 | Motor 2 |
| B-IB | 5 | Motor 2 |

---

## Gravando o firmware no Arduino

1. Instale a [Arduino IDE](https://www.arduino.cc/en/software)
2. Abra o arquivo `meu_carrinho_final.ino`
3. **Desconecte o pino 2 do HC-05** antes de gravar (o SoftwareSerial interfere no upload)
4. Selecione a placa: `Ferramentas → Placa → Arduino Uno`
5. Selecione a porta: `Ferramentas → Porta → COMx` (a porta USB do Arduino)
6. Clique em **Carregar**
7. Após o upload, reconecte o pino 2

---

## Pareando o HC-05 no computador

O HC-05 usa **Bluetooth Clássico (SPP/RFCOMM)** — ele aparece como uma porta serial virtual após o pareamento.

### Windows

1. Ligue o carrinho (LED do HC-05 pisca rápido = aguardando)
2. Abra **Configurações → Bluetooth e dispositivos → Adicionar dispositivo**
3. Selecione **HC-05** (PIN padrão: `1234` ou `0000`)
4. Após parear, abra **Dispositivos e Impressoras**
5. Clique com botão direito em HC-05 → **Propriedades → Serviços** → anote a porta COM (ex: `COM6`)

### macOS

1. Abra **Preferências do Sistema → Bluetooth**
2. Pareie o **HC-05**
3. Abra o terminal e confirme a porta: `ls /dev/tty.HC*`
   — ela aparece como `/dev/tty.HC-05-DevB` ou similar

---

## Usando o controle web

> Compatível com **Google Chrome** e **Microsoft Edge** no desktop.
> Firefox e Safari não suportam Web Serial API.

1. Acesse [https://arduino-pi-lime.vercel.app](https://arduino-pi-lime.vercel.app)
2. Clique em **Conectar Bluetooth**
3. No picker do navegador, selecione a porta COM do HC-05
4. O status muda para **Conectado**
5. Use os botões direcionais ou o teclado:

| Tecla | Ação |
|---|---|
| `W` / `↑` | Frente |
| `S` / `↓` | Ré |
| `A` / `←` | Esquerda |
| `D` / `→` | Direita |
| Soltar | Para |

---

## Comandos seriais (referência)

| Caractere enviado | Ação no Arduino |
|---|---|
| `F` | Frente |
| `B` | Ré |
| `L` | Esquerda |
| `R` | Direita |
| `S` | Parar |

Baud rate: **9600**

---

## Solução de problemas

**O picker não mostra a porta do HC-05**
Verifique se o pareamento foi concluído no SO e se a porta COM foi criada (Device Manager no Windows).

**Conecta mas o carrinho não responde**
Confirme que o firmware foi gravado com sucesso e que os pinos estão corretos conforme a tabela acima.

**O carrinho se move ao contrário**
Inverta os fios de um dos motores na ponte H, ou troque `motorPinA` ↔ `motorPinB` no `.ino`.

**Conexão cai com frequência**
Verifique a alimentação dos motores — picos de corrente podem resetar o Arduino. Use capacitores de desacoplamento (100µF) nos terminais dos motores.

**"Web Serial API não suportada"**
Use Chrome ou Edge no desktop. Não funciona no Firefox, Safari ou em dispositivos móveis.
