/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrBus = function() {
    // Definition of interrupts
    const irqs = [{
        code: IRQ_VBLANK,
        addr: 0x40,
    }, {
        code: IRQ_LCDC,
        addr: 0x48,
    }, {
        code: IRQ_TIMER,
        addr: 0x50,
    }, {
        code: IRQ_SERIAL,
        addr: 0x58,
    }, {
        code: IRQ_CONTROL,
        addr: 0x60,
    }];

    function interruptDiscard(code) {
        bus.interrupts.data ^= code;
    }

    function interruptQueued(code) {
        return bus.interrupts.data & bus.interrupts.mask & code;
    }

    // Exposed class functions/variables
    return {
        interrupts: {
            // Interrupt Master Enable (IME)
            enabled: undefined,
               data: undefined,
               mask: undefined,
        },

        reset() {
            bus.interrupts.enabled = false;
            bus.interrupts.data = 0xe0;
            bus.interrupts.mask = 0;
        },

        interruptSet(code) {
            bus.interrupts.data |= code;
        },

        interruptsUpdate() {
            if (interruptQueued(IRQ_ANY) && (bus.interrupts.enabled || cpu.halt)) {
                cpu.halt = false;

                // Interrupt Master Enable (IME)
                if (bus.interrupts.enabled) {
                    bus.interrupts.enabled = false;

                    // Push PC
                    cpu.sp -= 2;
                    mem.write.h(cpu.sp, cpu.pc);

                    for (const item of irqs) {
                        if (interruptQueued (item.code)) {
                            interruptDiscard(item.code);
                            cpu.pc = item.addr;
                            break;
                        }
                    }
                }
            }
        }
    };
};

const bus = new GameBowie.CstrBus();
