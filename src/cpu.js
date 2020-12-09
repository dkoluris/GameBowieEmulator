/* Base structure taken from GAMEBOY open source emulator, and improved upon (Credits: Peter Johnson (zid)) */

GameBowie.CstrSharpSM83 = function() {
    let tmp8, tmp8_2, tmp16, tmp32;

    // Exposed class functions/variables
    return {
          pc: undefined,
          sp: undefined,
        halt: undefined,

        // REGS
        r: {
            a: 0,
            b: 0,
            c: 0,
            d: 0,
            e: 0,
            f: 0,
            h: 0,
            l: 0,
        },

        reset() {
            cpu.pc   = 0x0;
            cpu.sp   = 0xfffe;
            cpu.halt = false;

            setAF(0x01b0);
            setBC(0x0013);
            setDE(0x00d8);
            setHL(0x014d);
        },

        step() {
            if (cpu.halt) {
                return 0;
            }

            let opcode = mem.read.b(cpu.pc++);

            switch (opcode) {
                case 0x00:
                    break;

                case 0x01: // LD BC, imm16
                    setBC(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0x02: // LD (BC), A
                    mem.write.b(fetchBC(), cpu.r.a);
                    break;

                case 0x03: // INC BC
                    setBC(fetchBC() + 1);
                    break;

                case 0x04: // INC B
                    INC(cpu.r.b);
                    break;

                case 0x05: // DEC B
                    DEC(cpu.r.b);
                    break;

                case 0x06: // LD B, imm8
                    LDRIMM8(cpu.r.b);
                    break;

                case 0x07: // RLCA
                    cb.opcodeRLC(7);
                    setZ(0);
                    break;

                case 0x08: // LD (imm16), SP
                    mem.write.h(mem.read.h(cpu.pc), cpu.sp);
                    cpu.pc += 2;
                    break;

                case 0x09: // ADD HL, BC
                    tmp32 = fetchHL() + fetchBC();
                    setN(0);
                    setC(tmp32 >= 0x10000);
                    setH((tmp32 & 0xfff) < (fetchHL() & 0xfff));
                    setHL(tmp32 & 0xffff);
                    break;

                case 0x0a: // LD A, (BC)
                    cpu.r.a = mem.read.b(fetchBC());
                    break;

                case 0x0b: // DEC BC
                    setBC(fetchBC() - 1);
                    break;

                case 0x0c: // INC C
                    INC(cpu.r.c);
                    break;

                case 0x0d: // DEC C
                    DEC(cpu.r.c);
                    break;

                case 0x0e: // LD C, imm8
                    LDRIMM8(cpu.r.c);
                    break;

                case 0x0f: // RRCA
                    cb.opcodeRRC(7);
                    setZ(0);
                    break;

                case 0x11: // LD DE, imm16
                    setDE(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0x12: // LD (DE), A
                    mem.write.b(fetchDE(), cpu.r.a);
                    break;

                case 0x13: // INC DE
                    setDE(fetchDE() + 1);
                    break;

                case 0x14: // INC D
                    INC(cpu.r.d);
                    break;

                case 0x15: // DEC D
                    DEC(cpu.r.d);
                    break;

                case 0x16: // LD D, imm8
                    LDRIMM8(cpu.r.d);
                    break;

                case 0x17: // RLA
                    cb.opcodeRL(7);
                    setZ(0);
                    break;

                case 0x18: // JR rel8
                    cpu.pc += SIGN_EXT_8(mem.read.b(cpu.pc)) + 1;
                    break;

                case 0x19: // ADD HL, DE
                    tmp32 = fetchHL() + fetchDE();
                    setH((tmp32 & 0xfff) < (fetchHL() & 0xfff));
                    setHL(tmp32);
                    setN(0);
                    setC(tmp32 > 0xffff);
                    break;

                case 0x1a: // LD A, (DE)
                    cpu.r.a = mem.read.b(fetchDE());
                    break;

                case 0x1b: // DEC DE
                    tmp16 = fetchDE();
                    tmp16--;
                    setDE(tmp16);
                    break;

                case 0x1c: // INC E
                    INC(cpu.r.e);
                    break;

                case 0x1d: // DEC E
                    DEC(cpu.r.e);
                    break;

                case 0x1e: // LD E, imm8
                    LDRIMM8(cpu.r.e);
                    break;

                case 0x1f: // RR A
                    cb.opcodeRR(7);
                    setZ(0);
                    break;

                case 0x20: // JR NZ, rel8
                    if (isSetZ == 0) {
                        cpu.pc += SIGN_EXT_8(mem.read.b(cpu.pc)) + 1;
                    }
                    else {
                        cpu.pc += 1;
                    }
                    break;

                case 0x21: // LD HL, imm16
                    setHL(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0x22: // LDI (HL), A
                    mem.write.b(fetchHL(), cpu.r.a);
                    setHL(fetchHL() + 1);
                    break;

                case 0x23: // INC HL
                    setHL(fetchHL() + 1);
                    break;

                case 0x24: // INC H
                    INC(cpu.r.h);
                    break;

                case 0x25: // DEC H
                    DEC(cpu.r.h);
                    break;

                case 0x26: // LD H, imm8
                    LDRIMM8(cpu.r.h);
                    break;

                case 0x27: // DAA
                    tmp16 = cpu.r.a;

                    if (isSetN) {
                        if (isSetH) {
                            tmp16 = (tmp16 - 0x06) & 0xff;
                        }

                        if (isSetC) {
                            tmp16 -= 0x60;
                        }
                    }
                    else {
                        if (isSetH || (tmp16 & 0xf) > 9) {
                            tmp16 += 0x06;
                        }

                        if (isSetC || tmp16 > 0x9f) {
                            tmp16 += 0x60;
                        }
                    }

                    cpu.r.a = tmp16;
                    setH(0);
                    setZ(!cpu.r.a);

                    if (tmp16 >= 0x100) {
                        setC(1);
                    }
                    break;

                case 0x28: // JR Z, rel8
                    if (isSetZ == 1) {
                        cpu.pc += SIGN_EXT_8(mem.read.b(cpu.pc)) + 1;
                    }
                    else {
                        cpu.pc += 1;
                    }
                    break;

                case 0x29: // ADD HL, HL
                    tmp32 = fetchHL() * 2;
                    setH((tmp32 & 0xfff) < (fetchHL() & 0xfff));
                    setC(tmp32 > 0xffff);
                    setHL(tmp32);
                    setN(0);
                    break;

                case 0x2a: // LDI A, (HL)
                    cpu.r.a = mem.read.b(fetchHL());
                    setHL(fetchHL() + 1);
                    break;

                case 0x2b: // DEC HL
                    setHL(fetchHL() - 1);
                    break;

                case 0x2c: // INC L
                    INC(cpu.r.l);
                    break;

                case 0x2d: // DEC L
                    DEC(cpu.r.l);
                    break;

                case 0x2e: // LD L, imm8
                    LDRIMM8(cpu.r.l);
                    break;

                case 0x2f: // CPL
                    cpu.r.a = (~(cpu.r.a));
                    setN(1);
                    setH(1);
                    break;

                case 0x30: // JR NC, rel8
                    if (isSetC == 0) {
                        cpu.pc += SIGN_EXT_8(mem.read.b(cpu.pc)) + 1;
                    }
                    else {
                        cpu.pc += 1;
                    }
                    break;

                case 0x31: // LD SP, imm16
                    cpu.sp = mem.read.h(cpu.pc);
                    cpu.pc += 2;
                    break;

                case 0x32: // LDD (HL), A
                    mem.write.b(fetchHL(), cpu.r.a);
                    setHL(fetchHL() - 1);
                    break;

                case 0x33: // INC SP
                    cpu.sp++;
                    break;

                case 0x34: // INC (HL)
                    tmp8 = mem.read.b(fetchHL()) + 1;
                    mem.write.b(fetchHL(), tmp8);
                    setZ(!tmp8);
                    setN(0);
                    setH((tmp8 & 0xf) == 0);
                    break;

                case 0x35: // DEC (HL)
                    tmp8 = mem.read.b(fetchHL()) - 1;
                    mem.write.b(fetchHL(), tmp8);
                    setZ(!tmp8);
                    setN(1);
                    setH((tmp8 & 0xf) == 0xf);
                    break;

                case 0x36: // LD (HL), imm8
                    mem.write.b(fetchHL(), mem.read.b(cpu.pc));
                    cpu.pc += 1;
                    break;

                case 0x37: // SCF
                    setN(0);
                    setH(0);
                    setC(1);
                    break;

                case 0x38: // JR C, rel8
                    if (isSetC) {
                        cpu.pc += SIGN_EXT_8(mem.read.b(cpu.pc)) + 1;
                    }
                    else {
                        cpu.pc += 1;
                    }
                    break;

                case 0x39: // ADD HL, SP
                    tmp32 = fetchHL() + cpu.sp;
                    setH((tmp32 & 0x7ff) < (fetchHL() & 0x7ff));
                    setC(tmp32 > 0xffff);
                    setN(0);
                    setHL(tmp32);
                    break;

                case 0x3a: // LDD A, (HL)
                    cpu.r.a = mem.read.b(fetchHL());
                    setHL(fetchHL() - 1);
                    break;

                case 0x3b: // DEC SP
                    cpu.sp--;
                    break;

                case 0x3c: // INC A
                    INC(cpu.r.a);
                    break;

                case 0x3d: // DEC A
                    DEC(cpu.r.a);
                    break;

                case 0x3e: // LD A, imm8
                    LDRIMM8(cpu.r.a);
                    break;

                case 0x3f: // CCF
                    setN(0);
                    setH(0);
                    setC(!isSetC);
                    break;

                case 0x40: // LD B, B
                    LDRR(cpu.r.b, cpu.r.b);
                    break;

                case 0x41: // LD B, C
                    LDRR(cpu.r.b, cpu.r.c);
                    break;

                case 0x42: // LD B, D
                    LDRR(cpu.r.b, cpu.r.d);
                    break;

                case 0x43: // LD B, E
                    LDRR(cpu.r.b, cpu.r.e);
                    break;

                case 0x44: // LD B, H
                    LDRR(cpu.r.b, cpu.r.h);
                    break;

                case 0x45: // LD B, L
                    LDRR(cpu.r.b, cpu.r.l);
                    break;

                case 0x46: // LD B, (HL)
                    cpu.r.b = mem.read.b(fetchHL());
                    break;

                case 0x47: // LD B, A
                    LDRR(cpu.r.b, cpu.r.a);
                    break;

                case 0x48: // LD C, B
                    LDRR(cpu.r.c, cpu.r.b);
                    break;

                case 0x49: // LD C, C
                    LDRR(cpu.r.c, cpu.r.c);
                    break;

                case 0x4a: // LD C, D
                    LDRR(cpu.r.c, cpu.r.d);
                    break;

                case 0x4b: // LD C, E
                    LDRR(cpu.r.c, cpu.r.e);
                    break;

                case 0x4c: // LD C, H
                    LDRR(cpu.r.c, cpu.r.h);
                    break;

                case 0x4d: // LD C, L
                    LDRR(cpu.r.c, cpu.r.l);
                    break;

                case 0x4e: // LD C, (HL)
                    cpu.r.c = mem.read.b(fetchHL());
                    break;

                case 0x4f: // LD C, A
                    LDRR(cpu.r.c, cpu.r.a);
                    break;

                case 0x50: // LD D, B
                    LDRR(cpu.r.d, cpu.r.b);
                    break;

                case 0x51: // LD D, C
                    LDRR(cpu.r.d, cpu.r.c);
                    break;

                case 0x52: // LD D, D
                    LDRR(cpu.r.d, cpu.r.d);
                    break;

                case 0x53: // LD D, E
                    LDRR(cpu.r.d, cpu.r.e);
                    break;

                case 0x54: // LD D, H
                    LDRR(cpu.r.d, cpu.r.h);
                    break;

                case 0x55: // LD D, L
                    LDRR(cpu.r.d, cpu.r.l);
                    break;

                case 0x56: // LD D, (HL)
                    cpu.r.d = mem.read.b(fetchHL());
                    break;

                case 0x57: // LD D, A
                    LDRR(cpu.r.d, cpu.r.a);
                    break;

                case 0x58: // LD E, B
                    LDRR(cpu.r.e, cpu.r.b);
                    break;

                case 0x59: // LD E, C
                    LDRR(cpu.r.e, cpu.r.c);
                    break;

                case 0x5a: // LD E, D
                    LDRR(cpu.r.e, cpu.r.d);
                    break;

                case 0x5b: // LD E, E
                    LDRR(cpu.r.e, cpu.r.e);
                    break;

                case 0x5c: // LD E, H
                    LDRR(cpu.r.e, cpu.r.h);
                    break;

                case 0x5d: // LD E, L
                    LDRR(cpu.r.e, cpu.r.l);
                    break;

                case 0x5e: // LD E, (HL)
                    cpu.r.e = mem.read.b(fetchHL());
                    break;

                case 0x5f: // LD E, A
                    LDRR(cpu.r.e, cpu.r.a);
                    break;

                case 0x60: // LD H, B
                    LDRR(cpu.r.h, cpu.r.b);
                    break;

                case 0x61: // LD H, C
                    LDRR(cpu.r.h, cpu.r.c);
                    break;

                case 0x62: // LD H, D
                    LDRR(cpu.r.h, cpu.r.d);
                    break;

                case 0x63: // LD H, E
                    LDRR(cpu.r.h, cpu.r.e);
                    break;

                case 0x64: // LD H, H
                    LDRR(cpu.r.h, cpu.r.h);
                    break;

                case 0x65: // LD H, L
                    LDRR(cpu.r.h, cpu.r.l);
                    break;

                case 0x66: // LD H, (HL)
                    cpu.r.h = mem.read.b(fetchHL());
                    break;

                case 0x67: // LD H, A
                    LDRR(cpu.r.h, cpu.r.a);
                    break;

                case 0x68: // LD L, B
                    LDRR(cpu.r.l, cpu.r.b);
                    break;

                case 0x69: // LD L, C
                    LDRR(cpu.r.l, cpu.r.c);
                    break;

                case 0x6a: // LD L, D
                    LDRR(cpu.r.l, cpu.r.d);
                    break;

                case 0x6b: // LD L, E
                    LDRR(cpu.r.l, cpu.r.e);
                    break;

                case 0x6c: // LD L, H
                    LDRR(cpu.r.l, cpu.r.h);
                    break;

                case 0x6d: // LD L, L
                    LDRR(cpu.r.l, cpu.r.l);
                    break;

                case 0x6e: // LD L, (HL)
                    cpu.r.l = mem.read.b(fetchHL());
                    break;

                case 0x6f: // LD L, A
                    LDRR(cpu.r.l, cpu.r.a);
                    break;

                case 0x70: // LD (HL), B
                    mem.write.b(fetchHL(), cpu.r.b);
                    break;

                case 0x71: // LD (HL), C
                    mem.write.b(fetchHL(), cpu.r.c);
                    break;

                case 0x72: // LD (HL), D
                    mem.write.b(fetchHL(), cpu.r.d);
                    break;

                case 0x73: // LD (HL), E
                    mem.write.b(fetchHL(), cpu.r.e);
                    break;

                case 0x74: // LD (HL), H
                    mem.write.b(fetchHL(), cpu.r.h);
                    break;

                case 0x75: // LD (HL), L
                    mem.write.b(fetchHL(), cpu.r.l);
                    break;

                case 0x76: // HALT
                    cpu.halt = true;
                    break;

                case 0x77: // LD (HL), A
                    mem.write.b(fetchHL(), cpu.r.a);
                    break;

                case 0x78: // LD A, B
                    LDRR(cpu.r.a, cpu.r.b);
                    break;

                case 0x79: // LD A, C
                    LDRR(cpu.r.a, cpu.r.c);
                    break;

                case 0x7a: // LD A, D
                    LDRR(cpu.r.a, cpu.r.d);
                    break;

                case 0x7b: // LD A, E
                    LDRR(cpu.r.a, cpu.r.e);
                    break;

                case 0x7c: // LD A, H
                    LDRR(cpu.r.a, cpu.r.h);
                    break;

                case 0x7d: // LD A, L
                    LDRR(cpu.r.a, cpu.r.l);
                    break;

                case 0x7e: // LD A, (HL)
                    cpu.r.a = mem.read.b(fetchHL());
                    break;

                case 0x7f: // LD A, A
                    LDRR(cpu.r.a, cpu.r.a);
                    break;

                case 0x80: // ADD B
                    tmp32 = cpu.r.a + cpu.r.b;
                    setH((cpu.r.a & 0xf) + (cpu.r.b & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x81: // ADD C
                    tmp32 = cpu.r.a + cpu.r.c;
                    setH((cpu.r.a & 0xf) + (cpu.r.c & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x82: // ADD D
                    tmp32 = cpu.r.a + cpu.r.d;
                    setH((cpu.r.a & 0xf) + (cpu.r.d & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x83: // ADD E
                    tmp32 = cpu.r.a + cpu.r.e;
                    setH((cpu.r.a & 0xf) + (cpu.r.e & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x84: // ADD H
                    tmp32 = cpu.r.a + cpu.r.h;
                    setH((cpu.r.a & 0xf) + (cpu.r.h & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x85: // ADD L
                    tmp32 = cpu.r.a + cpu.r.l;
                    setH((cpu.r.a & 0xf) + (cpu.r.l & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x86: // ADD (HL)
                    tmp32 = cpu.r.a + mem.read.b(fetchHL());
                    setH((tmp32 & 0xf) < (cpu.r.a & 0xf));
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x87: // ADD A
                    tmp32 = cpu.r.a + cpu.r.a;
                    setH((cpu.r.a & 0xf) + (cpu.r.a & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    cpu.r.a = tmp32;
                    setZ(!cpu.r.a);
                    break;

                case 0x88: // ADC B
                    tmp32 = cpu.r.a + cpu.r.b + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.b & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.b + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x89: // ADC C
                    tmp32 = cpu.r.a + cpu.r.c + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.c & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.c + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8a: // ADC D
                    tmp32 = cpu.r.a + cpu.r.d + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.d & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.d + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8b: // ADC E
                    tmp32 = cpu.r.a + cpu.r.e + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.e & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.e + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8c: // ADC H
                    tmp32 = cpu.r.a + cpu.r.h + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.h & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.h + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8d: // ADC L
                    tmp32 = cpu.r.a + cpu.r.l + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.l & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.l + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8e: // ADC (HL)
                    tmp8 = mem.read.b(fetchHL());
                    tmp32 = cpu.r.a + tmp8 + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (tmp8 & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + tmp8 + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x8f: // ADC A
                    tmp32 = cpu.r.a + cpu.r.a + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (cpu.r.a & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + cpu.r.a + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    break;

                case 0x90: // SUB B
                    SUBR(cpu.r.b);
                    break;

                case 0x91: // SUB C
                    SUBR(cpu.r.c);
                    break;

                case 0x92: // SUB D
                    SUBR(cpu.r.d);
                    break;

                case 0x93: // SUB E
                    SUBR(cpu.r.e);
                    break;

                case 0x94: // SUB H
                    SUBR(cpu.r.h);
                    break;

                case 0x95: // SUB L
                    SUBR(cpu.r.l);
                    break;

                case 0x96: // SUB (HL)
                    tmp8 = mem.read.b(fetchHL());
                    setC((cpu.r.a - tmp8) < 0);
                    setH(((cpu.r.a - tmp8) & 0xf) > (cpu.r.a & 0xf));
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    setN(1);
                    break;

                case 0x97: // SUB A
                    SUBR(cpu.r.a);
                    break;

                case 0x98: // SBC B
                    tmp8 = isSetC + cpu.r.b;
                    setH(((cpu.r.a & 0xf) - (cpu.r.b & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.b - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x99: // SBC C
                    tmp8 = isSetC + cpu.r.c;
                    setH(((cpu.r.a & 0xf) - (cpu.r.c & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.c - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x9a: // SBC D
                    tmp8 = isSetC + cpu.r.d;
                    setH(((cpu.r.a & 0xf) - (cpu.r.d & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.d - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x9b: // SBC E
                    tmp8 = isSetC + cpu.r.e;
                    setH(((cpu.r.a & 0xf) - (cpu.r.e & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.e - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x9c: // SBC H
                    tmp8 = isSetC + cpu.r.h;
                    setH(((cpu.r.a & 0xf) - (cpu.r.h & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.h - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x9d: // SBC L
                    tmp8 = isSetC + cpu.r.l;
                    setH(((cpu.r.a & 0xf) - (cpu.r.l & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.l - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0x9e: // SBC (HL)
                    tmp8 = mem.read.b(fetchHL());
                    tmp8_2 = isSetC + tmp8;
                    setH(((cpu.r.a & 0xf) - (tmp8 & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - tmp8 - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8_2;
                    setZ(!cpu.r.a);
                    break;

                case 0x9f: // SBC A
                    tmp8 = isSetC + cpu.r.a;
                    setH(((cpu.r.a & 0xf) - (cpu.r.a & 0xf) - isSetC) < 0);
                    setC((cpu.r.a - cpu.r.a - isSetC) < 0);
                    setN(1);
                    cpu.r.a -= tmp8;
                    setZ(!cpu.r.a);
                    break;

                case 0xa0: // AND B
                    ANDR(cpu.r.b);
                    break;

                case 0xa1: // AND C
                    ANDR(cpu.r.c);
                    break;

                case 0xa2: // AND D
                    ANDR(cpu.r.d);
                    break;

                case 0xa3: // AND E
                    ANDR(cpu.r.e);
                    break;

                case 0xa4: // AND H
                    ANDR(cpu.r.h);
                    break;

                case 0xa5: // AND L
                    ANDR(cpu.r.l);
                    break;

                case 0xa6: // AND (HL)
                    cpu.r.a &= mem.read.b(fetchHL());
                    setZ(!cpu.r.a);
                    setH(1);
                    setN(0);
                    setC(0);
                    break;

                case 0xa7: // AND A
                    ANDR(cpu.r.a);
                    break;

                case 0xa8: // XOR B
                    XORR(cpu.r.b);
                    break;

                case 0xa9: // XOR C
                    XORR(cpu.r.c);
                    break;

                case 0xaa: // XOR D
                    XORR(cpu.r.d);
                    break;

                case 0xab: // XOR E
                    XORR(cpu.r.e);
                    break;

                case 0xac: // XOR H
                    XORR(cpu.r.h);
                    break;

                case 0xad: // XOR L
                    XORR(cpu.r.l);
                    break;

                case 0xae: // XOR (HL)
                    cpu.r.a ^= mem.read.b(fetchHL());
                    cpu.r.f = (!cpu.r.a) << 7;
                    break;

                case 0xaf: // XOR A
                    XORR(cpu.r.a);
                    break;

                case 0xb0: // OR B
                    ORR(cpu.r.b);
                    break;

                case 0xb1: // OR C
                    ORR(cpu.r.c);
                    break;

                case 0xb2: // OR D
                    ORR(cpu.r.d);
                    break;

                case 0xb3: // OR E
                    ORR(cpu.r.e);
                    break;

                case 0xb4: // OR H
                    ORR(cpu.r.h);
                    break;

                case 0xb5: // OR L
                    ORR(cpu.r.l);
                    break;

                case 0xb6: // OR (HL)
                    cpu.r.a |= mem.read.b(fetchHL());
                    cpu.r.f = (!cpu.r.a) << 7;
                    break;

                case 0xb7: // OR A
                    ORR(cpu.r.a);
                    break;

                case 0xb8: // CP B
                    CPR(cpu.r.b);
                    break;

                case 0xb9: // CP C
                    CPR(cpu.r.c);
                    break;

                case 0xba: // CP D
                    CPR(cpu.r.d);
                    break;

                case 0xbb: // CP E
                    CPR(cpu.r.e);
                    break;

                case 0xbc: // CP H
                    CPR(cpu.r.h);
                    break;

                case 0xbd: // CP L
                    CPR(cpu.r.l);
                    break;

                case 0xbe: // CP (HL)
                    tmp8 = mem.read.b(fetchHL());
                    setZ(cpu.r.a == tmp8);
                    setH(((cpu.r.a - tmp8) & 0xf) > (cpu.r.a & 0xf));
                    setN(1);
                    setC((cpu.r.a - tmp8) < 0);
                    break;

                case 0xbf: // CP A
                    CPR(cpu.r.a);
                    break;

                case 0xc0: // RET NZ
                    if (isSetZ == 0) {
                        cpu.pc = mem.read.h(cpu.sp);
                        cpu.sp += 2;
                    }
                    else {
                    }
                    break;

                case 0xc1: // POP BC
                    setBC(mem.read.h(cpu.sp));
                    cpu.sp += 2;
                    break;

                case 0xc2: // JP NZ, mem16
                    if (isSetZ == 0) {
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xc3: // JP imm16
                    cpu.pc = mem.read.h(cpu.pc);
                    break;

                case 0xc4: // CALL NZ, imm16
                    if (isSetZ == 0) {
                        cpu.sp -= 2;
                        mem.write.h(cpu.sp, cpu.pc + 2);
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xc5: // PUSH BC
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchBC());
                    break;

                case 0xc6: // ADD A, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    setC((cpu.r.a + tmp8) >= 0x100);
                    setH(((cpu.r.a + tmp8) & 0xf) < (cpu.r.a & 0xf));
                    cpu.r.a += tmp8;
                    setN(0);
                    setZ(!cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xc7: // RST 00
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x00;
                    break;

                case 0xc8: // RET Z
                    if (isSetZ == 1) {
                        cpu.pc = mem.read.h(cpu.sp);
                        cpu.sp += 2;
                    }
                    else {
                    }
                    break;

                case 0xc9: // RET
                    cpu.pc = mem.read.h(cpu.sp);
                    cpu.sp += 2;
                    break;

                case 0xca: // JP Z, mem16
                    if (isSetZ == 1) {
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xcb: // RLC / RRC / RL / RR / SLA / SRA / SWAP / SRL / BIT / RES / SET
                    cb.executeCB(mem.read.b(cpu.pc));
                    cpu.pc += 1;
                    break;

                case 0xcc: // CALL Z, imm16
                    if (isSetZ == 1) {
                        cpu.sp -= 2;
                        mem.write.h(cpu.sp, cpu.pc + 2);
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xcd: // CALL imm16
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc + 2);
                    cpu.pc = mem.read.h(cpu.pc);
                    break;

                case 0xce: // ADC a, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    tmp32 = cpu.r.a + tmp8 + isSetC >= 0x100;
                    setN(0);
                    setH(((cpu.r.a & 0xf) + (tmp8 & 0xf) + isSetC) >= 0x10);
                    cpu.r.a = cpu.r.a + tmp8 + isSetC;
                    setC(tmp32);
                    setZ(!cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xcf: // RST 08
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x08;
                    break;

                case 0xd0: // RET NC
                    if (isSetC == 0) {
                        cpu.pc = mem.read.h(cpu.sp);
                        cpu.sp += 2;
                    }
                    else {
                    }
                    break;

                case 0xd1: // POP DE
                    setDE(mem.read.h(cpu.sp));
                    cpu.sp += 2;
                    break;

                case 0xd2: // JP NC, mem16
                    if (isSetC == 0) {
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xd4: // CALL NC, mem16
                    if (isSetC == 0) {
                        tmp32 = mem.read.h(cpu.pc);
                        cpu.sp -= 2;
                        mem.write.h(cpu.sp, cpu.pc + 2);
                        cpu.pc = tmp32;
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xd5: // PUSH DE
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchDE());
                    break;

                case 0xd6: // SUB A, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    setC((cpu.r.a - tmp8) < 0);
                    setH(((cpu.r.a - tmp8) & 0xf) > (cpu.r.a & 0xf));
                    cpu.r.a -= tmp8;
                    setN(1);
                    setZ(!cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xd7: // RST 10
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x10;
                    break;

                case 0xd8: // RET C
                    if (isSetC == 1) {
                        cpu.pc = mem.read.h(cpu.sp);
                        cpu.sp += 2;
                    }
                    else {
                    }
                    break;

                case 0xd9: // RETI
                    cpu.pc = mem.read.h(cpu.sp);
                    cpu.sp += 2;
                    bus.interrupts.enabled = true;
                    break;

                case 0xda: // JP C, mem16
                    if (isSetC == 1) {
                        cpu.pc = mem.read.h(cpu.pc);
                    }
                    else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xdc: // CALL C, mem16
                    if (isSetC == 1) {
                        tmp32 = mem.read.h(cpu.pc);
                        cpu.sp -= 2;
                        mem.write.h(cpu.sp, cpu.pc + 2);
                        cpu.pc = tmp32;
                    } else {
                        cpu.pc += 2;
                    }
                    break;

                case 0xde: // SBC A, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    tmp8_2 = isSetC;
                    setH(((tmp8 & 0xf) + isSetC) > (cpu.r.a & 0xf));
                    setC(tmp8 + isSetC > cpu.r.a);
                    setN(1);
                    cpu.r.a -= (tmp8_2 + tmp8);
                    setZ(!cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xdf: // RST 18
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x18;
                    break;

                case 0xe0: // LD (FF00 + imm8), A
                    mem.write.b(0xff00 + mem.read.b(cpu.pc), cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xe1: // POP HL
                    setHL(mem.read.h(cpu.sp));
                    cpu.sp += 2;
                    break;

                case 0xe2: // LD (FF00 + C), A
                    mem.write.b(0xff00 + cpu.r.c, cpu.r.a);
                    break;

                case 0xe5: // PUSH HL
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchHL());
                    break;

                case 0xe6: // AND A, imm8
                    setN(0);
                    setH(1);
                    setC(0);
                    cpu.r.a = mem.read.b(cpu.pc) & cpu.r.a;
                    setZ(!cpu.r.a);
                    cpu.pc += 1;
                    break;

                case 0xe7: // RST 20
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x20;
                    break;

                case 0xe8: // ADD SP, imm8
                    tmp32 = mem.read.b(cpu.pc);
                    cpu.pc += 1;
                    setZ(0);
                    setN(0);
                    setC(((cpu.sp + tmp32) & 0xff) < (cpu.sp & 0xff));
                    setH(((cpu.sp + tmp32) & 0xf) < (cpu.sp & 0xf));
                    cpu.sp += SIGN_EXT_8(tmp32);
                    break;

                case 0xe9: // JP HL
                    cpu.pc = fetchHL();
                    break;

                case 0xea: // LD (mem16), A
                    mem.write.b(mem.read.h(cpu.pc), cpu.r.a);
                    cpu.pc += 2;
                    break;

                case 0xee: // XOR A, imm8
                    cpu.r.a ^= mem.read.b(cpu.pc);
                    cpu.r.f = (!cpu.r.a) << 7;
                    cpu.pc += 1;
                    break;

                case 0xef: // RST 28
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x28;
                    break;

                case 0xf0: // LD A, (FF00 + imm8)
                    cpu.r.a = mem.read.b(0xff00 + mem.read.b(cpu.pc));
                    cpu.pc += 1;
                    break;

                case 0xf1: // POP AF
                    setAF(mem.read.h(cpu.sp) & 0xfff0);
                    cpu.sp += 2;
                    break;

                case 0xf2: // LD A, (FF00 + c)
                    cpu.r.a = mem.read.b(0xff00 + cpu.r.c);
                    break;

                case 0xf3: // DI
                    bus.interrupts.enabled = false;
                    break;

                case 0xf5: // PUSH AF
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchAF());
                    break;

                case 0xf6: // OR A, imm8
                    cpu.r.a |= mem.read.b(cpu.pc);
                    cpu.r.f = (!cpu.r.a) << 7;
                    cpu.pc += 1;
                    break;

                case 0xf7: // RST 30
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x30;
                    break;

                case 0xf8: // LD HL, SP + imm8
                    tmp32 = mem.read.b(cpu.pc);
                    setN(0);
                    setZ(0);
                    setC(((cpu.sp + tmp32) & 0xff) < (cpu.sp & 0xff));
                    setH(((cpu.sp + tmp32) & 0xf) < (cpu.sp & 0xf));
                    setHL(cpu.sp + SIGN_EXT_8(tmp32));
                    cpu.pc += 1;
                    break;

                case 0xf9: // LD SP, HL
                    cpu.sp = fetchHL();
                    break;

                case 0xfa: // LD A, (mem16)
                    cpu.r.a = mem.read.b(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0xfb: // EI
                    bus.interrupts.enabled = true;
                    break;

                case 0xfe: // CP A, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    setZ(cpu.r.a == tmp8);
                    setN(1);
                    setH(((cpu.r.a - tmp8) & 0xf) > (cpu.r.a & 0xf));
                    setC(cpu.r.a < tmp8);
                    cpu.pc += 1;
                    break;

                case 0xff: // RST 38
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x38;
                    break;

                default:
                    emulator.error('CPU Opcode ' + emulator.hex(opcode));
                    break;
            }

            return 0; //frames[opcode];
        }
    };
};

const cpu = new GameBowie.CstrSharpSM83();
