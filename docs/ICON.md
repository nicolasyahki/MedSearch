# Icône MedSearch

## Fichier source unique

Remplacez **`assets/icon-only.png`** (1024×1024 recommandé, fond inclus).

Puis :

```bash
npm run android:icons
```

Cela met à jour les icônes **launcher** Android (`ic_launcher.png` dans chaque densité).

Pour PWA : copiez aussi vers `public/icon-192x192.png` et `public/icon-512x512.png`.

## Nouvelle APK

1. Commit + push → GitHub Actions **Build Android APK**
2. **Désinstaller** l’ancienne app sur le téléphone
3. Installer la nouvelle APK (versionCode incrémenté)

Sans désinstallation, le lanceur Android peut garder l’ancienne icône en cache.
