/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrMem = function() {
    return {
        ram: union(0x10000),

        reset() {
            // Reset all
            mem.ram.ub.fill(0);
        },

        write: {
            h(addr, data) {
            },

            b(addr, data) {
            }
        },

        read: {
            h(addr) {
            },

            b(addr) {
            }
        }
    };
};

const mem = new GameBowie.CstrMem();
