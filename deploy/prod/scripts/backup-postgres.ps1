param(
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$EnvFile = "./deploy/prod/.env.production",
  [string]$OutputDir = "./deploy/prod/backups",
  [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputPath = Join-Path $OutputDir "metafarm-$timestamp.sql"

docker compose -f $ComposeFile --env-file $EnvFile exec -T db sh -lc 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB"' | Set-Content -Path $outputPath -Encoding UTF8

Get-ChildItem $OutputDir -Filter "*.sql" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } |
  Remove-Item -Force

Write-Output "Backup written to $outputPath"
