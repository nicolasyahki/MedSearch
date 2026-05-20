$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
  $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notlike '*Loopback*'
} | Select-Object -First 1).IPAddress

if (-not $ip) { Write-Host "Pas de Wi-Fi detecte."; exit 1 }

Write-Host ""
Write-Host "URL telephone : http://${ip}:4173/"
Write-Host ""
