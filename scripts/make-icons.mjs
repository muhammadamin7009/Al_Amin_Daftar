// Telefon ekranidagi ikonka. Tashqi kutubxona yo'q — piksel chizib, PNG yig'amiz.
import { writeFileSync, mkdirSync } from "node:fs";
import { deflateSync, crc32 } from "node:zlib";

const INK = [0x16, 0x18, 0x1a];
const PAPER = [0xff, 0xff, 0xff];
const GREEN = [0x17, 0x34, 0x04];
const LINE = [0xc9, 0xcc, 0xc9];

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function toPng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** inset — maskable ikonkada chekka kesiladi, shuning uchun ichkariroq chizamiz */
function draw(size, inset) {
  const px = Buffer.alloc(size * size * 3);
  const put = (x, y, c) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 3;
    px[i] = c[0];
    px[i + 1] = c[1];
    px[i + 2] = c[2];
  };
  const rect = (x0, y0, w, h, c) => {
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) put(x, y, c);
  };

  rect(0, 0, size, size, INK);

  const u = size / 512; // 512 asosida o'lchangan
  const pad = inset * size;
  const pageX = Math.round(128 * u + pad);
  const pageY = Math.round(112 * u + pad);
  const pageW = Math.round(256 * u - pad * 2);
  const pageH = Math.round(288 * u - pad * 2);

  rect(pageX, pageY, pageW, pageH, PAPER);
  rect(pageX, pageY, Math.max(2, Math.round(28 * u)), pageH, GREEN);

  const lineX = pageX + Math.round(62 * u);
  const lineW = pageW - Math.round(94 * u);
  const lineH = Math.max(2, Math.round(18 * u));
  for (const y of [88, 152, 216]) {
    rect(lineX, pageY + Math.round(y * u), lineW, lineH, LINE);
  }

  return toPng(size, px);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", draw(192, 0));
writeFileSync("public/icons/icon-512.png", draw(512, 0));
writeFileSync("public/icons/icon-maskable-512.png", draw(512, 0.12));
console.log("ikonkalar tayyor");
