// Preprocessor
#define bSize           byteLength
#define dataBin         'arraybuffer'
#define dest            target
#define fetchContext    getContext
#define readAsBuffer    readAsArrayBuffer
#define responseSort    responseType
#define Text            String
#define toText          toString
#define UintHcap        Uint16Array
#define UintBcap        Uint8Array

// Bit Manipulation
#define SIGN_EXT_8(n) \
    ((n) << 24 >> 24)

#define ra cpu.r[0]
#define rb cpu.r[1]
#define rc cpu.r[2]
#define rd cpu.r[3]
#define re cpu.r[4]
#define rf cpu.r[5]
#define rh cpu.r[6]
#define rl cpu.r[7]

// Sharp SM83
#define setAF(x) { let tmp = x; rf = tmp & 0xff; ra = tmp >>> 8; }
#define setBC(x) { let tmp = x; rc = tmp & 0xff; rb = tmp >>> 8; }
#define setDE(x) { let tmp = x; re = tmp & 0xff; rd = tmp >>> 8; }
#define setHL(x) { let tmp = x; rl = tmp & 0xff; rh = tmp >>> 8; }

#define fetchAF() ((ra << 8) | rf)
#define fetchBC() ((rb << 8) | rc)
#define fetchDE() ((rd << 8) | re)
#define fetchHL() ((rh << 8) | rl)

#define setZ(x) rf = (rf & 0x7f) | ((x) << 7)
#define setN(x) rf = (rf & 0xbf) | ((x) << 6)
#define setH(x) rf = (rf & 0xdf) | ((x) << 5)
#define setC(x) rf = (rf & 0xef) | ((x) << 4)

#define isSetZ !!(rf & 0x80)
#define isSetN !!(rf & 0x40)
#define isSetH !!(rf & 0x20)
#define isSetC !!(rf & 0x10)

#define INC(x) \
    x++; \
    setZ(!x); \
    setH((x & 0xf) == 0); \
    setN(0); \

#define DEC(x) \
    x--; \
    setZ(!x); \
    setN(1); \
    setH((x & 0xf) == 0xf); \

#define LDRR(x, z) \
    x = z; \

#define LDRIMM8(x) \
    x = mem.read.b(cpu.pc); \
    cpu.pc += 1; \

#define ANDR(x) \
    ra &= x; \
    setZ(!ra); \
    setH(1); \
    setN(0); \
    setC(0); \

#define XORR(x) \
    ra ^= x; \
    setZ(!ra); \
    setH(0); \
    setN(0); \
    setC(0); \

#define ORR(x) \
    ra |= x; \
    setZ(!ra); \
    setH(0); \
    setN(0); \
    setC(0); \

#define CPR(x) \
    setC((ra - x) < 0); \
    setH(((ra - x) & 0xf) > (ra & 0xf)); \
    setZ(ra == x); \
    setN(1); \

#define SUBR(x) \
    setC((ra - x) < 0); \
    setH(((ra - x) & 0xf) > (ra & 0xf)); \
    ra -= x; \
    setZ(!ra); \
    setN(1); \

// Screen
#define LCD_RES_X \
    160

#define LCD_RES_Y \
    144

// Interrupts
#define IRQ_VBLANK  0x01
#define IRQ_LCDC    0x02
#define IRQ_TIMER   0x04
#define IRQ_SERIAL  0x08
#define IRQ_CONTROL 0x10
#define IRQ_ANY     0x1f

// Console output
#define MSG_INFO  'info'
#define MSG_ERROR 'error'

// Declare namespace
const GameBowie = window.GameBowie || {};

'use strict';
