/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrAudio = function() {
    return {
        reset() {
        },

        write(addr, data) {
            switch (addr & 0xff) {
                default:
                    //emulator.error('Audio Write ' + emulator.hex(addr) + ' <- ' + emulator.hex(data));
                    return;
            }
        },

        read(addr) {
            switch (addr & 0xff) {
                default:
                    //emulator.error('Audio Read ' + emulator.hex(addr));
                    return 0;
            }
        }
    };
};

const audio = new GameBowie.CstrAudio();
