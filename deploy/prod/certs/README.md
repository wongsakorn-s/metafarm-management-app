วาง certificate และ private key สำหรับ production ในโฟลเดอร์นี้

โครงสร้างที่ nginx คาดหวัง:

- `deploy/prod/certs/app/fullchain.pem`
- `deploy/prod/certs/app/privkey.pem`
- `deploy/prod/certs/api/fullchain.pem`
- `deploy/prod/certs/api/privkey.pem`

สำหรับ local verification สามารถใช้ self-signed certificate ได้
