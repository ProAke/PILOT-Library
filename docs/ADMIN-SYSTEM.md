# PILOT Library — สถาปัตยกรรมระบบจัดการ (Operations) + แนะนำการวางระบบ

เอกสารนี้ตอบโจทย์: **"ระบบจัดการผ่านมือถือทำแยก Front · ดาต้าเก็บใน Google Drive ·
Operation เกินบนโฮสติ้ง"** — สรุปเป็นสถาปัตยกรรมที่ติดตั้งแล้วใน repo นี้
พร้อมเหตุผลและทางเลือกสำรอง

---

## 1. ภาพรวมสถาปัตยกรรม

```
┌────────────────────────────┐        ┌─────────────────────────────┐
│  FRONT #1 — หน้าร้าน (ลูกค้า) │        │  FRONT #2 — PILOT OPS (หลังบ้าน) │
│  Next.js + PWA + Capacitor │        │  Next.js แอปแยกในโฟลเดอร์ admin/ │
│  iOS / Android / เว็บมือถือ  │        │  mobile-first · login ด้วย passcode │
└──────────────┬─────────────┘        └──────────────┬──────────────┘
               │ อ่าน (ISR/CDN cache 10 นาที)          │ เขียน/อ่าน (real-time)
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                 OPERATION LAYER — serverless บนโฮสติ้ง            │
│  Storefront: /api/products, /api/products/[slug] (อ่านอย่างเดียว)  │
│  Ops console: /api/session, /api/products (PATCH), /api/status    │
│  (Vercel / Cloudflare / Node host — อยู่คนละ deploy กับหน้าร้านยิ่งดี) │
└──────────────┬───────────────────────────────────┬───────────────┘
               ▼                                   ▼
┌─────────────────────────────┐   ┌────────────────────────────────┐
│  GOOGLE DRIVE — คลังรูปสินค้า  │   │  GOOGLE SHEETS — ฐานข้อมูลกลาง   │
│  โฟลเดอร์ "Pilot-library"     │   │  ชีตเดียว: slug|name|price|stock| │
│  (26 รูป + เพิ่มรูปใหม่ได้เอง)  │   │  status|category|updated_at     │
└─────────────────────────────┘   └────────────────────────────────┘
```

### ทำไมแยกแบบนี้ถึงถูก
| ชั้น | เทคโนโลยี | เหตุผล |
| --- | --- | --- |
| Front ลูกค้า | แอปเดิม (PWA/Capacitor) | โหลดเร็ว ทำงานออฟไลน์ได้ ไม่ควรมีโค้ดหลังบ้านปน |
| Front จัดการ | `admin/` (โปรเจกต์แยก) | คนละผู้ใช้งาน คนละดีไซน์ คนละ deploy — พังไม่ลากหน้าร้านลงด้วย |
| ดาต้า | Drive + Sheets | เจ้าของร้านใช้ Drive อยู่แล้ว เปิดชีตแก้เองได้ทันที ไม่ต้องรอ dev |
| Operation | serverless บนโฮสติ้ง | เก็บกุญแจ Google ฝั่งเซิร์ฟเวอร์เท่านั้น + แคช/-rate-limit ได้ |

---

## 2. สิ่งที่มีใน repo แล้ว

### Front จัดการ (`admin/`) — mobile-first
- หน้า login ด้วย passcode (`ADMIN_PASSCODE`) → token HMAC ใน cookie httpOnly
  (มี fallback header `x-ops-token` สำหรับ environment ที่บล็อก cookie)
- Dashboard: ค้นหา SKU, แก้ **ราคา / สต็อก / สถานะ(ขายอยู่-ซ่อน)** แล้วกดบันทึก
  เขียนลงชีตจริงทันที · ป้ายบอกโหมด `google sheets` / `demo`
- ลิงก์ปฏิบัติการ: เปิดชีต, เปิดโฟลเดอร์ Drive, เปิดหน้าเดโมหน้าร้าน
- รันคนละพอร์ต/คนละโฮสต์: `npm run dev` ใน `admin/` = พอร์ต **3001**

### ฐานข้อมูลกลาง (Google Sheets ใน Drive)
หัวคอลัมน์แถวแรก: `slug | name | price | stock | status | category | updated_at`
- `price` เว้นว่าง = "สอบถามราคา" · `status` = `active` | `hidden`
- หน้าร้านอ่านชีตอัตโนมัติ (แคช 60 วิ) → แก้ราคาในชีต/ใน OPS แล้วหน้าร้าน+แอปมือถืออัปเดตเอง
- สินค้า `hidden` จะหายจากหน้าร้านทันทีโดยไม่ต้อง deploy

### Operation layer
- `lib/sheet.ts` (storefront) และ `admin/lib/sheet.ts` — client เดียวกัน:
  service-account JWT (RS256) → Sheets API read/write โดยไม่มี dependency เพิ่ม
- โหมด **demo**: ถ้ายังไม่ตั้ง credentials คอนโซลจะดึงแคตตาล็อกจริงจาก API หน้าร้าน
  มาให้ลอง UI และบันทึกชั่วคราวลง `admin/.data/` (ใช้จริงต้องต่อชีต)

---

## 3. ขั้นตอนต่อ Google Sheets/Drive (ครั้งเดียว ~10 นาที)

1. Google Cloud Console → สร้างโปรเจกต์ → เปิด API: **Google Sheets API**, **Google Drive API**
2. Credentials → Create → **Service account** (ไม่ต้องให้ role ระดับโปรเจกต์)
   → Keys → Add key → JSON → ได้ไฟล์ `service-account.json`
3. สร้างชีตในโฟลเดอร์ Drive `Pilot-library` วางหัวคอลัมน์ 7 ช่องตามข้างบน
   เติมแถวสินค้า (หรือคัดลอกจาก `data/products.ts`)
4. แชร์ชีต **และ** โฟลเดอร์ Drive ให้อีเมล service account เป็น **Writer**
5. ตั้ง env บนโฮสติ้งของ OPS console:
   ```
   ADMIN_PASSCODE=<รหัสผู้ดูแล>
   GOOGLE_SERVICE_ACCOUNT_JSON=<json บรรทัดเดียว>
   PRODUCTS_SHEET_ID=<id จาก url ชีต>
   DRIVE_FOLDER_ID=1lda7ww3UybIHobPLm6ZecWaJr4jepiCH
   ```
6. Deploy `admin/` เป็นโปรเจกต์แยก (Vercel: Root Directory = `admin`)
   → ได้ URL หลังบ้านคนละโดเมนกับหน้าร้าน เช่น `ops.pilotlibrary.app`

---

## 4. Runbook ฝ่ายปฏิบัติการ (ใช้มือถือล้วนได้)

| งาน | ทำอย่างไร |
| --- | --- |
| เปลี่ยนราคา/ซ่อนสินค้า | เปิด OPS console → การ์ดสินค้า → แก้ → บันทึก |
| เพิ่มสินค้าใหม่ | อัปฯ รูปลงโฟลเดอร์ Drive → เพิ่มแถวในชีต (slug ห้ามซ้ำ) → หน้าร้านหยิบไปใช้ในรอบแคชถัดไป |
| แก้คำบรรยาย/สเปกละเอียด | ยังอยู่ในโค้ด `data/products.ts` (ขั้นถัดไปควรย้ายคอลัมน์เพิ่มเข้าชีต) |
| เช็คสถานะเชื่อมต่อ | OPS → ป้ายโหมดบนขวา + `/api/status` |

---

## 5. คำแนะนำเพิ่มเติม / ทางเลือกอนาคต

- **ตอนนี้แนะนำ Drive+Sheets ต่อ** — ศูนย์บาท เครื่องมือคุ้นมือ แก้ด่วนได้แม้เว็บล่ม
- เมื่อ SKU > ~300 หรือต้องมี **roles/audit log/สต็อกตัดอัตโนมัติ**: ย้ายชั้นดาต้าเป็น
  Supabase/Postgres โดยคง Drive เป็นคลังรูป และคง contract เดิม (`readRows/writeRow`)
  ไว้เพื่อไม่ต้องแก้หน้าร้าน
- **ความปลอดภัย**: passcode เพียงพอสำหรับทีมเล็ก; ถ้า多人 ให้เปลี่ยนเป็น Google Sign-In
  (อนุญาตเฉพาะอีเมลร้าน) ที่ route `/api/session` — จุดเดียวทั้งระบบ
- อย่าใส่ service account ลงฝั่ง client เด็ดขาด — อยู่เฉพาะ env ของโฮสต์ OPS
