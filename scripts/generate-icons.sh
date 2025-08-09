#!/bin/bash

echo "🎨 Generating PWA icons from logo.png..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "⚠️  ImageMagick is not installed. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y imagemagick
    elif command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "❌ Please install ImageMagick manually"
        exit 1
    fi
fi

# Source logo
SOURCE="public/logo.png"

# Check if source exists
if [ ! -f "$SOURCE" ]; then
    echo "❌ Source logo not found at $SOURCE"
    echo "Using favicon.ico as fallback..."
    
    # Convert favicon to PNG first
    convert public/favicon.ico[0] public/logo-temp.png
    SOURCE="public/logo-temp.png"
fi

# Create all required sizes
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    output="public/images/logo-${size}.png"
    echo "📐 Creating ${size}x${size} icon..."
    
    # Use ImageMagick to resize
    if command -v convert &> /dev/null; then
        convert "$SOURCE" -resize ${size}x${size} -background transparent -gravity center -extent ${size}x${size} "$output"
    else
        # Fallback: just copy the original
        cp "$SOURCE" "$output"
    fi
done

# Create shortcut icons
echo "🔗 Creating shortcut icons..."
shortcuts=("services" "book" "contact" "account")

for shortcut in "${shortcuts[@]}"; do
    output="public/images/shortcut-${shortcut}.png"
    # For now, use the 96x96 logo
    cp "public/images/logo-96.png" "$output"
done

# Create screenshot placeholders
echo "📸 Creating screenshot placeholders..."
# Desktop screenshot
convert -size 1280x720 xc:'#3B82F6' -gravity center -fill white -pointsize 60 -annotate +0+0 'RoK Services' public/images/screenshot-1.png

# Mobile screenshots
convert -size 360x640 xc:'#3B82F6' -gravity center -fill white -pointsize 30 -annotate +0+0 'RoK Services\nMobile' public/images/screenshot-mobile-1.png
convert -size 360x640 xc:'#3B82F6' -gravity center -fill white -pointsize 30 -annotate +0+0 'RoK Services\nBooking' public/images/screenshot-mobile-2.png

# Clean up temp file if created
[ -f "public/logo-temp.png" ] && rm "public/logo-temp.png"

echo "✅ Icon generation complete!"
echo ""
echo "📁 Generated files:"
ls -la public/images/