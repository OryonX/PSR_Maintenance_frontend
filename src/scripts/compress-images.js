// scripts/compress-images.js
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';

const INPUT_DIR = 'src/assets/img';
const OUTPUT_DIR = 'src/assets/img-optimized';
const MAX_BYTES = 1024 * 1024; // 1MB
const MAX_WIDTH = 1920;        // techo de ancho; ajusta si tus imágenes son más grandes de lo que se muestran en pantalla
const VALID_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

function walk(dir) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files = files.concat(walk(fullPath));
    } else if (VALID_EXT.includes(extname(entry).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function compressToTarget(inputPath, outputPath) {
  let quality = 85;
  let buffer;

  while (quality >= 40) {
    buffer = await sharp(inputPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (buffer.length <= MAX_BYTES || quality <= 40) break;
    quality -= 10;
  }

  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, buffer);

  return { size: buffer.length, quality };
}

async function run() {
  const files = walk(INPUT_DIR);
  console.log(`Encontradas ${files.length} imágenes.\n`);

  for (const file of files) {
    const relPath = relative(INPUT_DIR, file);
    const outDir = join(OUTPUT_DIR, relPath, '..');
    const outputPath = join(OUTPUT_DIR, relPath.replace(extname(relPath), '.webp'));

    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const originalSize = statSync(file).size;
    const { size, quality } = await compressToTarget(file, outputPath);

    const status = size <= MAX_BYTES ? '✓' : '⚠ sigue > 1MB, revisar manualmente';
    console.log(
      `${status} ${relPath} — ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(size / 1024 / 1024).toFixed(2)}MB (q${quality})`
    );
  }
}

run();