# Copie assets/icon-only.png vers TOUTES les densites launcher Android.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$src = Join-Path $Root "assets\icon-only.png"
if (-not (Test-Path $src)) { throw "Manquant: assets/icon-only.png" }

# Source 512px pour meilleure qualite sur le telephone
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($src)
if ($img.Width -lt 256) {
    $hq = Join-Path $Root "assets\icon-hq.png"
    $bmp = New-Object System.Drawing.Bitmap 512, 512
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, 512, 512)
    $bmp.Save($hq, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    $src = $hq
    Write-Host "Source agrandie 512x512: assets/icon-hq.png"
} else {
    $img.Dispose()
}

$densities = @("mipmap-ldpi", "mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$res = Join-Path $Root "android\app\src\main\res"

foreach ($d in $densities) {
    $dir = Join-Path $res $d
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    Copy-Item $src (Join-Path $dir "ic_launcher.png") -Force
    Copy-Item $src (Join-Path $dir "ic_launcher_round.png") -Force
}

Write-Host "Icones launcher copiees (sans adaptive XML casse)." -ForegroundColor Green
