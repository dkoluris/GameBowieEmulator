#define RLC(x) \
    f = !!(x & 0x80); \
    x = (x << 1) | f; \
    setC(f); \
    setZ(!x); \

#define RRC(x) \
    f = x & 1; \
    setC(f); \
    x = x >> 1 | f << 7; \
    setZ(!x); \

#define RL(x) \
    f = isSetC; \
    setC(!!(x & 0x80)); \
    x = (x << 1) | !!(f); \
    setZ(!x); \

#define RR(x) \
    f = isSetC; \
    setC(x & 1); \
    x = (x >> 1) | f << 7; \
    setZ(!x); \

#define SLA(x) \
    setC(!!(x & 0x80)); \
    x = x << 1; \
    setZ(!x); \

#define SWAP(x) \
    x = ((x & 0xf) << 4) | ((x & 0xf0) >> 4); \
    r.f = (!x) << 7; \

#define SRA(x) \
    setC(x & 1); \
    f = x & 0x80; \
    x = x >> 1 | f; \
    setZ(!x); \

#define SRL(x) \
    setC(x & 1); \
    x = x >> 1; \
    setZ(!x); \

GameBowie.CstrOpcodeCB = function() {
    return {
        opcodeRLC(addr) {
            let f, f2;

            switch (addr) {
                case 0: RLC(r.b); break;
                case 1: RLC(r.c); break;
                case 2: RLC(r.d); break;
                case 3: RLC(r.e); break;
                case 4: RLC(r.h); break;
                case 5: RLC(r.l); break;
                case 7: RLC(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f2 = !!(f & 0x80);
                    setC(f2);
                    f = f << 1 | f2;
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU RLC Opcode 0x%x", addr);
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRRC(addr) {
            let f, f2;

            switch (addr) {
                case 0: RRC(r.b); break;
                case 1: RRC(r.c); break;
                case 2: RRC(r.d); break;
                case 3: RRC(r.e); break;
                case 4: RRC(r.h); break;
                case 5: RRC(r.l); break;
                case 7: RRC(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f2 = f;
                    setC(f2);
                    f = f >> 1 | f2 << 7;
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU RRC Opcode 0x%x", addr);
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRL(addr) {
            let f, f2;
            
            switch (addr) {
                case 0: RL(r.b); break;
                case 1: RL(r.c); break;
                case 2: RL(r.d); break;
                case 3: RL(r.e); break;
                case 4: RL(r.h); break;
                case 5: RL(r.l); break;
                case 7: RL(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f2 = isSetC;
                    setC(!!(f & 0x80));
                    f = (f << 1) | !!(f2);
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU RL Opcode 0x%x", addr);
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeRR(addr) {
            let f, f2;
            
            switch (addr) {
                case 0: RR(r.b); break;
                case 1: RR(r.c); break;
                case 2: RR(r.d); break;
                case 3: RR(r.e); break;
                case 4: RR(r.h); break;
                case 5: RR(r.l); break;
                case 7: RR(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f2 = isSetC;
                    setC(f & 1);
                    f = (f >> 1) | f2 << 7;
                    setZ(!f);
                    mem.writeb(fetchHL(), f);
                    break;

                default:
                    printx("/// Gemuboi CPU RR Opcode 0x%x", addr);
                    break;
            }

            setN(0);
            setH(0);
        },

        opcodeSLA(addr) {
            let f;

            switch (addr) {
                case 0: SLA(r.b); break;
                case 1: SLA(r.c); break;
                case 2: SLA(r.d); break;
                case 3: SLA(r.e); break;
                case 4: SLA(r.h); break;
                case 5: SLA(r.l); break;
                case 7: SLA(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    setC(!!(f & 0x80));
                    f = f << 1;
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU SLA Opcode 0x%x", addr);
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeSWAP(addr) {
            let f;

            switch (addr) {
                case 0: SWAP(r.b); break;
                case 1: SWAP(r.c); break;
                case 2: SWAP(r.d); break;
                case 3: SWAP(r.e); break;
                case 4: SWAP(r.h); break;
                case 5: SWAP(r.l); break;
                case 7: SWAP(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f = ((f & 0xf) << 4) | ((f & 0xf0) >> 4);
                    mem.writeb(fetchHL(), f);
                    r.f = (!f) << 7;
                    break;

                default:
                    printx("/// Gemuboi CPU SWAP Opcode 0x%x", addr);
                    break;
            }
        },

        opcodeSRA(addr) {
            let f, f2;

            switch (addr) {
                case 0: SRA(r.b); break;
                case 1: SRA(r.c); break;
                case 2: SRA(r.d); break;
                case 3: SRA(r.e); break;
                case 4: SRA(r.h); break;
                case 5: SRA(r.l); break;
                case 7: SRA(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    setC(f & 1);
                    f2 = f & 0x80;
                    f = f >> 1 | f2;
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU SRA Opcode 0x%x", addr);
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeSRL(addr) {
            let f;

            switch (addr) {
                case 0: SRL(r.b); break;
                case 1: SRL(r.c); break;
                case 2: SRL(r.d); break;
                case 3: SRL(r.e); break;
                case 4: SRL(r.h); break;
                case 5: SRL(r.l); break;
                case 7: SRL(r.a); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    setC(f & 1);
                    f = f >> 1;
                    mem.writeb(fetchHL(), f);
                    setZ(!f);
                    break;

                default:
                    printx("/// Gemuboi CPU SRL Opcode 0x%x", addr);
                    break;
            }

            setH(0);
            setN(0);
        },

        opcodeBIT(addr, bit) {
            let f;

            switch (addr) {
                case 0: f = !(r.b & bit); break;
                case 1: f = !(r.c & bit); break;
                case 2: f = !(r.d & bit); break;
                case 3: f = !(r.e & bit); break;
                case 4: f = !(r.h & bit); break;
                case 5: f = !(r.l & bit); break;
                case 7: f = !(r.a & bit); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f = !(f & bit);
                    break;

                default:
                    printx("/// Gemuboi CPU BIT Opcode 0x%x", addr);
                    break;
            }

            setZ(f);
            setN(0);
            setH(1);
        },

        opcodeRES(addr, bit) {
            let f;

            switch (addr) {
                case 0: r.b &= (~(bit)); break;
                case 1: r.c &= (~(bit)); break;
                case 2: r.d &= (~(bit)); break;
                case 3: r.e &= (~(bit)); break;
                case 4: r.h &= (~(bit)); break;
                case 5: r.l &= (~(bit)); break;
                case 7: r.a &= (~(bit)); break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f &= (~(bit));
                    mem.writeb(fetchHL(), f);
                    break;

                default:
                    printx("/// Gemuboi CPU RES Opcode 0x%x", addr);
                    break;
            }
        },

        opcodeSET(addr, bit) {
            let f;

            switch (addr) {
                case 0: r.b |= bit; break;
                case 1: r.c |= bit; break;
                case 2: r.d |= bit; break;
                case 3: r.e |= bit; break;
                case 4: r.h |= bit; break;
                case 5: r.l |= bit; break;
                case 7: r.a |= bit; break;

                case 6: // (HL)
                    f = mem.readb(fetchHL());
                    f |= bit;
                    mem.writeb(fetchHL(), f);
                    break;

                default:
                    printx("/// Gemuboi CPU SET Opcode 0x%x", addr);
                    break;
            }
        },

        executeCB(data) {
            let opcode = (data >> 3);
            let addr   = (data >> 0) & 7;

            if (8 > opcode) {
                switch (opcode) {
                    case 0: opcodeRLC (addr); break;
                    case 1: opcodeRRC (addr); break;
                    case 2: opcodeRL  (addr); break;
                    case 3: opcodeRR  (addr); break;
                    case 4: opcodeSLA (addr); break;
                    case 5: opcodeSRA (addr); break;
                    case 6: opcodeSWAP(addr); break;
                    case 7: opcodeSRL (addr) ;break;

                    default:
                        printx("/// Gemuboi CPU CB 1 Opcode 0x%x", opcode);
                        break;
                }
            }
            else {
                let bit = 1 << (opcode & 7);

                switch ((opcode >> 3) - 1) {
                    case 0: opcodeBIT(addr, bit); break;
                    case 1: opcodeRES(addr, bit); break;
                    case 2: opcodeSET(addr, bit); break;

                    default:
                        printx("/// Gemuboi CPU CB 2 Opcode 0x%x", ((opcode >> 3) - 1));
                        break;
                }
            }
        }
    };
};

const cb = new GameBowie.CstrOpcodeCB();
