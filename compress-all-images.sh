#!/bin/bash

# Script de compression de toutes les images du projet BriveFood
# Utilise sips (macOS) pour redimensionner et compresser les images

echo "🖼️  Compression des images BriveFood"
echo "======================================"

# Compteurs
total=0
compressed=0
skipped=0
errors=0

# Taille maximale pour les images produits
MAX_WIDTH=800
MAX_HEIGHT=800

# Taille maximale pour les icônes
ICON_MAX=512

# Fonction pour obtenir la taille du fichier en KB
get_size_kb() {
    local size=$(stat -f%z "$1" 2>/dev/null || echo 0)
    echo $((size / 1024))
}

# Fonction pour compresser une image
compress_image() {
    local file="$1"
    local max_w="$2"
    local max_h="$3"

    # Obtenir les dimensions actuelles
    local width=$(sips -g pixelWidth "$file" 2>/dev/null | tail -1 | awk '{print $2}')
    local height=$(sips -g pixelHeight "$file" 2>/dev/null | tail -1 | awk '{print $2}')

    if [ -z "$width" ] || [ -z "$height" ]; then
        echo "  ⚠️  Impossible de lire: $file"
        return 1
    fi

    local size_before=$(get_size_kb "$file")
    local needs_resize=false

    # Calculer les nouvelles dimensions si nécessaire
    if [ "$width" -gt "$max_w" ] || [ "$height" -gt "$max_h" ]; then
        needs_resize=true

        # Calculer le ratio pour garder les proportions
        local ratio_w=$(echo "scale=4; $max_w / $width" | bc)
        local ratio_h=$(echo "scale=4; $max_h / $height" | bc)

        # Prendre le plus petit ratio
        if (( $(echo "$ratio_w < $ratio_h" | bc -l) )); then
            local new_width=$max_w
            local new_height=$(echo "scale=0; $height * $ratio_w / 1" | bc)
        else
            local new_height=$max_h
            local new_width=$(echo "scale=0; $width * $ratio_h / 1" | bc)
        fi

        # Redimensionner
        sips --resampleHeightWidth "$new_height" "$new_width" "$file" >/dev/null 2>&1
    fi

    # Pour les PNG, convertir en PNG optimisé
    if [[ "$file" == *.png ]]; then
        # Réenregistrer pour optimiser
        sips -s format png "$file" --out "$file" >/dev/null 2>&1
    fi

    # Pour les JPG, ajuster la qualité
    if [[ "$file" == *.jpg ]] || [[ "$file" == *.jpeg ]]; then
        sips -s formatOptions 80 "$file" --out "$file" >/dev/null 2>&1
    fi

    local size_after=$(get_size_kb "$file")
    local saved=$((size_before - size_after))

    if [ "$saved" -gt 0 ] || [ "$needs_resize" = true ]; then
        echo "  ✅ $(basename "$file"): ${size_before}KB → ${size_after}KB (-${saved}KB)"
        return 0
    else
        return 2
    fi
}

echo ""
echo "📁 Traitement des images produits..."
echo ""

# Traiter toutes les images dans assets/images (sauf icônes)
while IFS= read -r -d '' file; do
    ((total++))

    # Vérifier si c'est une icône ou splash
    if [[ "$file" == *"icon"* ]] || [[ "$file" == *"splash"* ]] || [[ "$file" == *"favicon"* ]]; then
        result=$(compress_image "$file" $ICON_MAX $ICON_MAX)
    else
        result=$(compress_image "$file" $MAX_WIDTH $MAX_HEIGHT)
    fi

    case $? in
        0) ((compressed++)) ;;
        1) ((errors++)) ;;
        2) ((skipped++)) ;;
    esac

done < <(find assets/images -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) -print0 2>/dev/null)

echo ""
echo "======================================"
echo "📊 Résumé de la compression:"
echo "  • Total d'images: $total"
echo "  • Compressées: $compressed"
echo "  • Déjà optimisées: $skipped"
echo "  • Erreurs: $errors"
echo "======================================"
echo "✅ Compression terminée!"
