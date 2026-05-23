# MedSearch — Générer une APK Android

L'application web (PWA) est encapsulée avec **Capacitor** dans une APK installable sur téléphone Android.

## Prérequis (une seule fois)

1. **Node.js** 18+ (déjà installé)
2. **Android Studio** : [developer.android.com/studio](https://developer.android.com/studio)
   - Lors de l'installation, cocher **Android SDK** et **Android SDK Platform-Tools**
3. **JDK 17** (fourni avec Android Studio)
4. Variables d'environnement Windows (PowerShell admin ou profil utilisateur) :

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
```

Redémarrer le terminal après configuration.

## Commandes rapides

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Créer le projet Android (première fois uniquement)
npx cap add android

# 3. Build web + copie vers Android
npm run build:android

# 4. Icônes et splash (première fois ou après changement d'icône)
#    Les sources sont dans assets/icon-only.png et assets/splash.png
npm run android:assets

# 5. Ouvrir dans Android Studio (recommandé pour la première compilation)
npm run android:open
```

Dans Android Studio : **Build → Build Bundle(s) / APK(s) → Build APK(s)**.

## Script automatique (Windows)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/build-apk.ps1
```

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
