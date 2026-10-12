/** Version 4-L QR, byte encoding, one Reed–Solomon block, mask 0.
 * Encodes the account's username locally without sending it to an image service.
 */
export function createProfileQr(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 78) throw new Error('This username is too long for the profile QR code.');
  const bits = [];
  const append = (value, count) => { for (let i = count - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  append(4, 4); append(bytes.length, 8);
  bytes.forEach(byte => append(byte, 8));
  append(0, Math.min(4, 640 - bits.length));
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((value, bit) => value * 2 + bit, 0));
  for (let i = 0; data.length < 80; i++) data.push(i % 2 ? 0x11 : 0xec);

  const multiply = (a, b) => {
    let product = 0;
    for (let i = 7; i >= 0; i--) {
      product = (product << 1) ^ ((product >>> 7) * 0x11d);
      product ^= ((b >>> i) & 1) * a;
    }
    return product;
  };
  const divisor = Array(20).fill(0); divisor[19] = 1;
  let root = 1;
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      divisor[j] = multiply(divisor[j], root);
      if (j + 1 < 20) divisor[j] ^= divisor[j + 1];
    }
    root = multiply(root, 2);
  }
  const remainder = Array(20).fill(0);
  for (const byte of data) {
    const factor = byte ^ remainder.shift(); remainder.push(0);
    for (let i = 0; i < 20; i++) remainder[i] ^= multiply(divisor[i], factor);
  }
  const encoded = [...data, ...remainder];
  const size = 33;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  const set = (x, y, value) => { matrix[y][x] = Boolean(value); reserved[y][x] = true; };
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      set(x, y, distance !== 2 && distance !== 4);
    }
  }
  for (let i = 8; i < size - 8; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(26 + dx, 26 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);

  // Error correction L (01) and mask 000, protected by BCH and the format XOR.
  const formatData = 8;
  let formatRemainder = formatData;
  for (let i = 0; i < 10; i++) formatRemainder = (formatRemainder << 1) ^ ((formatRemainder >>> 9) * 0x537);
  const format = ((formatData << 10) | formatRemainder) ^ 0x5412;
  const formatBit = i => (format >>> i) & 1;
  for (let i = 0; i <= 5; i++) set(8, i, formatBit(i));
  set(8, 7, formatBit(6)); set(8, 8, formatBit(7)); set(7, 8, formatBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, formatBit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, formatBit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, formatBit(i));
  set(8, size - 8, true);

  let bitIndex = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < size; vertical++) {
      const upward = ((right + 1) & 2) === 0;
      const y = upward ? size - 1 - vertical : vertical;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (reserved[y][x]) continue;
        const bit = bitIndex < encoded.length * 8 ? (encoded[bitIndex >>> 3] >>> (7 - (bitIndex & 7))) & 1 : 0;
        matrix[y][x] = Boolean(bit ^ ((x + y) % 2 === 0 ? 1 : 0));
        bitIndex++;
      }
    }
  }
  return matrix;
}
