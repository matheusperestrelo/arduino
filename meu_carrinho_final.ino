#include <SoftwareSerial.h>

// HC-05: RX_do_modulo → pino 2 do Arduino, TX_do_modulo → pino 7 do Arduino
// IMPORTANTE: o pino 3 era TX do SoftwareSerial E motorPinA2 ao mesmo tempo.
// Movido TX para pino 7 para eliminar o conflito.
SoftwareSerial bluetooth(2, 7);

// Definição dos pinos conectados à ponte H L9110S
const int motorPinA  = 6; // Motor 1 – Entrada IA
const int motorPinB  = 4; // Motor 1 – Entrada IB
const int motorPinA2 = 8; // Motor 2 – Entrada IA (era 3 — conflito com TX BT)
const int motorPinB2 = 5; // Motor 2 – Entrada IB
char command;

void setup() {
  pinMode(motorPinA, OUTPUT);
  pinMode(motorPinB, OUTPUT);
  pinMode(motorPinA2, OUTPUT);
  pinMode(motorPinB2, OUTPUT);

  // Serial para debug no computador
  Serial.begin(9600);
  // Inicializa o Bluetooth
  bluetooth.begin(9600);

  Serial.println("Carrinho L9110S Bluetooth Iniciado!");
  parar();
}

void loop() {
  // Lê do Bluetooth em vez do Serial do PC
  if (bluetooth.available() > 0) {
    command = bluetooth.read();
    Serial.println(command); // Mostra no PC qual letra chegou do Bluetooth

    // Mapeamento que funciona tanto para o Controle Web quanto para o App de
    // Celular
    if (command == 'F' || command == 'f' || command == 'w') {
      frente();
    } else if (command == 'B' || command == 'b' || command == 's') {
      tras();
    } else if (command == 'L' || command == 'l' || command == 'a') {
      esquerda();
    } else if (command == 'R' || command == 'r' || command == 'd') {
      direita();
    } else if (command == 'S' || command == 'x') {
      parar();
    }
  }
}

// --- Funções de Movimento ---
// NOTA: Os loops "for" com delay() e o delay(2000) foram removidos.
// Para controle remoto em TEMPO REAL, o carrinho precisa responder
// instantaneamente. Se houvesse um delay(2000), o carrinho bateria na parede
// antes de ler o comando de parar!

void tras() {
  digitalWrite(motorPinB, LOW);
  digitalWrite(motorPinB2, LOW);
  analogWrite(motorPinA, 255); // Vai direto pra velocidade máxima (255)
  analogWrite(motorPinA2, 255);
}

void frente() {
  digitalWrite(motorPinA, LOW);
  digitalWrite(motorPinA2, LOW);
  analogWrite(motorPinB, 255);
  analogWrite(motorPinB2, 255);
}

void direita() {
  digitalWrite(motorPinA, LOW);
  digitalWrite(motorPinB2, LOW);
  analogWrite(motorPinB, 255);
  analogWrite(motorPinA2, 255);
}

void esquerda() {
  digitalWrite(motorPinA2, LOW);
  digitalWrite(motorPinB, LOW);
  analogWrite(motorPinB2, 255);
  analogWrite(motorPinA, 255);
}

void parar() {
  digitalWrite(motorPinA, LOW);
  digitalWrite(motorPinB, LOW);
  digitalWrite(motorPinA2, LOW);
  digitalWrite(motorPinB2, LOW);
}
