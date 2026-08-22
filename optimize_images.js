const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = __dirname;

async function processImage(relPath, maxWidth, quality = 80) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) return;

  const stat = fs.statSync(fullPath);
  const oldSizeMB = (stat.size / 1024 / 1024).toFixed(2);

  const ext = path.extname(fullPath).toLowerCase();
  const tmpPath = fullPath + '.tmp';

  try {
    let pipeline = sharp(fullPath);
    const metadata = await pipeline.metadata();

    if (metadata.width && metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    if (ext === '.png') {
      await pipeline.png({ quality, compressionLevel: 9 }).toFile(tmpPath);
    } else if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(tmpPath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality }).toFile(tmpPath);
    }

    if (fs.existsSync(tmpPath)) {
      const newStat = fs.statSync(tmpPath);
      const newSizeMB = (newStat.size / 1024 / 1024).toFixed(2);
      fs.copyFileSync(tmpPath, fullPath);
      fs.unlinkSync(tmpPath);
      console.log(`[Optimized] ${relPath}: ${oldSizeMB} MB -> ${newSizeMB} MB`);
    }
  } catch (err) {
    console.error(`[Error] ${relPath}:`, err.message);
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
}

async function run() {
  console.log('Starting image optimizations...');

  // Hero & Cover (max 1400px width)
  await processImage('assets/images/cover/cover.png', 1400);
  await processImage('assets/images/hero/hero.png', 1400);
  await processImage('assets/images/hero/hero-alt.png', 1400);

  // Bride & Groom portraits (max 800px width)
  await processImage('assets/images/gallery/bride.png', 800);
  await processImage('assets/images/gallery/groom.png', 800);
  await processImage('assets/images/gallery/single/ChatGPT Image Aug 23, 2026, 12_15_03 AM.png', 800);
  await processImage('assets/images/gallery/single/ChatGPT Image Aug 23, 2026, 12_37_19 AM.png', 800);

  // Family photos (max 1000px width)
  await processImage('assets/images/gallery/IMG_0209.JPG.jpeg', 1000);
  await processImage('assets/images/gallery/IMG_0202.JPG.jpeg', 1000);

  // Couple gallery canvas (max 1000px width)
  await processImage('assets/images/gallery/couple/IMG_0203.JPG.jpeg', 1000);
  await processImage('assets/images/gallery/couple/IMG_9938.JPG.jpeg', 1000);
  await processImage('assets/images/gallery/couple/WhatsApp Image 2026-08-23 at 12.07.31 AM.jpeg', 1000);

  console.log('--- ALL IMAGE OPTIMIZATIONS COMPLETE ---');
}

run();
