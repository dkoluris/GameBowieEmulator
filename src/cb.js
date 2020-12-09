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
    cpu.r.f = (!x) << 7; \

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
                case 0: RLC(cpu.r.b); break;
                case 1: RLC(cpu.r.c); break;
                case 2: RLC(cpu.r.d); break;
                case 3: RLC(cpu.r.e); break;
                case 4: RLC(cpu.r.h); break;
                case 5: RLC(cpu.r.l); break;
                case 7: RLC(cpu.r.a); break;

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
                case 0: RRC(cpu.r.b); break;
                case 1: RRC(cpu.r.c); break;
                case 2: RRC(cpu.r.d); break;
                case 3: RRC(cpu.r.e); break;
                case 4: RRC(cpu.r.h); break;
                case 5: RRC(cpu.r.l); break;
                case 7: RRC(cpu.r.a); break;

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
                case 0: RL(cpu.r.b); break;
                case 1: RL(cpu.r.c); break;
                case 2: RL(cpu.r.d); break;
                case 3: RL(cpu.r.e); break;
                case 4: RL(cpu.r.h); break;
                case 5: RL(cpu.r.l); break;
                case 7: RL(cpu.r.a); break;

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
                case 0: RR(cpu.r.b); break;
                case 1: RR(cpu.r.c); break;
                case 2: RR(cpu.r.d); break;
                case 3: RR(cpu.r.e); break;
                case 4: RR(cpu.r.h); break;
                case 5: RR(cpu.r.l); break;
                case 7: RR(cpu.r.a); break;

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
                case 0: SLA(cpu.r.b); break;
                case 1: SLA(cpu.r.c); break;
                case 2: SLA(cpu.r.d); break;
                case 3: SLA(cpu.r.e); break;
                case 4: SLA(cpu.r.h); break;
                case 5: SLA(cpu.r.l); break;
                case 7: SLA(cpu.r.a); break;

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
                case 0: SWAP(cpu.r.b); break;
                case 1: SWAP(cpu.r.c); break;
                case 2: SWAP(cpu.r.d); break;
                case 3: SWAP(cpu.r.e); break;
                case 4: SWAP(cpu.r.h); break;
                case 5: SWAP(cpu.r.l); break;
                case 7: SWAP(cpu.r.a); break;

                case 6: // (HL)
                    f = mem.read.b(fetchHL());
                    f = ((f & 0xf) << 4) | ((f & 0xf0) >>> 4);
                    mem.write.b(fetchHL(), f);
                    cpu.r.f = (!f) << 7;
                    break;

                default:
                    emulator.error('CPU SWAP Opcode ' + emulator.hex(addr));
                    break;
            }
        },

        opcodeSRA(addr) {
            let f, f2;

            switch (addr) {
                case 0: SRA(cpu.r.b); break;
                case 1: SRA(cpu.r.c); break;
                case 2: SRA(cpu.r.d); break;
                case 3: SRA(cpu.r.e); break;
                case 4: SRA(cpu.r.h); break;
                case 5: SRA(cpu.r.l); break;
                case 7: SRA(cpu.r.a); break;

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
                case 0: SRL(cpu.r.b); break;
                case 1: SRL(cpu.r.c); break;
                case 2: SRL(cpu.r.d); break;
                case 3: SRL(cpu.r.e); break;
                case 4: SRL(cpu.r.h); break;
                case 5: SRL(cpu.r.l); break;
                case 7: SRL(cpu.r.a); break;

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
                case 0: f = !(cpu.r.b & bit); break;
                case 1: f = !(cpu.r.c & bit); break;
                case 2: f = !(cpu.r.d & bit); break;
                case 3: f = !(cpu.r.e & bit); break;
                case 4: f = !(cpu.r.h & bit); break;
                case 5: f = !(cpu.r.l & bit); break;
                case 7: f = !(cpu.r.a & bit); break;

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
                case 0: cpu.r.b &= (~(bit)); break;
                case 1: cpu.r.c &= (~(bit)); break;
                case 2: cpu.r.d &= (~(bit)); break;
                case 3: cpu.r.e &= (~(bit)); break;
                case 4: cpu.r.h &= (~(bit)); break;
                case 5: cpu.r.l &= (~(bit)); break;
                case 7: cpu.r.a &= (~(bit)); break;

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
                case 0: cpu.r.b |= bit; break;
                case 1: cpu.r.c |= bit; break;
                case 2: cpu.r.d |= bit; break;
                case 3: cpu.r.e |= bit; break;
                case 4: cpu.r.h |= bit; break;
                case 5: cpu.r.l |= bit; break;
                case 7: cpu.r.a |= bit; break;

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
