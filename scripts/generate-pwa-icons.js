const fs = require('fs')
const path = require('path')

// Simple script to create placeholder icons with correct dimensions
// This uses Canvas API to create simple colored squares as placeholders

const sizes = [
  { size: 72, name: 'logo-72.png' },
  { size: 96, name: 'logo-96.png' },
  { size: 128, name: 'logo-128.png' },
  { size: 144, name: 'logo-144.png' },
  { size: 152, name: 'logo-152.png' },
  { size: 192, name: 'logo-192.png' },
  { size: 384, name: 'logo-384.png' },
  { size: 512, name: 'logo-512.png' }
]

console.log('PWA Icon Generator')
console.log('==================')
console.log('')
console.log('To properly generate icons, you need to:')
console.log('1. Install sharp: npm install --save-dev sharp')
console.log('2. Provide a source logo of at least 512x512 pixels')
console.log('')
console.log("For now, the existing 93x88 icons will work, but you'll see console warnings.")
console.log('')
console.log('Quick fix options:')
console.log('- Use an online PWA icon generator')
console.log('- Install ImageMagick and use generate-icons.sh')
console.log('- Manually resize your logo using any image editor')

// Check if sharp is available
try {
  const sharp = require('sharp')
  console.log('\n✓ Sharp is installed! Generating icons...\n')

  const sourceImage = path.join(__dirname, '../public/logo.png')
  const outputDir = path.join(__dirname, '../public/images')

  // Generate each size
  Promise.all(
    sizes.map(({ size, name }) => {
      return sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .toFile(path.join(outputDir, name))
        .then(() => console.log(`✓ Generated ${name} (${size}x${size})`))
        .catch(err => console.error(`✗ Error generating ${name}:`, err.message))
    })
  ).then(() => {
    console.log('\n✓ Icon generation complete!')
  })
} catch (e) {
  console.log('\n✗ Sharp is not installed.')
  console.log('Run: npm install --save-dev sharp')
}
