/* Base structure and authentic idea GameBowie (Credits: Dennis Koluris) */

GameBowie.CstrScreen = function() {
    const LCD_MODE_HBLANK = 0;
    const LCD_MODE_VBLANK = 1;
    const LCD_MODE_OAM    = 2;
    const LCD_MODE_DRAW   = 3;

    // Time
    const LCD_LINE_CYCLES = 456;
    const LCD_LINE_TOTAL  = LCD_RES_Y + 10;

    // Mem Addresses
    const LCD_BG_TILE_DATA_0 = 0x8000;
    const LCD_BG_TILE_DATA_1 = 0x8800;
    const LCD_BG_TILE_MAP__0 = 0x9800;
    const LCD_BG_TILE_MAP__1 = 0x9c00;

    const LCD_START_VRAM = 0x8000;
    const LCD_START_OAM  = 0xfe00;

    const base = {
             frames: undefined,
               line: undefined,
        lineCompare: undefined,
               mode: undefined,
    };

    const control = {
           drawEnabled: undefined,
        spritesEnabled: undefined,
            spriteSize: undefined,
           backTileMap: undefined,
              tileData: undefined,
         windowEnabled: undefined,
         windowTileMap: undefined,
            lcdEnabled: undefined,
    };

    const status = {
              mode: undefined,
            hblank: undefined,
            vblank: undefined,
               oam: undefined,
        coincident: undefined,
    };

    const scroll = {
        h: undefined,
        v: undefined,
    };

    const window = {
        h: undefined,
        v: undefined,
    };

    const dma = {
           raw: undefined,
           src: undefined,
        offset: undefined,
        frames: undefined,
    };

    const palBackdrop = {
         raw: undefined,
        data: new UintBcap(4)
    };

    const palSprite1 = {
        raw: undefined,
       data: new UintBcap(4)
   };

   const palSprite2 = {
        raw: undefined,
       data: new UintBcap(4)
    };

    function isBitSet(data, f) {
        return data & (1 << f);
    }

    function parsePalette(palette, data) {
        palette.data[0] = (data >> 0) & 3;
        palette.data[1] = (data >> 2) & 3;
        palette.data[2] = (data >> 4) & 3;
        palette.data[3] = (data >> 6) & 3;
    }

    function drawBackdrop(lineY) {
        for (let lineX = 0; lineX < LCD_RES_X; lineX++) {
            let tileMap;
            let posY, posX;

            if (control.windowEnabled && lineY >= window.v && lineX >= window.h - 7) {
                tileMap = control.windowTileMap ? LCD_BG_TILE_MAP__1 : LCD_BG_TILE_MAP__0;
                posY = lineY - (window.v);
                posX = lineX - (window.h - 7);
            }
            else {
                tileMap = control.  backTileMap ? LCD_BG_TILE_MAP__1 : LCD_BG_TILE_MAP__0;
                posY = lineY + (scroll.v);
                posX = lineX + (scroll.h - 0);
            }

            let tileRow      = (posY / 8) * 32;
            let tileColumn   = (posX / 8);
            let tileNum      = mem.rawAccess(tileMap + tileRow + tileColumn);
            let tileLocation = 0;

            if (control.tileData) {
                tileLocation = LCD_BG_TILE_DATA_0 + tileNum * 16;
            }
            else {
                tileLocation = LCD_BG_TILE_DATA_1 + (SIGN_EXT_8(tileNum) + 128) * 16;
            }

            let line = (posY % 8) * 2;
            let b1 = mem.rawAccess(tileLocation + line);
            let b2 = mem.rawAccess(tileLocation + line + 1);
            
            let maskBit  = 7 - (posX % 8);
            let colorNum = isBitSet(b1, maskBit) | (isBitSet(b2, maskBit) << 1);
            
            // TODO: sdl.pixel(lineX, lineY, palBackdrop.data[colorNum]);
        }
    }

    function drawSprites(lineY) {
        for (let sprt = 0; sprt < 40; sprt++) {
            let spriteAddr = LCD_START_OAM + (sprt * 4);
            let posY    = mem.rawAccess(spriteAddr + 0) - 16;
            let posX    = mem.rawAccess(spriteAddr + 1) - 8;
            let tileNum = mem.rawAccess(spriteAddr + 2);
            let attr    = mem.rawAccess(spriteAddr + 3);
            let size    = control.spriteSize ? 16 : 8;

            let flipY = (attr >> 6) & 1;
            let flipX = (attr >> 5) & 1;
            let paletteNum = (attr >> 4) & 1;

            if (lineY >= posY && lineY < posY + size) {
                let line = flipY ? (-(lineY - posY - size) * 2) : ((lineY - posY) * 2);

                let tileLocation = LCD_START_VRAM + (tileNum * 16) + line;
                let b1 = mem.rawAccess(tileLocation);
                let b2 = mem.rawAccess(tileLocation + 1);

                for (let lineX = 7; lineX >= 0; lineX--) {
                    let maskBit  = flipX ? (-(lineX - 7)) : lineX;
                    let colorNum = isBitSet(b1, maskBit) | (isBitSet(b2, maskBit) << 1);

                    if (colorNum == 0) {
                        continue;
                    }

                    // TODO: sdl.pixel(posX + (7 - lineX), lineY, paletteNum ? palSprite2.data[colorNum] : palSprite1.data[colorNum]);
                }
            }
        }
    }

    return {
        reset() {
            base.frames      = 0;
            base.line        = 0;
            base.lineCompare = 0;
            base.mode        = 0;

            control.drawEnabled    = false;
            control.spritesEnabled = false;
            control.spriteSize     = false;
            control.backTileMap    = false;
            control.tileData       = false;
            control.windowEnabled  = false;
            control.windowTileMap  = false;
            control.lcdEnabled     = false;

            status.mode       = 0;
            status.hblank     = false;
            status.vblank     = false;
            status.oam        = false;
            status.coincident = false;

            scroll.h = 0;
            scroll.v = 0;

            window.h = 0;
            window.v = 0;

            dma.raw    = 0;
            dma.src    = 0;
            dma.offset = 0;
            dma.frames = 0;

            palBackdrop.raw  = 0;
            palBackdrop.data = [];

            palSprite1. raw  = 0;
            palSprite1. data = [];

            palSprite2. raw  = 0;
            palSprite2. data = [];
        },

        step() {
            if (dma.frames > 0) {
                mem.ram.ub[LCD_START_OAM + dma.offset] = mem.ram.ub[dma.src + dma.offset];
                dma.frames--;
                dma.offset++;
            }

            if (!control.lcdEnabled) {
                return;
            }

            base.frames++;

            switch (base.mode) {
                case LCD_MODE_HBLANK:
                    if (base.frames >= 204) {
                        base.frames -= 204;

                        base.line++;

                        if (base.line == base.lineCompare) {
                            bus.interruptSet(IRQ_LCDC);
                        }

                        if (base.line == 144) {
                            base.mode = LCD_MODE_VBLANK;
                            bus.interruptSet(IRQ_VBLANK);
                            sdl.update();
                        } else {
                            base.mode = LCD_MODE_OAM;
                        }
                    }
                    break;

                case LCD_MODE_VBLANK:
                    if (base.frames >= 456) {
                        base.frames -= 456;

                        base.line++;

                        if (base.line > 153) {
                            base.line = 0;
                            base.mode = LCD_MODE_OAM;
                        }

                        if (base.line == base.lineCompare) {
                            bus.interruptSet(IRQ_LCDC);
                        }
                    }
                    break;

                case LCD_MODE_OAM:
                    if (base.frames >= 80) {
                        base.frames -= 80;
                        base.mode = LCD_MODE_DRAW;
                    }
                    break;

                case LCD_MODE_DRAW:
                    if (base.frames >= 172) {
                        base.frames -= 172;

                        if (control.drawEnabled) {
                            drawBackdrop(base.line);
                        }

                        if (control.spritesEnabled) {
                            drawSprites(base.line);
                        }

                        base.mode = LCD_MODE_HBLANK;
                    }
                    break;
            }
        },

        write(addr, data) {
            switch (addr & 0xff) {
                case 0x40: // Control
                    control.drawEnabled    = (data >> 0) & 1;
                    control.spritesEnabled = (data >> 1) & 1;
                    control.spriteSize     = (data >> 2) & 1;
                    control.backTileMap    = (data >> 3) & 1;
                    control.tileData       = (data >> 4) & 1;
                    control.windowEnabled  = (data >> 5) & 1;
                    control.windowTileMap  = (data >> 6) & 1;
                    control.lcdEnabled     = (data >> 7) & 1;
                    return;

                case 0x41: // Status
                    status.hblank     = (data >> 3) & 1;
                    status.vblank     = (data >> 4) & 1;
                    status.oam        = (data >> 5) & 1;
                    status.coincident = (data >> 6) & 1;
                    return;

                case 0x42: // Scroll Y
                    scroll.v = data;
                    return;

                case 0x43: // Scroll X
                    scroll.h = data;
                    return;

                case 0x44: // TODO: Should we reset the current scanline?
                    base.line = 0;
                    return;

                case 0x45: // Current scanline compare
                    base.lineCompare = data;
                    return;

                case 0x46: // OAM DMA
                    dma.raw    = data;
                    dma.src    = data << 8;
                    dma.offset = 0;
                    dma.frames = 160;
                    return;

                case 0x47: // BG Palette
                    palBackdrop.raw = data;
                    parsePalette(palBackdrop, data);
                    return;

                case 0x48: // Sprite Palette 1
                    palSprite1.raw = data;
                    parsePalette(palSprite1, data);
                    return;

                case 0x49: // Sprite Palette 2
                    palSprite2.raw = data;
                    parsePalette(palSprite2, data);
                    return;

                case 0x4a: // Window Y
                    window.v = data;
                    return;

                case 0x4b: // Window X
                    window.h = data;
                    return;

                default:
                    emulator.error('LCD Write ' + emulator.hex(addr) + ' <- ' + emulator.hex(data));
                    return;
            }
        },

        read(addr) {
            let tmp = 0;

            switch (addr & 0xff) {
                case 0x40: // Control
                    if (control.drawEnabled)    tmp |= (1 << 0);
                    if (control.spritesEnabled) tmp |= (1 << 1);
                    if (control.spriteSize)     tmp |= (1 << 2);
                    if (control.backTileMap)    tmp |= (1 << 3);
                    if (control.tileData)       tmp |= (1 << 4);
                    if (control.windowEnabled)  tmp |= (1 << 5);
                    if (control.windowTileMap)  tmp |= (1 << 6);
                    if (control.lcdEnabled)     tmp |= (1 << 7);
                    return tmp;

                case 0x41: // Status
                    tmp = (base.mode & 0b11);
                    if (status.hblank)     tmp |= (1 << 3);
                    if (status.vblank)     tmp |= (1 << 4);
                    if (status.oam)        tmp |= (1 << 5);
                    if (status.coincident) tmp |= (1 << 6);
                    return tmp;

                case 0x42: // Scroll Y
                    return scroll.v;

                case 0x43: // Scroll X
                    return scroll.h;

                case 0x44: // Current scanline
                    return base.line;

                case 0x45: // Current scanline compare
                    return base.lineCompare;

                case 0x47: // BG Palette
                    return palBackdrop.raw;

                case 0x48: // Sprite Palette 1
                    return palSprite1.raw;

                case 0x49: // Sprite Palette 2
                    return palSprite2.raw;

                case 0x4a: // Window Y
                    return window.v;

                case 0x4b: // Window X
                    return window.h;

                default:
                    emulator.error('LCD Read ' + emulator.hex(addr));
                    return 0;
            }
        }
    };
};

const screen = new GameBowie.CstrScreen();
