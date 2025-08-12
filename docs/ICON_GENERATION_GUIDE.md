# Icon Generation Guide

## Current Issue
All PWA icons are currently 93x88 pixels instead of their declared sizes in manifest.json. This causes warnings in the browser console.

## Solution

### Option 1: Use Online Tool (Recommended for Quick Fix)
1. Go to [PWA Asset Generator](https://progressier.com/pwa-icons-and-ios-splash-screen-generator)
2. Upload your logo file (preferably 512x512 or larger)
3. Download the generated icons
4. Replace files in `/public/images/`

### Option 2: Use ImageMagick (Local Generation)
```bash
# Install ImageMagick
sudo apt-get install imagemagick  # Ubuntu/Debian
# or
brew install imagemagick  # macOS

# Generate icons
cd scripts
./generate-icons.sh ../public/logo.png
```

### Option 3: Use Node.js Script
```bash
# Install sharp
npm install --save-dev sharp

# Create and run generation script
node scripts/generate-pwa-icons.js
```

## Required Icon Sizes
- 72x72 - Android Chrome
- 96x96 - Chrome Web Store
- 128x128 - Chrome Web Store
- 144x144 - Microsoft Store
- 152x152 - iPad
- 192x192 - Android Chrome
- 384x384 - Android Chrome
- 512x512 - Android Chrome

## Temporary Fix
The icons will work even with incorrect sizes, but you'll see console warnings. The app will still function normally.

## Best Practices
1. Start with a square logo at least 512x512 pixels
2. Use PNG format with transparency
3. Keep important content in the center (safe area)
4. Test on different devices after generation