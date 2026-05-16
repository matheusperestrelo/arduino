export const BT_CONFIG = {
  BAUD_RATE: 9600,
  RECONNECT_BASE_DELAY_MS: 2000,
  RECONNECT_MAX_DELAY_MS: 30000,
  RECONNECT_BACKOFF_FACTOR: 2,
  MAX_RECONNECT_ATTEMPTS: 8,
};

// ASCII commands matching Arduino's Serial.read() expectations
export const COMMANDS = {
  FORWARD:  'F',
  BACKWARD: 'B',
  LEFT:     'L',
  RIGHT:    'R',
  STOP:     'S',
};
