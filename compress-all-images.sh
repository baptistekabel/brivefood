#!/bin/bash

# BRIVEFOOD - Script de compression d'images simple
# Usage: ./compress-all-images.sh [qualite] [taille_max]
# Exemple: ./compress-all-images.sh 75 800

QUALITY=${1:-75}
MAX_SIZE=${2:-800}

echo "==================================="
echo "COMPRESSION D'IMAGES BRIVEFOOD"
echo "==================================="
echo "Qualite JPEG: ${QUALITY}%"
echo "Taille max: ${MAX_SIZE}px"
echo ""

cd "$(dirname "$0")"

# Compteurs
count=0

# Trouver toutes les images
for img in $(find assets/images -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) ! -name "*.backup"); do
    # Taille originale
    orig_size=$(stat -f%z "$img" 2>/dev/null)
    
    # Creer une backup si elle n'existe pas
    if [ ! -f "${img}.backup" ]; then
        cp "$img" "${img}.backup"
    fi
    
    # Redimensionner avec sips (macOS)
    sips --resampleHeightWidthMax $MAX_SIZE "$img" >/dev/null 2>&1
    
    # Compresser (JPEG uniquement)
    ext="${img##*.}"
    if [[ "$ext" == "jpg" || "$ext" == "jpeg" ]]; then
        sips -s formatOptions $QUALITY "$img" >/dev/null 2>&1
    fi
    
    # Nouvelle taille
    new_size=$(stat -f%z "$img" 2>/dev/null)
    
    # Calcul des economies
    if [ "$orig_size" -gt 0 ]; then
        savings=$(( (orig_size - new_size) * 100 / orig_size ))
        orig_kb=$((orig_size / 1024))
        new_kb=$((new_size / 1024))
        echo "$(basename "$img"): ${orig_kb}KB -> ${new_kb}KB (-${savings}%)"
        count=$((count + 1))
    fi
done

echo ""
echo "==================================="
echo "$count images compressees !"
echo "==================================="
echo ""
echo "Pour supprimer les backups:"
echo "  find assets/images -name '*.backup' -delete"
