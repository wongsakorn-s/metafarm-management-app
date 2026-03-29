param(
  [string]$AppDomain = "app.example.com",
  [string]$ApiDomain = "api.example.com"
)

$ErrorActionPreference = "Stop"

docker compose -f docker-compose.prod.yml --env-file ./deploy/prod/.env.production ps
curl.exe -s -I --noproxy "*" "http://127.0.0.1/" | Write-Output
curl.exe -s -D - -o NUL -k --noproxy "*" --resolve "${AppDomain}:443:127.0.0.1" "https://${AppDomain}/login" | Write-Output
curl.exe -s -D - -k --noproxy "*" --resolve "${ApiDomain}:443:127.0.0.1" "https://${ApiDomain}/health/live" | Write-Output
