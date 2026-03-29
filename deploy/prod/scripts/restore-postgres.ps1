param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile,
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$EnvFile = "./deploy/prod/.env.production"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
  throw "Backup file not found: $BackupFile"
}

Get-Content $BackupFile | docker compose -f $ComposeFile --env-file $EnvFile exec -T db sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
Write-Output "Restore completed from $BackupFile"
