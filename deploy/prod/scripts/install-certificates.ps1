param(
  [Parameter(Mandatory = $true)]
  [string]$AppFullchain,
  [Parameter(Mandatory = $true)]
  [string]$AppPrivkey,
  [Parameter(Mandatory = $true)]
  [string]$ApiFullchain,
  [Parameter(Mandatory = $true)]
  [string]$ApiPrivkey
)

$ErrorActionPreference = "Stop"

$appTarget = "deploy/prod/certs/app"
$apiTarget = "deploy/prod/certs/api"

New-Item -ItemType Directory -Force -Path $appTarget | Out-Null
New-Item -ItemType Directory -Force -Path $apiTarget | Out-Null

Copy-Item $AppFullchain (Join-Path $appTarget "fullchain.pem") -Force
Copy-Item $AppPrivkey (Join-Path $appTarget "privkey.pem") -Force
Copy-Item $ApiFullchain (Join-Path $apiTarget "fullchain.pem") -Force
Copy-Item $ApiPrivkey (Join-Path $apiTarget "privkey.pem") -Force

Write-Output "Certificates installed into deploy/prod/certs"
