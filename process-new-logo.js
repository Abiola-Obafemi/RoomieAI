import sharp from 'sharp';
import fs from 'fs';

const input = 'C:\\Users\\Abiola Obafemi\\.gemini\\antigravity\\brain\\c1d52905-f02e-4c00-834f-75764fb0222a\\roomie_ai_logo_1775268402772.png';

async function run() {
  try {
    // Delete old svg just in case
    if (fs.existsSync('public/favicon.svg')) fs.unlinkSync('public/favicon.svg');
    
    await sharp(input).resize(512, 512).toFile('public/icon-512x512.png');
    await sharp(input).resize(192, 192).toFile('public/icon-192x192.png');
    await sharp(input).resize(64, 64).toFile('public/favicon.ico');
    await sharp(input).resize(512, 512).toFile('public/logo.png');
    
    console.log("Successfully rendered down the new AI logo to the public directory.");
  } catch (err) {
    console.error("Error creating crisp images:", err.message);
  }
}
run();
