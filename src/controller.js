/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

#define buttonCheck(kind, shift) \
    if (!(value & kind)) { \
        value &= 0xf0 | (((btnState >>> shift) & 0x0f) ^ 0x0f); \
    }

GameBowie.CstrController = function() {
    const INPUT_DIRECTIONAL = 0x10;
    const INPUT_BUTTONS     = 0x20;

    const PAD_BUTTON_RIGHT  = 0;
    const PAD_BUTTON_LEFT   = 1;
    const PAD_BUTTON_UP     = 2;
    const PAD_BUTTON_DOWN   = 3;
    const PAD_BUTTON_B      = 4;
    const PAD_BUTTON_A      = 5;
    const PAD_BUTTON_SELECT = 6;
    const PAD_BUTTON_START  = 7;

    let value;
    let btnState;

    // Exposed class functions/variables
    return {
        reset() {
            value = 0;
            btnState = 0;
        },

        update(code, pressed) {
            switch (code) {
                case 39: // ->
                    code = PAD_BUTTON_RIGHT;
                    break;

                case 37: // <-
                    code = PAD_BUTTON_LEFT;
                    break;

                case 38: // Up
                    code = PAD_BUTTON_UP;
                    break;

                case 40: // Down
                    code = PAD_BUTTON_DOWN;
                    break;

                case 90: // Z
                    code = PAD_BUTTON_B;
                    break;

                case 88: // A
                    code = PAD_BUTTON_A;
                    break;

                case 50: // 2
                    code = PAD_BUTTON_SELECT;
                    break;

                case 49: // 1
                    code = PAD_BUTTON_START;
                    break;
            }

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
