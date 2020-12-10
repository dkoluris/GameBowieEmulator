/* Base structure taken from GAMEBOY open source emulator, and improved upon (Credits: Peter Johnson (zid)) */

#define RLC(x) \
    f = !!(x & 0x80); \
    x = (x << 1) | f; \
    setC(f); \
    setZ(!x); \

#define RRC(x) \
    f = x & 1; \
    setC(f); \
    x = x >>> 1 | f << 7; \
    setZ(!x); \

#define RL(x) \
    f = isSetC; \
    setC(!!(x & 0x80)); \
    x = (x << 1) | !!(f); \
    setZ(!x); \

#define RR(x) \
    f = isSetC; \
    setC(x & 1); \
    x = (x >>> 1) | f << 7; \
    setZ(!x); \

#define SLA(x) \
    setC(!!(x & 0x80)); \
    x = x << 1; \
    setZ(!x); \

#define SWAP(x) \
    x = ((x & 0xf) << 4) | ((x & 0xf0) >>> 4); \
    rf = (!x) << 7; \

#define SRA(x) \
    setC(x & 1); \
    f = x & 0x80; \
    x = x >>> 1 | f; \
    setZ(!x); \

#define SRL(x) \
    setC(x & 1); \
    x = x >>> 1; \
    setZ(!x); \

GameBowie.CstrOpcodeCB = function() {
    // Exposed class functions/variables
    return {
        opcodeRLC(addr) {
            let f, f2;

            switch (addr) {
                case 0: RLC(rb); break;
                case 1: RLC(rc); break;
                case 2: RLC(rd); break;
                case 3: RLC(re); break;
                case 4: RLC(rh); break;
                case 5: RLC(rl); break;
                case 7: RLC(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f2 = !!(f & 0x80);
                    setC(f2);
                    f = f << 1 | f2;
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU RLC Opcode ' + emulator.hex(addr));
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRRC(addr) {
            let f, f2;

            switch (addr) {
                case 0: RRC(rb); break;
                case 1: RRC(rc); break;
                case 2: RRC(rd); break;
                case 3: RRC(re); break;
                case 4: RRC(rh); break;
                case 5: RRC(rl); break;
                case 7: RRC(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f2 = f;
                    setC(f2);
                    f = f >>> 1 | f2 << 7;
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU RRC Opcode ' + emulator.hex(addr));
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRL(addr) {
            let f, f2;
            
            switch (addr) {
                case 0: RL(rb); break;
                case 1: RL(rc); break;
                case 2: RL(rd); break;
                case 3: RL(re); break;
                case 4: RL(rh); break;
                case 5: RL(rl); break;
                case 7: RL(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f2 = isSetC;
                    setC(!!(f & 0x80));
                    f = (f << 1) | !!(f2);
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU RL Opcode ' + emulator.hex(addr));
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRR(addr) {
            let f, f2;
            
            switch (addr) {
                case 0: RR(rb); break;
                case 1: RR(rc); break;
                case 2: RR(rd); break;
                case 3: RR(re); break;
                case 4: RR(rh); break;
                case 5: RR(rl); break;
                case 7: RR(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f2 = isSetC;
                    setC(f & 1);
                    f = (f >>> 1) | f2 << 7;
                    setZ(!f);
                    mem.write.b(fetchHL(), f);
                    break;

                default:
                    emulator.error('CPU RR Opcode ' + emulator.hex(addr));
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeSLA(addr) {
            let f;

            switch (addr) {
                case 0: SLA(rb); break;
                case 1: SLA(rc); break;
                case 2: SLA(rd); break;
                case 3: SLA(re); break;
                case 4: SLA(rh); break;
                case 5: SLA(rl); break;
                case 7: SLA(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    setC(!!(f & 0x80));
                    f = f << 1;
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU SLA Opcode ' + emulator.hex(addr));
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeSWAP(addr) {
            let f;

            switch (addr) {
                case 0: SWAP(rb); break;
                case 1: SWAP(rc); break;
                case 2: SWAP(rd); break;
                case 3: SWAP(re); break;
                case 4: SWAP(rh); break;
                case 5: SWAP(rl); break;
                case 7: SWAP(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f = ((f & 0xf) << 4) | ((f & 0xf0) >>> 4);
                    mem.write.b(fetchHL(), f);
                    rf = (!f) << 7;
                    break;

                default:
                    emulator.error('CPU SWAP Opcode ' + emulator.hex(addr));
                    break;
            }
        },

        opcodeSRA(addr) {
            let f, f2;

            switch (addr) {
                case 0: SRA(rb); break;
                case 1: SRA(rc); break;
                case 2: SRA(rd); break;
                case 3: SRA(re); break;
                case 4: SRA(rh); break;
                case 5: SRA(rl); break;
                case 7: SRA(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    setC(f & 1);
                    f2 = f & 0x80;
                    f = f >>> 1 | f2;
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU SRA Opcode ' + emulator.hex(addr));
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeSRL(addr) {
            let f;

            switch (addr) {
                case 0: SRL(rb); break;
                case 1: SRL(rc); break;
                case 2: SRL(rd); break;
                case 3: SRL(re); break;
                case 4: SRL(rh); break;
                case 5: SRL(rl); break;
                case 7: SRL(ra); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    setC(f & 1);
                    f = f >>> 1;
                    mem.write.b(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    emulator.error('CPU SRL Opcode ' + emulator.hex(addr));
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeBIT(addr, bit) {
            let f;

            switch (addr) {
                case 0: f = !(rb & bit); break;
                case 1: f = !(rc & bit); break;
                case 2: f = !(rd & bit); break;
                case 3: f = !(re & bit); break;
                case 4: f = !(rh & bit); break;
                case 5: f = !(rl & bit); break;
                case 7: f = !(ra & bit); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f = !(f & bit);
                    break;

                default:
                    emulator.error('CPU BIT Opcode ' + emulator.hex(addr));
                    break;
            }

            setZ(f);
            setN(0);
            setH(1);
        },

        opcodeRES(addr, bit) {
            let f;

            switch (addr) {
                case 0: rb &= (~(bit)); break;
                case 1: rc &= (~(bit)); break;
                case 2: rd &= (~(bit)); break;
                case 3: re &= (~(bit)); break;
                case 4: rh &= (~(bit)); break;
                case 5: rl &= (~(bit)); break;
                case 7: ra &= (~(bit)); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f &= (~(bit));
                    mem.write.b(fetchHL(), f);
                    break;

                default:
                    emulator.error('CPU RES Opcode ' + emulator.hex(addr));
                    break;
            }
        },

        opcodeSET(addr, bit) {
            let f;

            switch (addr) {
                case 0: rb |= bit; break;
                case 1: rc |= bit; break;
                case 2: rd |= bit; break;
                case 3: re |= bit; break;
                case 4: rh |= bit; break;
                case 5: rl |= bit; break;
                case 7: ra |= bit; break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f |= bit;
                    mem.write.b(fetchHL(), f);
                    break;

                default:
                    emulator.error('CPU SET Opcode ' + emulator.hex(addr));
                    break;
            }
        },

        executeCB(data) {
            let opcode = (data >>> 3);
            let addr   = (data >>> 0) & 7;

            if (8 > opcode) {
                switch (opcode) {
                    case 0: cb.opcodeRLC (addr); break;
                    case 1: cb.opcodeRRC (addr); break;
                    case 2: cb.opcodeRL  (addr); break;
                    case 3: cb.opcodeRR  (addr); break;
                    case 4: cb.opcodeSLA (addr); break;
                    case 5: cb.opcodeSRA (addr); break;
                    case 6: cb.opcodeSWAP(addr); break;
                    case 7: cb.opcodeSRL (addr) ;break;

                    default:
                        emulator.error('CPU CB 1 Opcode ' + emulator.hex(opcode));
                        break;
                }
            }
            else {
                let bit = 1 << (opcode & 7);

                switch ((opcode >>> 3) - 1) {
                    case 0: cb.opcodeBIT(addr, bit); break;
                    case 1: cb.opcodeRES(addr, bit); break;
                    case 2: cb.opcodeSET(addr, bit); break;

                    default:
                        emulator.error('CPU CB 2 Opcode ' + emulator.hex((opcode >>> 3) - 1));
                        break;
                }
            }
        }
    };
};

const cb = new GameBowie.CstrOpcodeCB();
