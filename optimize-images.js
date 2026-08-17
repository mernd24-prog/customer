import sharp from "sharp";
import { readdir, stat } from "fs/promises";
import path from "path";

const dirPath = "./public/image";
const MAX_WIDTH = 1200;

async function processDirectory(directory) {
  const files = await readdir(directory, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(directory, file.name);
    
    if (file.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.name.match(/\.(png|jpg|jpeg)$/i)) {
      const stats = await stat(fullPath);
      // Only process files larger than 1MB (1048576 bytes)
      if (stats.size > 1048576) {
        console.log(`Optimizing: ${fullPath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        const tempPath = fullPath + ".tmp.webp";
        
        try {
          await sharp(fullPath)
            .resize({ width: MAX_WIDTH, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(tempPath);
            
          // We will manually overwrite the original with standard fs commands if desired,
          // but replacing directly might break the app if it relies on exact extensions.
          // Wait, if it relies on exact extensions, we should output to the SAME extension name, 
          // but compressed! Or we just resize and compress the JPG/PNG. Let's do that!
          
          const tempPathSameExt = fullPath + ".tmp";
          
          if (file.name.match(/\.(png)$/i)) {
            await sharp(fullPath)
              .resize({ width: MAX_WIDTH, withoutEnlargement: true })
              .png({ quality: 80, compressionLevel: 8 })
              .toFile(tempPathSameExt);
          } else {
            await sharp(fullPath)
              .resize({ width: MAX_WIDTH, withoutEnlargement: true })
              .jpeg({ quality: 80, progressive: true })
              .toFile(tempPathSameExt);
          }
          
          const newStats = await stat(tempPathSameExt);
          console.log(`  -> Reduced to: ${(newStats.size / 1024 / 1024).toFixed(2)} MB`);
          
          // Replace original with optimized version
          import('fs').then(fs => {
            fs.renameSync(tempPathSameExt, fullPath);
          });
          
        } catch (err) {
          console.error(`Error processing ${fullPath}:`, err.message);
        }
      }
    }
  }
}

processDirectory(dirPath)
  .then(() => console.log("Done!"))
  .catch(console.error);
