const sharp = require('sharp');

const svg = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" fill="#0ea5e9" rx="36"/>
  <g fill="#ffffff">
    <rect x="36" y="54" width="108" height="14" rx="4"/>
    <rect x="36" y="79" width="76" height="11" rx="3"/>
    <rect x="36" y="101" width="92" height="11" rx="3"/>
    <rect x="36" y="123" width="68" height="11" rx="3"/>
  </g>
</svg>`;

sharp(Buffer.from(svg))
    .png()
    .toFile('public/apple-touch-icon.png')
    .then(() => console.log('✓ apple-touch-icon.png generado'));
