import sharp from 'sharp';

const input = 'C:\\Users\\Abiola Obafemi\\Downloads\\RoomieAI logo with robot house.png';

async function run() {
  try {
    const metadata = await sharp(input).metadata();
    console.log("Width:", metadata.width, "Height:", metadata.height);

    const size = metadata.height;
    
    // We assume the icon is the left-most part of the logo and forms roughly a square
    // Crop a square of size equal to the image's height from the left (left: 0)
    await sharp(input)
      .extract({ left: 0, top: 0, width: size, height: size })
      .resize(512, 512)
      .toFile('public/icon-512x512.png');

    await sharp(input)
      .extract({ left: 0, top: 0, width: size, height: size })
      .resize(192, 192)
      .toFile('public/icon-192x192.png');
      
    // Create an favicon (using png for ico just roughly copying it or size 64)
    await sharp(input)
      .extract({ left: 0, top: 0, width: size, height: size })
      .resize(64, 64)
      .toFile('public/favicon.ico');
      
    console.log("Processed icons successfully!");
  } catch (err) {
    console.error("Error doing sharp operations:", err.message);
  }
}
run();
