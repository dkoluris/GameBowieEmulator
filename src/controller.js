/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

#define buttonCheck(kind, shift) \
    if (!(value & kind)) { \
        value &= 0xf0 | (((btnState >> shift) & 0x0f) ^ 0x0f); \
    }

GameBowie.CstrController = function() {
    const INPUT_DIRECTIONAL = 0x10;
    const INPUT_BUTTONS     = 0x20;

    // Exposed class functions/variables
    return {
        reset() {
            value = 0;
            btnState = 0;
        },

        update(code, pressed) {
            if (pressed) {
                btnState |= (1 << code);
            }
            else {
                btnState &= (1 << code) ^ 0xff;
            }
        },

        write(data) {
            value = data & 0x30;
        },

        read() {
            value |= 0x0f;

            buttonCheck(INPUT_DIRECTIONAL, 0);
            buttonCheck(INPUT_BUTTONS, 4);

            return 0xc0 | value;
        }
    };
};

const input = new GameBowie.CstrController();
