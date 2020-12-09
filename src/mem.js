/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrMem = function() {
    const MBC0 = 0;
    const MBC1 = 1;

    let rom;
    let bankMapper;
    let bankUpperBits, ramSelect;

    function writeMBC0(addr, data) {
        if (addr < 0x8000) {
            return false;
        }

        return true;
    }

    function writeMBC1(addr, data) {
        let bank;

        switch (addr) {
            case 0x0000 ... 0x1fff:
                return false;

            case 0x2000 ... 0x3fff:
                bank = data & 0x1f;

                if (!ramSelect) {
                    bank |= bankUpperBits;
                }

                if (bank == 0 || bank == 0x20 || bank == 0x40 || bank == 0x60) {
                    bank++;
                }

                memcp(&ram.ptr[0x4000], &rom.ptr[bank * 0x4000], 0x4000);
                return false;

            case 0x4000 ... 0x5fff:
                bankUpperBits = (data & 0x3) << 5;
                return false;

            case 0x6000 ... 0x7fff:
                ramSelect = data & 1;
                return false;
        }

        return true;
    }

    // Exposed class functions/variables
    return {
        ram: union(0x10000),

        reset() {
            // Reset all
            mem.ram.ub.fill(0);
        },

        parseROM(resp) {
            // Allocate space
            rom = UintBcap(resp);

            // Parse ROM cart
            let kind = rom[0x147];

            switch (kind) {
                case 0x00:
                    bankMapper = MBC0;
                    break;

                case 0x01:
                case 0x02:
                case 0x03:
                    bankMapper = MBC1;
                    break;

                default:
                    emulator.error('ROM kind ' + emulator.hex(kind) + ' not supported');
                    break;
            }

            // Write at most 2 mem banks
            memcp(&ram.ptr[0x0000], &rom.ptr[0x0000], 0x4000);
            memcp(&ram.ptr[0x4000], &rom.ptr[0x4000], 0x4000);
        },

        write: {
            h(addr, data) {
                mem.write.b(addr, data & 0xff);
                mem.write.b(addr + 1, data >> 8);
            },

            b(addr, data) {
                // ROM Bank Write Request
                switch (bankMapper) {
                    case MBC0:
                        if (!writeMBC0(addr, data)) {
                            return;
                        }
                        break;

                    case MBC1:
                        if (!writeMBC1(addr, data)) {
                            return;
                        }
                        break;
                }

                switch (addr) {
                    case 0xe000 ... 0xfdff: // Prohibited: Echo RAM ???
                        mem.ram.ub[addr - 0x2000] = data;
                        return;

                    case 0x8000 ... 0x9fff: // VRAM, cleared on boot
                    case 0xa000 ... 0xbfff: // Cart RAM ???
                    case 0xc000 ... 0xcfff: // Work RAM Bank 0
                    case 0xd000 ... 0xdfff: // Work RAM Bank 1
                    case 0xff80 ... 0xfffe: // HRAM stack
                    case 0xfe00 ... 0xfe9f: // OAM Sprite
                    case 0xfea0 ... 0xfeff: // Not usable
                    case 0xff01: // Link port data ?
                    case 0xff02: // ?

                    case 0xff4c:
                    case 0xff4d:
                    case 0xff4e:
                    case 0xff4f:
                    case 0xff51 ... 0xff7f: // ?
                        mem.ram.ub[addr] = data;
                        return;

                    case 0xff00: // Gamepad
                        input.write(data);
                        return;

                    case 0xff04 ... 0xff07: // Timers
                        timers.write(addr, data);
                        return;

                    case 0xff10 ... 0xff3f: // Audio
                        audio.write(addr, data);
                        return;

                    case 0xff40 ... 0xff4b: // LCD
                        screen.write(addr, data);
                        return;

                    case 0xff50: // Boot ROM completed
                        bootstrap.enabled = false;
                        return;

                    case 0xff0f: // Interrupt
                        bus.interrupts.data = data;
                        return;

                    case 0xffff: // Interrupt Mask
                        bus.interrupts.mask = data;
                        return;
                }

                emulator.error('Write 08 Address ' + emulator.hex(addr) + ' <- ' + emulator.hex(data));
            }
        },

        read: {
            h(addr) {
                return mem.read.b(addr) | (mem.read.b(addr + 1) << 8);
            },

            b(addr) {
                if (bootstrap.enabled) {
                    if (addr >= 0x0000 && addr <= 0x00ff) {
                        return bootstrap.data[addr];
                    }
                }

                switch (addr) {
                    case 0xe000 ... 0xfdff: // Prohibited: Echo RAM ???
                        return mem.ram.ub[addr - 0x2000];

                    case 0x0000 ... 0x3fff: // ROM Bank 0
                    case 0x4000 ... 0x7fff: // ROM Bank 1
                    case 0x8000 ... 0x9fff: // VRAM
                    case 0xa000 ... 0xbfff: // Cart RAM ???
                    case 0xc000 ... 0xcfff: // Work RAM Bank 0
                    case 0xd000 ... 0xdfff: // Work RAM Bank 1
                    case 0xff80 ... 0xfffe: // HRAM stack
                    case 0xfe00 ... 0xfe9f: // OAM Sprite
                    case 0xff50 ... 0xff7f: // ?
                    case 0xff01: // ?
                    case 0xff02: // ?
                        return mem.ram.ub[addr];

                    case 0xff00: // Gamepad
                        return input.read();

                    case 0xff04 ... 0xff07: // Timers
                        return timers.read(addr);

                    case 0xff10 ... 0xff3f: // Audio
                        return audio.read(addr);

                    case 0xff40 ... 0xff4b: // LCD
                        return screen.read(addr);

                    case 0xff4d: // GBC speed switch
                        return 0xff;

                    case 0xff0f: // Interrupt
                        return bus.interrupts.data;

                    case 0xffff: // Interrupt Mask
                        return bus.interrupts.mask;
                }

                emulator.error('Read 08 Address ' + emulator.hex(addr));
                return 0;
            }
        },

        rawAccess(addr) {
            return mem.ram.ub[addr];
        }
    };
};

const mem = new GameBowie.CstrMem();
