# ใช้ Official Image ของ Bun เวอร์ชันล่าสุด
FROM oven/bun:latest

WORKDIR /app

# คัดลอกแค่ package.json (และ bun.lockb ถ้ามี) มาก่อน
COPY package.json bun.lock* ./

# ติดตั้ง dependencies ผ่าน Bun (เร็วกว่า npm มาก)
RUN bun install

# คัดลอกโค้ดทั้งหมด
COPY . .

# สั่งรัน Vite
CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0"]
