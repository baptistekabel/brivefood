# Site vitrine Brive Food

Site statique, sans build ni dépendance : HTML + CSS + JS vanilla.
Il est totalement indépendant de l'application Expo (aucun import croisé).

## Lancer en local

```bash
cd website
python3 -m http.server 8080
# puis http://localhost:8080
```

(ouvrir `index.html` directement fonctionne aussi, mais la vidéo et la carte
Google Maps se comportent mieux via un serveur.)

## Structure

```
website/
├── index.html              Page d'accueil (hero vidéo, carte, compose, formules, restaurant, horaires, commander, application, FAQ)
├── mentions-legales.html
├── confidentialite.html
├── cgv.html
├── site.webmanifest · robots.txt · sitemap.xml
└── assets/
    ├── css/style.css       Design system + sections + animations
    ├── js/main.js          Header, menu mobile, reveal au scroll, statut ouvert/fermé, FAQ
    ├── img/                Produits (optimisés depuis assets/images de l'app), logo, favicons, og-image
    └── video/hero.mp4      VIDÉO DE TEST (Mixkit, libre de droits) + hero-poster.jpg
```

## À faire avant la mise en ligne

1. **Vidéo du hero** : remplacer `assets/video/hero.mp4` par la vraie vidéo du restaurant.
   Format conseillé : 1920×1080 (ou 1280×720), 10 à 20 s en boucle, sans son, H.264, < 8 Mo.
   Puis régénérer le poster :
   `ffmpeg -ss 2 -i assets/video/hero.mp4 -frames:v 1 -q:v 3 assets/video/hero-poster.jpg`
2. **Liens App Store / Google Play** : déjà renseignés dans la section « L'application »
   (App Store id 6752569193, Google Play `com.brivefood.app`). Vérifier que la fiche Google Play est bien publiée.
3. **Nom de domaine** : remplacer `https://www.brivefood.fr/` (canonical, og:url, sitemap, robots) si le domaine diffère.
4. **Mentions légales** : compléter l'hébergeur (`mentions-legales.html`, section 2) et le médiateur de la consommation (`cgv.html`, section 9).
   Vérifier l'adresse e-mail de contact (`contact@brivefood.fr` est un exemple).
5. **Vue 3D (Street View)** : la carte utilise l'API Google Maps Embed avec la clé du site Brunch House.
   Dans Google Cloud › Identifiants, autoriser le domaine du site Brive Food sur cette clé (ou créer une clé dédiée)
   et la remplacer dans `index.html` (iframe « Vue 3D »).
6. **Pop-up d'accueil** : s'affiche à chaque arrivée sur l'accueil (0,9 s après le chargement). Pour ne l'afficher
   qu'une fois par session, voir `main.js`, bloc « Pop-up d'accueil ».
7. **Lien Uber Eats** : ajouter l'URL de la boutique si souhaité (section « Commander »).

## Données utilisées (issues de l'app et des registres publics)

- Adresse : 23 bis avenue du Président Roosevelt, 19100 Brive-la-Gaillarde (45.157566, 1.524584)
- Téléphone : 07 66 88 16 97
- Horaires : 11h00 – 01h50, fermé le mardi (le statut « ouvert / fermé » est calculé en direct, heure de Paris)
- Société : BRIVE FOOD SARL, capital 10 000 €, RCS Brive 887 843 522, SIRET 887 843 522 00046, TVA FR12887843522
- Prix : ceux de `src/data/products.js` au 29/09/2026

## Typographie

Une seule famille sur tout le site : Inter (Google Fonts), graisses 400 à 800.
Les titres sont en 700 avec un interlettrage serré, le texte courant en 400.

## Palette

Fond violet profond (`#120a1c`) avec halos rose/violet, accents rose → violet (`#ec4899` → `#8b5cf6`) comme l'application.
La section « L'application » est en dégradé plein rose → violet avec un mockup de téléphone en CSS pur
(pas d'image : les cartes reprennent les vraies photos produits).

## Motion

Règles appliquées (d'après les skills d'Emil Kowalski) :
`ease-out` fort `cubic-bezier(0.23,1,0.32,1)` sur les entrées, `ease-in-out` `cubic-bezier(0.77,0,0.175,1)` sur le mouvement,
`linear` sur le marquee, `transform`/`opacity` uniquement, `scale(0.97)` au press, hover gaté par `(hover:hover) and (pointer:fine)`,
révélation au scroll une seule fois, `prefers-reduced-motion` respecté (vidéo en pause, pas de parallaxe).
