#!/bin/bash

# Script to generate thumbnails for Jekyll photo gallery
# Usage: ./generate-thumbnails.sh <album-name>
# Example: ./generate-thumbnails.sh italy

if [ -z "$1" ]; then
  echo "Please provide an album name"
  echo "Usage: ./generate-thumbnails.sh <album-name>"
  exit 1
fi

ALBUM=$1
SOURCE_DIR="assets/images/photography/$ALBUM"
THUMB_DIR="$SOURCE_DIR/thumbnails"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Source directory $SOURCE_DIR does not exist"
  exit 1
fi

# Create thumbnails directory if it doesn't exist
mkdir -p "$THUMB_DIR"

# Generate thumbnails
echo "Generating thumbnails for $ALBUM..."

# Process each image
for img in "$SOURCE_DIR"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
  # Skip if not a file (handles case when no matches are found)
  [ -f "$img" ] || continue
  
  # Skip if in thumbnails directory
  if [[ "$img" == *"/thumbnails/"* ]]; then
    continue
  fi
  
  # Get filename without path
  filename=$(basename "$img")
  
  # Path for thumbnail
  thumb="$THUMB_DIR/$filename"
  
  # Skip if thumbnail already exists and is newer than the source
  if [ -f "$thumb" ] && [ "$thumb" -nt "$img" ]; then
    echo "Skipping $filename (thumbnail already exists)"
    continue
  fi
  
  echo "Processing $filename..."
  
  # Generate thumbnail (300px width, preserving aspect ratio)
  # For large panoramas, use different settings to avoid memory issues
  filesize=$(stat -c%s "$img")
  if [ $filesize -gt 5000000 ]; then
    echo "  Large image detected ($filesize bytes), using optimized settings"
    convert -limit memory 1GB -limit area 1GB -define jpeg:size=600x400 \
      "$img" -strip -thumbnail 300x200 -quality 70 "$thumb"
  else
    convert "$img" -resize 300x200^ -gravity center -extent 300x200 "$thumb"
  fi
  
  if [ $? -eq 0 ]; then
    echo "  Created thumbnail: $thumb"
  else
    echo "  Error creating thumbnail for $img"
  fi
done

echo "Thumbnail generation complete!"
echo "Generated thumbnails in $THUMB_DIR"