param(
  [string]$LanIp = "192.168.1.59"
)

$ErrorActionPreference = "Stop"
$target = "deploy/prod/certs/lan"
New-Item -ItemType Directory -Force -Path $target | Out-Null

$dockerMount = (Resolve-Path $target).Path.Replace('\', '/').Replace(':', '')
$dockerVolume = "/${dockerMount}:/certs"

docker run --rm -v "${dockerVolume}" alpine:3.20 sh -lc @"
apk add --no-cache openssl >/dev/null
cat >/certs/rootCA.cnf <<'EOF'
[req]
distinguished_name=req_distinguished_name
x509_extensions=v3_ca
prompt=no

[req_distinguished_name]
CN=MetaFarm LAN Root CA

[v3_ca]
basicConstraints=critical,CA:true
keyUsage=critical,keyCertSign,cRLSign
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer
EOF

cat >/certs/server.cnf <<EOF
[req]
distinguished_name=req_distinguished_name
req_extensions=v3_req
prompt=no

[req_distinguished_name]
CN=$LanIp

[v3_req]
basicConstraints=CA:false
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=@alt_names

[alt_names]
IP.1=$LanIp
IP.2=127.0.0.1
DNS.1=localhost
EOF

openssl genrsa -out /certs/rootCA.key 4096
openssl req -x509 -new -nodes -key /certs/rootCA.key -sha256 -days 3650 -out /certs/rootCA.crt -config /certs/rootCA.cnf
openssl genrsa -out /certs/privkey.pem 2048
openssl req -new -key /certs/privkey.pem -out /certs/server.csr -config /certs/server.cnf
openssl x509 -req -in /certs/server.csr -CA /certs/rootCA.crt -CAkey /certs/rootCA.key -CAcreateserial -out /certs/server.crt -days 825 -sha256 -extensions v3_req -extfile /certs/server.cnf
cat /certs/server.crt /certs/rootCA.crt >/certs/fullchain.pem
rm -f /certs/server.csr /certs/rootCA.cnf /certs/server.cnf /certs/rootCA.srl
"@

Write-Output "Generated LAN CA and certificate for $LanIp"
Write-Output "Trust this file on mobile devices: $target/rootCA.crt"
