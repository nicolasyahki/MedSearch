# MedSearch — Générer une APK Android

L'application web (PWA) est encapsulée avec **Capacitor** dans une APK installable sur téléphone Android.

**Vous n'avez pas besoin d'ouvrir Android Studio.** Deux méthodes :

| Méthode | Android Studio ? | Où ça compile |
|---------|------------------|---------------|
| **GitHub Actions** (recommandé) | Non | Dans le cloud GitHub |
| **Terminal local** | Non (juste SDK + Java) | Votre PC, dans Cursor |

---

## Méthode 1 — GitHub Actions (sans installer le SDK)

1. Allez sur [github.com/nicolasyahki/MedSearch/actions](https://github.com/nicolasyahki/MedSearch/actions)
2. Workflow **Build Android APK** → **Run workflow**
3. Attendez ~5 min (coche verte)
4. Téléchargez l'artefact **medsearch-debug-apk** → fichier `app-debug.apk`
5. Copiez sur le téléphone et installez

Le workflow se lance aussi automatiquement à chaque push sur `main` (si fichiers app/android modifiés).

---

## Méthode 2 — Terminal local (Cursor / PowerShell)

### Prérequis (une seule fois)

1. **Node.js** 18+ (déjà installé)
2. **Android SDK + JDK 17** — le plus simple : installer [Android Studio](https://developer.android.com/studio) **sans jamais l'ouvrir** (il installe le SDK et Java en arrière-plan)
3. **JDK 17** (fourni avec Android Studio)
4. Variables d'environnement Windows (PowerShell admin ou profil utilisateur) :

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

Redémarrer le terminal après configuration.

## Commandes rapides (terminal)

```powershell
npm install
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1
```

Ou manuellement :

```bash
npm run build:android
cd android
.\gradlew.bat assembleDebug    # Windows
# ./gradlew assembleDebug      # Mac/Linux
```

Icônes (optionnel) : `npm run android:assets` — sources dans `assets/icon-only.png`.

## Android Studio (optionnel)

Uniquement si vous préférez une interface graphique : `npm run android:open` puis **Build → Build APK(s)**.
Ce n'est **pas obligatoire**.

APK debug générée :

`android/app/build/outputs/apk/debug/app-debug.apk`

## Installer sur le téléphone

1. Copier `app-debug.apk` sur le téléphone (USB, email, Drive…)
2. Ouvrir le fichier → autoriser **Sources inconnues** si demandé
3. Installer **MedSearch**

L'API backend reste `https://Nicolas60.pythonanywhere.com/api` (connexion Internet requise pour inscription / sync).

## APK de production (Play Store ou distribution signée)

Dans Android Studio :

1. **Build → Generate Signed Bundle / APK**
2. Créer une clé de signature (keystore) — à conserver précieusement
3. Choisir **APK** ou **Android App Bundle (AAB)**

## Mise à jour de l'app

Après modification du code React :

```bash
npm run build:android
# Puis recompiler l'APK (script ou Android Studio)
```

## Dépannage

| Problème | Solution |
|----------|----------|
| `ANDROID_HOME` introuvable | Installer Android Studio, définir la variable |
| Écran blanc au lancement | `npm run build:android` puis `npx cap sync android` |
| Sync ne fonctionne pas | Vérifier Internet + connexion PIN en ligne |
| Gradle échoue | Ouvrir le projet dans Android Studio et laisser télécharger les dépendances |
