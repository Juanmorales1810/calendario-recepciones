const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, '../public');

// SVG base
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0ea5e9" rx="${size / 8}"/>
  <g fill="#ffffff">
    <rect x="${size * 0.2}" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.08}" rx="${size * 0.015}"/>
    <rect x="${size * 0.2}" y="${size * 0.44}" width="${size * 0.4}" height="${size * 0.06}" rx="${size * 0.01}"/>
    <rect x="${size * 0.2}" y="${size * 0.56}" width="${size * 0.5}" height="${size * 0.06}" rx="${size * 0.01}"/>
    <rect x="${size * 0.2}" y="${size * 0.68}" width="${size * 0.35}" height="${size * 0.06}" rx="${size * 0.01}"/>
  </g>
</svg>
`;

async function generateIcons() {
    for (const size of sizes) {
        const svg = svgTemplate(size);
        const outputPath = path.join(publicDir, `icon-${size}.png`);

        await sharp(Buffer.from(svg)).png().toFile(outputPath);

        console.log(`✓ Generado: icon-${size}.png`);
    }
}

generateIcons().catch(console.error);
