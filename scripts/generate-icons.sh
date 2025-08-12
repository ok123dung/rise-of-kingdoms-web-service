#!/bin/bash

# Generate PWA icons from a source image
# Usage: ./generate-icons.sh source-image.png

if [ -z "$1" ]; then
    echo "Usage: $0 source-image.png"
    echo "Please provide a source image (preferably 512x512 or larger)"
    exit 1
fi

SOURCE=$1
OUTPUT_DIR="../public/images"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is required but not installed."
    echo "Install it with: sudo apt-get install imagemagick (Ubuntu/Debian)"
    echo "or: brew install imagemagick (macOS)"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Generate icons
echo "Generating PWA icons..."

# Standard icon sizes
convert "$SOURCE" -resize 72x72 "$OUTPUT_DIR/logo-72.png"
convert "$SOURCE" -resize 96x96 "$OUTPUT_DIR/logo-96.png"
convert "$SOURCE" -resize 128x128 "$OUTPUT_DIR/logo-128.png"
convert "$SOURCE" -resize 144x144 "$OUTPUT_DIR/logo-144.png"
convert "$SOURCE" -resize 152x152 "$OUTPUT_DIR/logo-152.png"
convert "$SOURCE" -resize 192x192 "$OUTPUT_DIR/logo-192.png"
convert "$SOURCE" -resize 384x384 "$OUTPUT_DIR/logo-384.png"
convert "$SOURCE" -resize 512x512 "$OUTPUT_DIR/logo-512.png"

# Apple touch icons
convert "$SOURCE" -resize 180x180 "$OUTPUT_DIR/apple-touch-icon.png"

# Favicon
convert "$SOURCE" -resize 32x32 "$OUTPUT_DIR/favicon-32x32.png"
convert "$SOURCE" -resize 16x16 "$OUTPUT_DIR/favicon-16x16.png"

# Create ICO file with multiple sizes
convert "$SOURCE" -resize 16x16 -resize 32x32 -resize 48x48 "$OUTPUT_DIR/favicon.ico"

echo "Icons generated successfully in $OUTPUT_DIR"
echo ""
echo "Generated files:"
ls -la "$OUTPUT_DIR"/logo-*.png "$OUTPUT_DIR"/favicon* "$OUTPUT_DIR"/apple-touch-icon.png 2>/dev/null | awk '{print "  " $9 " (" $5 " bytes)"}'