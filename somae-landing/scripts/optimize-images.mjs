/**
 * Optimizes the official Somae brand assets into web-ready sizes.
 * Source of truth: ../dzine/Somae/public (the shipped extension assets).
 *
 * Also converts any expression images dropped into
 * public/assets/avatar/expressions/ (png/jpg/webp) into optimized webp.
 *
 * Run: npm run optimize:images
 */
import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const brandSrc = path.resolve(root, '../dzine/Somae/public');
const outDir = path.resolve(root, 'public/assets');
const expressionsDir = path.join(outDir, 'avatar/expressions');

await mkdir(path.join(outDir, 'avatar/expressions'), { recursive: true });
await mkdir(path.join(outDir, 'logo'), { recursive: true });

const jobs = [
  // Primary avatar — hero + journey layer
  { src: 'avatar.png', out: 'avatar/avatar-992.webp', width: 992, quality: 88 },
  { src: 'avatar.png', out: 'avatar/avatar-512.webp', width: 512, quality: 86 },
  { src: 'avatar.png', out: 'avatar/avatar-256.webp', width: 256, quality: 84 },
  // Logo
  { src: 'logo.png', out: 'logo/logo-256.webp', width: 256, quality: 86 },
  { src: 'logo.png', out: 'logo/logo-128.webp', width: 128, quality: 84 },
];

for (const job of jobs) {
  const input = path.join(brandSrc, job.src);
  if (!existsSync(input)) {
    console.warn(`⚠ missing source: ${input}`);
    continue;
  }
  await sharp(input)
    .resize({ width: job.width, withoutEnlargement: true })
    .webp({ quality: job.quality, alphaQuality: 95 })
    .toFile(path.join(outDir, job.out));
  console.log(`✓ ${job.out}`);
}

// Favicons from the avatar
await sharp(path.join(brandSrc, 'avatar.png'))
  .resize({ width: 64 })
  .png()
  .toFile(path.join(root, 'public/favicon.png'));
await sharp(path.join(brandSrc, 'avatar.png'))
  .resize({ width: 180 })
  .png()
  .toFile(path.join(root, 'public/apple-touch-icon.png'));
console.log('✓ favicon.png / apple-touch-icon.png');

// Expression images: drop thinking.png / happy.png / excited.png / calm.png
// into public/assets/avatar/expressions/ and they get optimized automatically.
if (existsSync(expressionsDir)) {
  const files = await readdir(expressionsDir);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const name = path.basename(file, ext);
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      await sharp(path.join(expressionsDir, file))
        .resize({ width: 992, withoutEnlargement: true })
        .webp({ quality: 88, alphaQuality: 95 })
        .toFile(path.join(expressionsDir, `${name}.webp`));
      console.log(`✓ expressions/${name}.webp`);
    }
  }
}

console.log('Done.');
