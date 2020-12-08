// Preprocessor
#define bSize           byteLength
#define dataBin         'arraybuffer'
#define dest            target
#define readAsBuffer    readAsArrayBuffer
#define responseSort    responseType
#define Text            String
#define toText          toString

// Bit Manipulation
#define SIGN_EXT_8(n) \
    ((n) << 24 >> 24)

// Screen
#define LCD_RES_X \
    160

#define LCD_RES_Y \
    144

// Console output
#define MSG_INFO  'info'
#define MSG_ERROR 'error'

// Declare namespace
const GameBowie = window.GameBowie || {};

'use strict';
