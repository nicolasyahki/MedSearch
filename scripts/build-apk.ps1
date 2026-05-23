# Build MedSearch APK (debug) — terminal uniquement, SANS ouvrir Android Studio.
# Prérequis : JDK 17 + Android SDK (installés par Android Studio ou SDK seul).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "=== MedSearch — Build APK (terminal) ===" -ForegroundColor Cyan

# Détection automatique SDK / Java (Android Studio installé mais IDE non lancé)
if (-not $env:ANDROID_HOME -and (Test-Path "$env:LOCALAPPDATA\Android\Sdk")) {
    $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
    $env:Path = "$env:ANDROID_HOME\platform-tools;$env:Path"
    Write-Host "ANDROID_HOME detecte: $env:ANDROID_HOME" -ForegroundColor Gray
}

$studioJbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not $env:JAVA_HOME -and (Test-Path $studioJbr)) {
    $env:JAVA_HOME = $studioJbr
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
    Write-Host "JAVA_HOME detecte (Android Studio JBR): $env:JAVA_HOME" -ForegroundColor Gray
}

if (-not $env:ANDROID_HOME) {
    Write-Host @"

ANDROID_HOME introuvable. Deux options :

  A) Terminal local : installer le SDK (Android Studio suffit, sans l'ouvrir)
     puis relancer ce script.

  B) Sans rien installer : GitHub Actions
     GitHub > repo MedSearch > Actions > "Build Android APK" > Run workflow
     Telechargez l'artefact medsearch-debug-apk.

"@ -ForegroundColor Yellow
}

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "Java (JDK 17) introuvable. Installez Android Studio ou JDK 17." -ForegroundColor Red
    exit 1
}

Write-Host "`n1/2 Build web (Vite) + sync Capacitor..." -ForegroundColor Green
npm run build:android

Write-Host "`n2/2 Compilation Gradle (assembleDebug)..." -ForegroundColor Green
Set-Location android
if (-not (Test-Path ".\gradlew.bat")) {
    throw "Dossier android/ absent. Lancez: npx cap add android"
}

.\gradlew.bat assembleDebug

$apk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $full = (Resolve-Path $apk).Path
    Write-Host "`nAPK generee:" -ForegroundColor Green
    Write-Host $full
    Write-Host "`nCopiez sur le telephone et installez (sources inconnues autorisees)." -ForegroundColor Cyan
} else {
    Write-Host "APK introuvable." -ForegroundColor Red
    exit 1
}
