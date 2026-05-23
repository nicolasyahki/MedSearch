# Icône MedSearch

## Fichier source unique

Remplacez **`assets/icon-only.png`** (1024×1024 recommandé, fond inclus).

Puis :

```bash
npm run android:assets
```

Cela met à jour : Android (APK), `public/icon-192x192.png`, `public/icon-512x512.png`, splash.

## Nouvelle APK

1. Commit + push → GitHub Actions **Build Android APK**
2. **Désinstaller** l’ancienne app sur le téléphone
3. Installer la nouvelle APK (versionCode incrémenté)

Sans désinstallation, le lanceur Android peut garder l’ancienne icône en cache.
