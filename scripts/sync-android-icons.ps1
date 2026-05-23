# Copie assets/icon-only.png vers toutes les densites Android (launcher + foreground).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$src = Join-Path $Root "assets\icon-only.png"
if (-not (Test-Path $src)) { throw "Manquant: assets/icon-only.png" }

$densities = @("mipmap-ldpi", "mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$res = Join-Path $Root "android\app\src\main\res"

foreach ($d in $densities) {
    $dir = Join-Path $res $d
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Copy-Item $src (Join-Path $dir "ic_launcher.png") -Force
    Copy-Item $src (Join-Path $dir "ic_launcher_round.png") -Force
    if ($d -ne "mipmap-ldpi") {
        Copy-Item $src (Join-Path $dir "ic_launcher_foreground.png") -Force
    }
}

Write-Host "Icones Android synchronisees depuis assets/icon-only.png" -ForegroundColor Green
