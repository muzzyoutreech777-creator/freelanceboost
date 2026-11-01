import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNGChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createPNGChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 4 bytes per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const rMax = width / 2;
  const innerR = width * (isMaskable ? 0.30 : 0.38);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep Indigo to Slate gradient background: #4f46e5 (79, 70, 229) to #1e1b4b (30, 27, 75)
      const gradRatio = (x + y) / (width + height);
      let r = Math.round(79 * (1 - gradRatio) + 30 * gradRatio);
      let g = Math.round(70 * (1 - gradRatio) + 27 * gradRatio);
      let b = Math.round(229 * (1 - gradRatio) + 160 * gradRatio);
      let a = 255;

      // Outer rounded rect / circle badge
      if (!isMaskable) {
        // Squircle/rounded badge
        const cornerR = width * 0.22;
        const qx = Math.max(Math.abs(dx) - (cx - cornerR), 0);
        const qy = Math.max(Math.abs(dy) - (cy - cornerR), 0);
        const cornerDist = Math.sqrt(qx * qx + qy * qy);
        if (cornerDist > cornerR) {
          a = 0; // transparent outside badge
        }
      }

      // Inside: Draw Rocket / Sparkle / Pen glyph in White & Sky Blue
      if (a > 0) {
        // Central sparkle star shape: (dx^4 + dy^4) or diamond star
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        const starDist = (absX + absY);

        if (starDist < innerR * 0.95 && (absX < innerR * 0.25 || absY < innerR * 0.25 || (absX < innerR * 0.6 && absY < innerR * 0.6))) {
          // Glyph color: Bright crisp white / sky highlight
          r = 255;
          g = 255;
          b = 255;
        } else if (dist < innerR * 1.15 && dist > innerR * 0.9) {
          // Subtle circular halo accent
          r = Math.min(255, r + 40);
          g = Math.min(255, g + 60);
          b = 255;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createPNGChunk('IDAT', compressedData);
  const iendChunk = createPNGChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// Generate PNG icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

console.log('Successfully generated PWA PNG icons in public/');
