// Preprocessor
#define bSize           byteLength
#define dataBin         'arraybuffer'
#define dest            target
#define readAsBuffer    readAsArrayBuffer
#define responseSort    responseType
#define Text            String
#define toText          toString
#define UintHcap        Uint16Array
#define UintBcap        Uint8Array

// Bit Manipulation
#define SIGN_EXT_8(n) \
    ((n) << 24 >> 24)

// Sharp SM83
#define setAF(x) { let tmp = x; cpu.r.f = tmp & 0xff; cpu.r.a = tmp >> 8; }
#define setBC(x) { let tmp = x; cpu.r.c = tmp & 0xff; cpu.r.b = tmp >> 8; }
#define setDE(x) { let tmp = x; cpu.r.e = tmp & 0xff; cpu.r.d = tmp >> 8; }
#define setHL(x) { let tmp = x; cpu.r.l = tmp & 0xff; cpu.r.h = tmp >> 8; }

#define fetchAF() ((cpu.r.a << 8) | cpu.r.f)
#define fetchBC() ((cpu.r.b << 8) | cpu.r.c)
#define fetchDE() ((cpu.r.d << 8) | cpu.r.e)
#define fetchHL() ((cpu.r.h << 8) | cpu.r.l)

#define setZ(x) cpu.r.f = (cpu.r.f & 0x7f) | ((x) << 7)
#define setN(x) cpu.r.f = (cpu.r.f & 0xbf) | ((x) << 6)
#define setH(x) cpu.r.f = (cpu.r.f & 0xdf) | ((x) << 5)
#define setC(x) cpu.r.f = (cpu.r.f & 0xef) | ((x) << 4)

#define isSetZ !!(cpu.r.f & 0x80)
#define isSetN !!(cpu.r.f & 0x40)
#define isSetH !!(cpu.r.f & 0x20)
#define isSetC !!(cpu.r.f & 0x10)

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
    x = mem.readb(pc); \
    pc += 1; \

#define ANDR(x) \
    cpu.r.a &= x; \
    setZ(!cpu.r.a); \
    setH(1); \
    setN(0); \
    setC(0); \

#define XORR(x) \
    cpu.r.a ^= x; \
    setZ(!cpu.r.a); \
    setH(0); \
    setN(0); \
    setC(0); \

#define ORR(x) \
    cpu.r.a |= x; \
    setZ(!cpu.r.a); \
    setH(0); \
    setN(0); \
    setC(0); \

#define CPR(x) \
    setC((cpu.r.a - x) < 0); \
    setH(((cpu.r.a - x) & 0xf) > (cpu.r.a & 0xf)); \
    setZ(cpu.r.a == x); \
    setN(1); \

#define SUBR(x) \
    setC((cpu.r.a - x) < 0); \
    setH(((cpu.r.a - x) & 0xf) > (cpu.r.a & 0xf)); \
    cpu.r.a -= x; \
    setZ(!cpu.r.a); \
    setN(1); \

// Screen
#define LCD_RES_X \
    160

#define LCD_RES_Y \
    144

// Console output
#define MSG_INFO  'info'
#define MSG_ERROR 'error'

// A helper for bit manipulation
function union(size) {
    const bfr = new ArrayBuffer(size);

    return {
        uh: new UintHcap(bfr),
        ub: new UintBcap(bfr),
    };
}

// Declare namespace
const GameBowie = window.GameBowie || {};

'use strict';
