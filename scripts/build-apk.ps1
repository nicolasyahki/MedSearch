# Build MedSearch APK (debug) — nécessite Android SDK + JDK 17+
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "=== MedSearch — Build APK ===" -ForegroundColor Cyan

if (-not $env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME non defini. Installez Android Studio puis definissez:" -ForegroundColor Yellow
    Write-Host '  $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"' -ForegroundColor Gray
}

Write-Host "`n1/3 Build web (Vite) + sync Capacitor..." -ForegroundColor Green
npm run build:android

Write-Host "`n2/3 Generation icones Android (optionnel)..." -ForegroundColor Green
npm run android:assets 2>$null

Write-Host "`n3/3 Compilation Gradle (assembleDebug)..." -ForegroundColor Green
Set-Location android
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat assembleDebug
} else {
    throw "Dossier android/ absent. Lancez: npx cap add android"
}

$apk = "app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apk) {
    $full = (Resolve-Path $apk).Path
    Write-Host "`nAPK genere:" -ForegroundColor Green
    Write-Host $full
    Write-Host "`nCopiez ce fichier sur le telephone et installez-le (autoriser sources inconnues)." -ForegroundColor Cyan
} else {
    Write-Host "APK introuvable. Verifiez Android Studio / SDK." -ForegroundColor Red
    exit 1
}
