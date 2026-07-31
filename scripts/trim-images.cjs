const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public");

function findContentBox(data, width, height, channels, threshold = 28) {
  let top = height;
  let left = width;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = channels > 3 ? data[i + 3] : 255;
      const bright = (r + g + b) / 3;
      if (a <= 20 || bright <= threshold) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }

  if (right < left || bottom < top) return null;
  return { top, left, right, bottom };
}

async function processImage(filePath, { square = false, pad = 24 } = {}) {
  const { data, info } = await sharp(filePath)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const box = findContentBox(data, info.width, info.height, info.channels);
  if (!box) {
    console.log("skip:", path.basename(filePath));
    return;
  }

  let { top, left, right, bottom } = box;
  top = Math.max(0, top - pad);
  left = Math.max(0, left - pad);
  right = Math.min(info.width - 1, right + pad);
  bottom = Math.min(info.height - 1, bottom + pad);

  const contentW = right - left + 1;
  const contentH = bottom - top + 1;
  const isPng = /\.png$/i.test(filePath);
  const tmp = filePath + ".tmp";

  if (!square) {
    await sharp(filePath)
      .rotate()
      .extract({ left, top, width: contentW, height: contentH })
      .toFile(tmp);
    fs.renameSync(tmp, filePath);
    console.log("trim", path.basename(filePath), `${contentW}x${contentH}`);
    return;
  }

  const side = Math.max(contentW, contentH);
  const cx = left + contentW / 2;
  const cy = top + contentH / 2;
  const squareLeft = Math.round(cx - side / 2);
  const squareTop = Math.round(cy - side / 2);

  const extractLeft = Math.max(0, squareLeft);
  const extractTop = Math.max(0, squareTop);
  const extractRight = Math.min(info.width, squareLeft + side);
  const extractBottom = Math.min(info.height, squareTop + side);
  const extractW = extractRight - extractLeft;
  const extractH = extractBottom - extractTop;
  const offsetX = extractLeft - squareLeft;
  const offsetY = extractTop - squareTop;

  const piece = await sharp(filePath)
    .rotate()
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractW,
      height: extractH,
    })
    .toBuffer();

  const canvas = sharp({
    create: {
      width: side,
      height: side,
      channels: isPng ? 4 : 3,
      background: isPng
        ? { r: 0, g: 0, b: 0, alpha: 1 }
        : { r: 0, g: 0, b: 0 },
    },
  }).composite([{ input: piece, left: offsetX, top: offsetY }]);

  if (isPng) await canvas.png().toFile(tmp);
  else await canvas.jpeg({ quality: 90 }).toFile(tmp);

  fs.renameSync(tmp, filePath);
  console.log("square", path.basename(filePath), `${side}x${side}`);
}

async function main() {
  for (const name of fs.readdirSync(path.join(ROOT, "perfumes"))) {
    if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
    await processImage(path.join(ROOT, "perfumes", name), {
      square: false,
      pad: 20,
    });
  }

  for (const name of fs.readdirSync(path.join(ROOT, "memory"))) {
    if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
    await processImage(path.join(ROOT, "memory", name), {
      square: true,
      pad: 24,
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
