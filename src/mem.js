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

        switch (true) {
            case (addr >= 0x0000 && addr <= 0x1fff):
                return false;

            case (addr >= 0x2000 && addr <= 0x3fff):
                bank = data & 0x1f;

                if (!ramSelect) {
                    bank |= bankUpperBits;
                }

                if (bank == 0 || bank == 0x20 || bank == 0x40 || bank == 0x60) {
                    bank++;
                }

                for (let i = 0; i < 0x4000; i++) {
                    mem.ram[0x4000 + i] = rom[(bank * 0x4000) + i];
                }
                return false;

            case (addr >= 0x4000 && addr <= 0x5fff):
                bankUpperBits = (data & 0x3) << 5;
                return false;

            case (addr >= 0x6000 && addr <= 0x7fff):
                ramSelect = data & 1;
                return false;
        }

        return true;
    }

    // Exposed class functions/variables
    return {
        ram: new UintBcap(0x10000),

        reset() {
            // Reset all
            mem.ram.fill(0);
        },

        parseROM(resp) {
            // Allocate space
            rom = new UintBcap(resp);

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
                    emulator.consoleInformation(MSG_ERROR, 'ROM kind ' + emulator.hex(kind) + ' not supported');
                    emulator.error(' ');
                    break;
            }

            // Write at most two mem banks
            for (let i = 0; i < 2 * 0x4000; i++) {
                mem.ram[i] = rom[i];
            }
        },

        write: {
            h(addr, data) {
                mem.write.b(addr, data & 0xff);
                mem.write.b(addr + 1, data >>> 8);
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

                switch (true) {
                    case (addr >= 0xe000 && addr <= 0xfdff): // Prohibited: Echo RAM ???
                        mem.ram[addr - 0x2000] = data;
                        return;

                    case (addr >= 0x8000 && addr <= 0x9fff): // VRAM, cleared on boot
                    case (addr >= 0xa000 && addr <= 0xbfff): // Cart RAM ???
                    case (addr >= 0xc000 && addr <= 0xcfff): // Work RAM Bank 0
                    case (addr >= 0xd000 && addr <= 0xdfff): // Work RAM Bank 1
                    case (addr >= 0xff80 && addr <= 0xfffe): // HRAM stack
                    case (addr >= 0xfe00 && addr <= 0xfe9f): // OAM Sprite
                    case (addr >= 0xfea0 && addr <= 0xfeff): // Not usable
                    case (addr == 0xff01): // Link port data ?
                    case (addr == 0xff02): // ?

                    case (addr == 0xff4c):
                    case (addr == 0xff4d):
                    case (addr == 0xff4e):
                    case (addr == 0xff4f):
                    case (addr >= 0xff51 && addr <= 0xff7f): // ?
                        mem.ram[addr] = data;
                        return;

                    case (addr == 0xff00): // Gamepad
                        input.write(data);
                        return;

                    case (addr >= 0xff04 && addr <= 0xff07): // Timers
                        timers.write(addr, data);
                        return;

                    case (addr >= 0xff10 && addr <= 0xff3f): // Audio
                        audio.write(addr, data);
                        return;

                    case (addr >= 0xff40 && addr <= 0xff4b): // LCD
                        screen.write(addr, data);
                        return;

                    case (addr == 0xff50): // Boot ROM completed
                        bootstrap.enabled = false;
                        emulator.consoleInformation(MSG_INFO, 'Boot ROM has completed the process');
                        return;

                    case (addr == 0xff0f): // Interrupt
                        bus.interrupts.data = data;
                        return;

                    case (addr == 0xffff): // Interrupt Mask
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

                switch (true) {
                    case (addr >= 0xe000 && addr <= 0xfdff): // Prohibited: Echo RAM ???
                        return mem.ram[addr - 0x2000];

                    case (addr >= 0x0000 && addr <= 0x3fff): // ROM Bank 0
                    case (addr >= 0x4000 && addr <= 0x7fff): // ROM Bank 1
                    case (addr >= 0x8000 && addr <= 0x9fff): // VRAM
                    case (addr >= 0xa000 && addr <= 0xbfff): // Cart RAM ???
                    case (addr >= 0xc000 && addr <= 0xcfff): // Work RAM Bank 0
                    case (addr >= 0xd000 && addr <= 0xdfff): // Work RAM Bank 1
                    case (addr >= 0xff80 && addr <= 0xfffe): // HRAM stack
                    case (addr >= 0xfe00 && addr <= 0xfe9f): // OAM Sprite
                    case (addr >= 0xff50 && addr <= 0xff7f): // ?
                    case (addr == 0xff01): // ?
                    case (addr == 0xff02): // ?
                        return mem.ram[addr];

                    case (addr == 0xff00): // Gamepad
                        return input.read();

                    case (addr >= 0xff04 && addr <= 0xff07): // Timers
                        return timers.read(addr);

                    case (addr >= 0xff10 && addr <= 0xff3f): // Audio
                        return audio.read(addr);

                    case (addr >= 0xff40 && addr <= 0xff4b): // LCD
                        return screen.read(addr);

                    case (addr == 0xff4d): // GBC speed switch
                        return 0xff;

                    case (addr == 0xff0f): // Interrupt
                        return bus.interrupts.data;

                    case (addr == 0xffff): // Interrupt Mask
                        return bus.interrupts.mask;
                }

                emulator.error('Read 08 Address ' + emulator.hex(addr));
                return 0;
            }
        },

        rawAccess(addr) {
            return mem.ram[addr];
        }
    };
};

const mem = new GameBowie.CstrMem();
