/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrTimers = function() {
    const CPU_SPEED = 4194304;
    const DIV_SPEED = 16384;

    const TMR_CLOCK_0 = CPU_SPEED / 1024;
    const TMR_CLOCK_1 = CPU_SPEED / 16;
    const TMR_CLOCK_2 = CPU_SPEED / 64;
    const TMR_CLOCK_3 = CPU_SPEED / 256;

    let enabled;
    let frames;
    let clock;
    let divFrames;
    let div, tima, tma;

    // Exposed class functions/variables
    return {
        reset() {
        },

        step() {
            if (++divFrames >= DIV_SPEED) {
                divFrames  = 0;
                div++;
            }

            if (enabled) {
                if (++frames >= clock) {
                    if (tima == 0xff) {
                        tima = tma;
                        bus.interruptSet(IRQ_TIMER);
                    } else {
                        tima++;
                    }

                    frames = 0;
                }
            }
        },

        write(addr, data) {
            switch (addr & 0xff) {
                case 0x04:
                    div = 0;
                    return;

                case 0x05:
                    tima = data;
                    return;

                case 0x06:
                    tma = data;
                    return;

                case 0x07:
                    enabled = data & 0x4;

                    switch (data & 0x3) {
                        case 0: clock = TMR_CLOCK_0; return;
                        case 1: clock = TMR_CLOCK_1; return;
                        case 3: clock = TMR_CLOCK_3; return;

                        default:
                            emulator.error('Timer selected clock ' + emulator.hex(data & 0x3));
                            return;
                    }
                    return;

                default:
                    emulator.error('Timer Write ' + emulator.hex(addr) + ' <- ' + emulator.hex(data));
                    return;
            }
        },

        read(addr) {
            switch (addr & 0xff) {
                case 0x04:
                    return div;

                case 0x05:
                    return tima;

                default:
                    emulator.error('Timer Read ' + emulator.hex(addr));
                    return 0;
            }
        }
    };
};

const timers = new GameBowie.CstrTimers();
