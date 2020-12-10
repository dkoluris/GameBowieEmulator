/* Base structure taken from GAMEBOY open source emulator, and improved upon (Credits: Peter Johnson (zid)) */

GameBowie.CstrSharpSM83 = function() {
    let tmp8, tmp8_2, tmp16, tmp32;

    // Exposed class functions/variables
    return {
          pc: undefined,
          sp: undefined,
        halt: undefined,

        // REGS
        r: new UintBcap(8),

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

            let opcode = mem.read.b(cpu.pc);
            cpu.pc++;

            switch (opcode) {
                case 0x00:
                    break;

                case 0x01: // LD BC, imm16
                    setBC(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0x02: // LD (BC), A
                    mem.write.b(fetchBC(), ra);
                    break;

                case 0x03: // INC BC
                    setBC(fetchBC() + 1);
                    break;

                case 0x04: // INC B
                    INC(rb);
                    break;

                case 0x05: // DEC B
                    DEC(rb);
                    break;

                case 0x06: // LD B, imm8
                    LDRIMM8(rb);
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
                    ra = mem.read.b(fetchBC());
                    break;

                case 0x0b: // DEC BC
                    setBC(fetchBC() - 1);
                    break;

                case 0x0c: // INC C
                    INC(rc);
                    break;

                case 0x0d: // DEC C
                    DEC(rc);
                    break;

                case 0x0e: // LD C, imm8
                    LDRIMM8(rc);
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
                    mem.write.b(fetchDE(), ra);
                    break;

                case 0x13: // INC DE
                    setDE(fetchDE() + 1);
                    break;

                case 0x14: // INC D
                    INC(rd);
                    break;

                case 0x15: // DEC D
                    DEC(rd);
                    break;

                case 0x16: // LD D, imm8
                    LDRIMM8(rd);
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
                    ra = mem.read.b(fetchDE());
                    break;

                case 0x1b: // DEC DE
                    tmp16 = fetchDE();
                    tmp16--;
                    setDE(tmp16);
                    break;

                case 0x1c: // INC E
                    INC(re);
                    break;

                case 0x1d: // DEC E
                    DEC(re);
                    break;

                case 0x1e: // LD E, imm8
                    LDRIMM8(re);
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
                    mem.write.b(fetchHL(), ra);
                    setHL(fetchHL() + 1);
                    break;

                case 0x23: // INC HL
                    setHL(fetchHL() + 1);
                    break;

                case 0x24: // INC H
                    INC(rh);
                    break;

                case 0x25: // DEC H
                    DEC(rh);
                    break;

                case 0x26: // LD H, imm8
                    LDRIMM8(rh);
                    break;

                case 0x27: // DAA
                    tmp16 = ra;

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

                    ra = tmp16;
                    setH(0);
                    setZ(!ra);

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
                    ra = mem.read.b(fetchHL());
                    setHL(fetchHL() + 1);
                    break;

                case 0x2b: // DEC HL
                    setHL(fetchHL() - 1);
                    break;

                case 0x2c: // INC L
                    INC(rl);
                    break;

                case 0x2d: // DEC L
                    DEC(rl);
                    break;

                case 0x2e: // LD L, imm8
                    LDRIMM8(rl);
                    break;

                case 0x2f: // CPL
                    ra = (~(ra));
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
                    mem.write.b(fetchHL(), ra);
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
                    ra = mem.read.b(fetchHL());
                    setHL(fetchHL() - 1);
                    break;

                case 0x3b: // DEC SP
                    cpu.sp--;
                    break;

                case 0x3c: // INC A
                    INC(ra);
                    break;

                case 0x3d: // DEC A
                    DEC(ra);
                    break;

                case 0x3e: // LD A, imm8
                    LDRIMM8(ra);
                    break;

                case 0x3f: // CCF
                    setN(0);
                    setH(0);
                    setC(!isSetC);
                    break;

                case 0x40: // LD B, B
                    LDRR(rb, rb);
                    break;

                case 0x41: // LD B, C
                    LDRR(rb, rc);
                    break;

                case 0x42: // LD B, D
                    LDRR(rb, rd);
                    break;

                case 0x43: // LD B, E
                    LDRR(rb, re);
                    break;

                case 0x44: // LD B, H
                    LDRR(rb, rh);
                    break;

                case 0x45: // LD B, L
                    LDRR(rb, rl);
                    break;

                case 0x46: // LD B, (HL)
                    rb = mem.read.b(fetchHL());
                    break;

                case 0x47: // LD B, A
                    LDRR(rb, ra);
                    break;

                case 0x48: // LD C, B
                    LDRR(rc, rb);
                    break;

                case 0x49: // LD C, C
                    LDRR(rc, rc);
                    break;

                case 0x4a: // LD C, D
                    LDRR(rc, rd);
                    break;

                case 0x4b: // LD C, E
                    LDRR(rc, re);
                    break;

                case 0x4c: // LD C, H
                    LDRR(rc, rh);
                    break;

                case 0x4d: // LD C, L
                    LDRR(rc, rl);
                    break;

                case 0x4e: // LD C, (HL)
                    rc = mem.read.b(fetchHL());
                    break;

                case 0x4f: // LD C, A
                    LDRR(rc, ra);
                    break;

                case 0x50: // LD D, B
                    LDRR(rd, rb);
                    break;

                case 0x51: // LD D, C
                    LDRR(rd, rc);
                    break;

                case 0x52: // LD D, D
                    LDRR(rd, rd);
                    break;

                case 0x53: // LD D, E
                    LDRR(rd, re);
                    break;

                case 0x54: // LD D, H
                    LDRR(rd, rh);
                    break;

                case 0x55: // LD D, L
                    LDRR(rd, rl);
                    break;

                case 0x56: // LD D, (HL)
                    rd = mem.read.b(fetchHL());
                    break;

                case 0x57: // LD D, A
                    LDRR(rd, ra);
                    break;

                case 0x58: // LD E, B
                    LDRR(re, rb);
                    break;

                case 0x59: // LD E, C
                    LDRR(re, rc);
                    break;

                case 0x5a: // LD E, D
                    LDRR(re, rd);
                    break;

                case 0x5b: // LD E, E
                    LDRR(re, re);
                    break;

                case 0x5c: // LD E, H
                    LDRR(re, rh);
                    break;

                case 0x5d: // LD E, L
                    LDRR(re, rl);
                    break;

                case 0x5e: // LD E, (HL)
                    re = mem.read.b(fetchHL());
                    break;

                case 0x5f: // LD E, A
                    LDRR(re, ra);
                    break;

                case 0x60: // LD H, B
                    LDRR(rh, rb);
                    break;

                case 0x61: // LD H, C
                    LDRR(rh, rc);
                    break;

                case 0x62: // LD H, D
                    LDRR(rh, rd);
                    break;

                case 0x63: // LD H, E
                    LDRR(rh, re);
                    break;

                case 0x64: // LD H, H
                    LDRR(rh, rh);
                    break;

                case 0x65: // LD H, L
                    LDRR(rh, rl);
                    break;

                case 0x66: // LD H, (HL)
                    rh = mem.read.b(fetchHL());
                    break;

                case 0x67: // LD H, A
                    LDRR(rh, ra);
                    break;

                case 0x68: // LD L, B
                    LDRR(rl, rb);
                    break;

                case 0x69: // LD L, C
                    LDRR(rl, rc);
                    break;

                case 0x6a: // LD L, D
                    LDRR(rl, rd);
                    break;

                case 0x6b: // LD L, E
                    LDRR(rl, re);
                    break;

                case 0x6c: // LD L, H
                    LDRR(rl, rh);
                    break;

                case 0x6d: // LD L, L
                    LDRR(rl, rl);
                    break;

                case 0x6e: // LD L, (HL)
                    rl = mem.read.b(fetchHL());
                    break;

                case 0x6f: // LD L, A
                    LDRR(rl, ra);
                    break;

                case 0x70: // LD (HL), B
                    mem.write.b(fetchHL(), rb);
                    break;

                case 0x71: // LD (HL), C
                    mem.write.b(fetchHL(), rc);
                    break;

                case 0x72: // LD (HL), D
                    mem.write.b(fetchHL(), rd);
                    break;

                case 0x73: // LD (HL), E
                    mem.write.b(fetchHL(), re);
                    break;

                case 0x74: // LD (HL), H
                    mem.write.b(fetchHL(), rh);
                    break;

                case 0x75: // LD (HL), L
                    mem.write.b(fetchHL(), rl);
                    break;

                case 0x76: // HALT
                    cpu.halt = true;
                    break;

                case 0x77: // LD (HL), A
                    mem.write.b(fetchHL(), ra);
                    break;

                case 0x78: // LD A, B
                    LDRR(ra, rb);
                    break;

                case 0x79: // LD A, C
                    LDRR(ra, rc);
                    break;

                case 0x7a: // LD A, D
                    LDRR(ra, rd);
                    break;

                case 0x7b: // LD A, E
                    LDRR(ra, re);
                    break;

                case 0x7c: // LD A, H
                    LDRR(ra, rh);
                    break;

                case 0x7d: // LD A, L
                    LDRR(ra, rl);
                    break;

                case 0x7e: // LD A, (HL)
                    ra = mem.read.b(fetchHL());
                    break;

                case 0x7f: // LD A, A
                    LDRR(ra, ra);
                    break;

                case 0x80: // ADD B
                    tmp32 = ra + rb;
                    setH((ra & 0xf) + (rb & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x81: // ADD C
                    tmp32 = ra + rc;
                    setH((ra & 0xf) + (rc & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x82: // ADD D
                    tmp32 = ra + rd;
                    setH((ra & 0xf) + (rd & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x83: // ADD E
                    tmp32 = ra + re;
                    setH((ra & 0xf) + (re & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x84: // ADD H
                    tmp32 = ra + rh;
                    setH((ra & 0xf) + (rh & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x85: // ADD L
                    tmp32 = ra + rl;
                    setH((ra & 0xf) + (rl & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x86: // ADD (HL)
                    tmp32 = ra + mem.read.b(fetchHL());
                    setH((tmp32 & 0xf) < (ra & 0xf));
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x87: // ADD A
                    tmp32 = ra + ra;
                    setH((ra & 0xf) + (ra & 0xf) > 0xf);
                    setC(tmp32 > 0xff);
                    setN(0);
                    ra = tmp32;
                    setZ(!ra);
                    break;

                case 0x88: // ADC B
                    tmp32 = ra + rb + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (rb & 0xf) + isSetC) >= 0x10);
                    ra = ra + rb + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x89: // ADC C
                    tmp32 = ra + rc + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (rc & 0xf) + isSetC) >= 0x10);
                    ra = ra + rc + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8a: // ADC D
                    tmp32 = ra + rd + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (rd & 0xf) + isSetC) >= 0x10);
                    ra = ra + rd + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8b: // ADC E
                    tmp32 = ra + re + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (re & 0xf) + isSetC) >= 0x10);
                    ra = ra + re + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8c: // ADC H
                    tmp32 = ra + rh + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (rh & 0xf) + isSetC) >= 0x10);
                    ra = ra + rh + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8d: // ADC L
                    tmp32 = ra + rl + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (rl & 0xf) + isSetC) >= 0x10);
                    ra = ra + rl + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8e: // ADC (HL)
                    tmp8 = mem.read.b(fetchHL());
                    tmp32 = ra + tmp8 + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (tmp8 & 0xf) + isSetC) >= 0x10);
                    ra = ra + tmp8 + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x8f: // ADC A
                    tmp32 = ra + ra + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (ra & 0xf) + isSetC) >= 0x10);
                    ra = ra + ra + isSetC;
                    setC(tmp32);
                    setZ(!ra);
                    break;

                case 0x90: // SUB B
                    SUBR(rb);
                    break;

                case 0x91: // SUB C
                    SUBR(rc);
                    break;

                case 0x92: // SUB D
                    SUBR(rd);
                    break;

                case 0x93: // SUB E
                    SUBR(re);
                    break;

                case 0x94: // SUB H
                    SUBR(rh);
                    break;

                case 0x95: // SUB L
                    SUBR(rl);
                    break;

                case 0x96: // SUB (HL)
                    tmp8 = mem.read.b(fetchHL());
                    setC((ra - tmp8) < 0);
                    setH(((ra - tmp8) & 0xf) > (ra & 0xf));
                    ra -= tmp8;
                    setZ(!ra);
                    setN(1);
                    break;

                case 0x97: // SUB A
                    SUBR(ra);
                    break;

                case 0x98: // SBC B
                    tmp8 = isSetC + rb;
                    setH(((ra & 0xf) - (rb & 0xf) - isSetC) < 0);
                    setC((ra - rb - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x99: // SBC C
                    tmp8 = isSetC + rc;
                    setH(((ra & 0xf) - (rc & 0xf) - isSetC) < 0);
                    setC((ra - rc - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x9a: // SBC D
                    tmp8 = isSetC + rd;
                    setH(((ra & 0xf) - (rd & 0xf) - isSetC) < 0);
                    setC((ra - rd - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x9b: // SBC E
                    tmp8 = isSetC + re;
                    setH(((ra & 0xf) - (re & 0xf) - isSetC) < 0);
                    setC((ra - re - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x9c: // SBC H
                    tmp8 = isSetC + rh;
                    setH(((ra & 0xf) - (rh & 0xf) - isSetC) < 0);
                    setC((ra - rh - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x9d: // SBC L
                    tmp8 = isSetC + rl;
                    setH(((ra & 0xf) - (rl & 0xf) - isSetC) < 0);
                    setC((ra - rl - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0x9e: // SBC (HL)
                    tmp8 = mem.read.b(fetchHL());
                    tmp8_2 = isSetC + tmp8;
                    setH(((ra & 0xf) - (tmp8 & 0xf) - isSetC) < 0);
                    setC((ra - tmp8 - isSetC) < 0);
                    setN(1);
                    ra -= tmp8_2;
                    setZ(!ra);
                    break;

                case 0x9f: // SBC A
                    tmp8 = isSetC + ra;
                    setH(((ra & 0xf) - (ra & 0xf) - isSetC) < 0);
                    setC((ra - ra - isSetC) < 0);
                    setN(1);
                    ra -= tmp8;
                    setZ(!ra);
                    break;

                case 0xa0: // AND B
                    ANDR(rb);
                    break;

                case 0xa1: // AND C
                    ANDR(rc);
                    break;

                case 0xa2: // AND D
                    ANDR(rd);
                    break;

                case 0xa3: // AND E
                    ANDR(re);
                    break;

                case 0xa4: // AND H
                    ANDR(rh);
                    break;

                case 0xa5: // AND L
                    ANDR(rl);
                    break;

                case 0xa6: // AND (HL)
                    ra &= mem.read.b(fetchHL());
                    setZ(!ra);
                    setH(1);
                    setN(0);
                    setC(0);
                    break;

                case 0xa7: // AND A
                    ANDR(ra);
                    break;

                case 0xa8: // XOR B
                    XORR(rb);
                    break;

                case 0xa9: // XOR C
                    XORR(rc);
                    break;

                case 0xaa: // XOR D
                    XORR(rd);
                    break;

                case 0xab: // XOR E
                    XORR(re);
                    break;

                case 0xac: // XOR H
                    XORR(rh);
                    break;

                case 0xad: // XOR L
                    XORR(rl);
                    break;

                case 0xae: // XOR (HL)
                    ra ^= mem.read.b(fetchHL());
                    rf = (!ra) << 7;
                    break;

                case 0xaf: // XOR A
                    XORR(ra);
                    break;

                case 0xb0: // OR B
                    ORR(rb);
                    break;

                case 0xb1: // OR C
                    ORR(rc);
                    break;

                case 0xb2: // OR D
                    ORR(rd);
                    break;

                case 0xb3: // OR E
                    ORR(re);
                    break;

                case 0xb4: // OR H
                    ORR(rh);
                    break;

                case 0xb5: // OR L
                    ORR(rl);
                    break;

                case 0xb6: // OR (HL)
                    ra |= mem.read.b(fetchHL());
                    rf = (!ra) << 7;
                    break;

                case 0xb7: // OR A
                    ORR(ra);
                    break;

                case 0xb8: // CP B
                    CPR(rb);
                    break;

                case 0xb9: // CP C
                    CPR(rc);
                    break;

                case 0xba: // CP D
                    CPR(rd);
                    break;

                case 0xbb: // CP E
                    CPR(re);
                    break;

                case 0xbc: // CP H
                    CPR(rh);
                    break;

                case 0xbd: // CP L
                    CPR(rl);
                    break;

                case 0xbe: // CP (HL)
                    tmp8 = mem.read.b(fetchHL());
                    setZ(ra == tmp8);
                    setH(((ra - tmp8) & 0xf) > (ra & 0xf));
                    setN(1);
                    setC((ra - tmp8) < 0);
                    break;

                case 0xbf: // CP A
                    CPR(ra);
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
                    setC((ra + tmp8) >= 0x100);
                    setH(((ra + tmp8) & 0xf) < (ra & 0xf));
                    ra += tmp8;
                    setN(0);
                    setZ(!ra);
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
                    tmp32 = ra + tmp8 + isSetC >= 0x100;
                    setN(0);
                    setH(((ra & 0xf) + (tmp8 & 0xf) + isSetC) >= 0x10);
                    ra = ra + tmp8 + isSetC;
                    setC(tmp32);
                    setZ(!ra);
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
                    setC((ra - tmp8) < 0);
                    setH(((ra - tmp8) & 0xf) > (ra & 0xf));
                    ra -= tmp8;
                    setN(1);
                    setZ(!ra);
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
                    setH(((tmp8 & 0xf) + isSetC) > (ra & 0xf));
                    setC(tmp8 + isSetC > ra);
                    setN(1);
                    ra -= (tmp8_2 + tmp8);
                    setZ(!ra);
                    cpu.pc += 1;
                    break;

                case 0xdf: // RST 18
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x18;
                    break;

                case 0xe0: // LD (FF00 + imm8), A
                    mem.write.b(0xff00 + mem.read.b(cpu.pc), ra);
                    cpu.pc += 1;
                    break;

                case 0xe1: // POP HL
                    setHL(mem.read.h(cpu.sp));
                    cpu.sp += 2;
                    break;

                case 0xe2: // LD (FF00 + C), A
                    mem.write.b(0xff00 + rc, ra);
                    break;

                case 0xe5: // PUSH HL
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchHL());
                    break;

                case 0xe6: // AND A, imm8
                    setN(0);
                    setH(1);
                    setC(0);
                    ra = mem.read.b(cpu.pc) & ra;
                    setZ(!ra);
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
                    mem.write.b(mem.read.h(cpu.pc), ra);
                    cpu.pc += 2;
                    break;

                case 0xee: // XOR A, imm8
                    ra ^= mem.read.b(cpu.pc);
                    rf = (!ra) << 7;
                    cpu.pc += 1;
                    break;

                case 0xef: // RST 28
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);
                    cpu.pc = 0x28;
                    break;

                case 0xf0: // LD A, (FF00 + imm8)
                    ra = mem.read.b(0xff00 + mem.read.b(cpu.pc));
                    cpu.pc += 1;
                    break;

                case 0xf1: // POP AF
                    setAF(mem.read.h(cpu.sp) & 0xfff0);
                    cpu.sp += 2;
                    break;

                case 0xf2: // LD A, (FF00 + c)
                    ra = mem.read.b(0xff00 + rc);
                    break;

                case 0xf3: // DI
                    bus.interrupts.enabled = false;
                    break;

                case 0xf5: // PUSH AF
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, fetchAF());
                    break;

                case 0xf6: // OR A, imm8
                    ra |= mem.read.b(cpu.pc);
                    rf = (!ra) << 7;
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
                    ra = mem.read.b(mem.read.h(cpu.pc));
                    cpu.pc += 2;
                    break;

                case 0xfb: // EI
                    bus.interrupts.enabled = true;
                    break;

                case 0xfe: // CP A, imm8
                    tmp8 = mem.read.b(cpu.pc);
                    setZ(ra == tmp8);
                    setN(1);
                    setH(((ra - tmp8) & 0xf) > (ra & 0xf));
                    setC(ra < tmp8);
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
