# Expose MedSearch sur Internet (lien partageable vers n'importe quel telephone)
# Prerequis : dans un AUTRE terminal, lancer :  npm run preview -- --host

param(
  [int]$Port = 4174
)

Write-Host ""
Write-Host "=== MedSearch - Lien public (tous telephones) ===" -ForegroundColor Green
Write-Host ""
Write-Host "Assurez-vous que 'npm run preview -- --host' tourne sur le port $Port"
Write-Host ""
Write-Host "Demarrage du tunnel (Cloudflare)..." -ForegroundColor Yellow
Write-Host "Copiez l'URL https://....trycloudflare.com affichee ci-dessous" -ForegroundColor Yellow
Write-Host "et envoyez-la par WhatsApp / SMS a n'importe quel telephone."
Write-Host ""
Write-Host "Note : le PC doit rester allume. Pour un lien permanent, deployez sur Internet." -ForegroundColor DarkGray
Write-Host ""

npx --yes cloudflared tunnel --url "http://127.0.0.1:$Port"
