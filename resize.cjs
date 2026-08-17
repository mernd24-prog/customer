const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImages() {
  const images = [
    { name: 'raksaha.webp', width: 475, height: 486 },
    { name: 'gifts2.webp', width: 371, height: 380 },
    { name: 'rakhii.webp', width: 371, height: 380 },
    { name: 'logo.webp', width: 130, height: 72 }
  ];

  for (const img of images) {
    const inputPath = path.join(__dirname, 'public/image/png', img.name);
    if (!fs.existsSync(inputPath)) {
      console.log('Skipping ' + img.name + ', not found');
      continue;
    }
    
    // Create the small version
    const ext = path.extname(img.name);
    const basename = path.basename(img.name, ext);
    const smallPath = path.join(__dirname, 'public/image/png', `${basename}-small.webp`);
    
    await sharp(inputPath)
      .resize({ width: img.width })
      .webp({ quality: 80, effort: 6 })
      .toFile(smallPath);
      
    // Create the AVIF version (small)
    const avifSmallPath = path.join(__dirname, 'public/image/png', `${basename}-small.avif`);
    await sharp(inputPath)
      .resize({ width: img.width })
      .avif({ quality: 65, effort: 6 })
      .toFile(avifSmallPath);
      
    // Create the AVIF version (large)
    const avifLargePath = path.join(__dirname, 'public/image/png', `${basename}.avif`);
    await sharp(inputPath)
      .avif({ quality: 65, effort: 6 })
      .toFile(avifLargePath);

    console.log(`Processed ${img.name}`);
  }
}

processImages().catch(console.error);
