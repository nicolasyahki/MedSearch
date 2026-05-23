# Workflows GitHub

| Workflow | Usage |
|----------|--------|
| **Build Android APK** | Génère `app-debug.apk` (artefact **MedSearch-debug-apk**) |

Commandes utilisées : `npm run build` → `npx cap sync android` → `./gradlew assembleDebug`.

**Interdit en CI :** `npx cap build android` (nécessite Android Studio local).
