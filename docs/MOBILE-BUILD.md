# PILOT Library — คู่มือสร้างแอป iOS & Android + เดโมบนมือถือจริง

แอปนี้ใช้โค้ดชุดเดียว (Next.js) แล้วแพ็กเป็น 3 รูปแบบ:

| รูปแบบ | ได้อะไร | ใช้เมื่อ |
| --- | --- | --- |
| **เว็บ / PWA** | เปิดบนมือถือ + ติดตั้งลงหน้าจอโฮม มีไอคอน แถบเมนูล่าง ทำงานออฟไลน์ | ต้องการเดโมเร็ว ๆ ไม่ต้องผ่าน App Store |
| **iOS (Capacitor)** | ไฟล์ `.ipa` / รันบนเครื่องจริงหรือ Simulator ผ่าน Xcode | ขึ้น TestFlight / App Store |
| **Android (Capacitor)** | ไฟล์ `.apk` / `.aab` ติดตั้งตรงได้ | แจก tester หรือขึ้น Play Store |

โครงสร้างแอป: ทุกหน้าถูก export เป็นไฟล์ static ใน `out/` แล้ว Capacitor ห่อเป็นแอป
แคตตาล็อก 26 SKU ฝังอยู่ในแอป (เปิดได้โดยไม่ต้องมีเน็ต) และสามารถรีเฟรชรูปจาก
Google Drive ผ่าน API ตอนเปิดแอปได้ถ้าตั้งค่า `NEXT_PUBLIC_CATALOG_API`

---

## 0. เตรียมเครื่องมือ

### ทุกแพลตฟอร์ม
```bash
node -v      # ≥ 20 (แนะนำ 22)
npm install
```

### iOS (ต้องใช้ macOS)
```bash
xcode-select --install          # Command Line Tools
# Xcode 16+ จาก App Store
sudo xcodebuild -license accept
brew install cocoapods          # ถ้าใช้ CocoaPods (โปรเจกต์นี้ใช้ SPM เป็นค่าเริ่มต้น)
```

### Android (ใช้ได้ทุก OS)
```bash
# Android Studio (แนะนำ) — มาพร้อม SDK + Emulator
# หรือใช้ command line:
export ANDROID_HOME=$HOME/Library/Android/sdk      # macOS
export ANDROID_HOME=$HOME/Android/Sdk              # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
java -version    # JDK 21
```

---

## 1. บิลด์เว็บที่ใช้เป็น "ตัวแอป"

```bash
npm run build:mobile      # static export → out/  (33 หน้า, ~9 MB)
```

สคริปต์จะพัก `app/api/**` ไว้ชั่วคราว (static export ไม่มี Node server)
แล้วคืนกลับให้อัตโนมัติ จากนั้นเขียน `out/build-info.json` ให้ตรวจเวอร์ชันได้

> ภาพสินค้าถูกเตรียมไว้ล่วงหน้าที่ `public/catalog/` แล้ว (1×/2×) จึงไม่ต้องใช้
> image optimizer ของ Next ตอนรันในแอป

---

## 2. Sync เข้าโปรเจกต์เนทีฟ

```bash
npm run mobile:sync       # build:mobile + npx cap sync
```

คำสั่งนี้จะคัดลอก `out/` ลงใน `ios/App/App/public` และ `android/app/src/main/assets/public`
พร้อมติดตั้งปลั๊กอินที่ใช้: `@capacitor/app`, `status-bar`, `splash-screen`, `browser`, `haptics`

ถ้าต้องการชี้แอปไปที่เว็บที่ deploy แล้ว (เช่นระหว่างพัฒนา UI):
```bash
CAP_SERVER_URL=https://pilot-library.vercel.app npm run mobile:sync
```

---

## 3. รันบน iOS

```bash
npm run mobile:ios        # เปิด Xcode
```
ใน Xcode:
1. เลือก target **App** → แท็บ *Signing & Capabilities*
2. ใส่ **Team** (Apple ID ฟรีก็ได้สำหรับเครื่องตัวเอง)
3. เปลี่ยน **Bundle Identifier** เป็นของคุณ เช่น `com.yourname.pilotlibrary`
4. เลือกอุปกรณ์ (Simulator หรือ iPhone ที่เสียบสาย) แล้วกด **▶ Run**

สร้างไฟล์ติดตั้ง / ขึ้น TestFlight:
```bash
npm run mobile:ios
# Xcode → Product → Archive → Distribute App → TestFlight / Ad Hoc
```

> ต้องมี Apple Developer Program ($99/ปี) สำหรับ TestFlight หรือ App Store
> แต่การรันบน iPhone ของตัวเองทำได้ฟรี (แอปหมดอายุทุก 7 วัน)

---

## 4. รันบน Android

```bash
npm run mobile:android    # เปิด Android Studio
```
ใน Android Studio:
1. รอ Gradle sync ครั้งแรก (โหลด dependency)
2. เลือกอุปกรณ์: Emulator หรือมือถือที่เปิด **USB debugging**
3. กด **▶ Run**

สร้างไฟล์ `.apk` สำหรับแจก tester (ไม่ต้องใช้ Play Store):
```bash
cd android
./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk  (ส่งไฟล์นี้ให้ tester ติดตั้งได้เลย)
```

สำหรับ Play Store:
```bash
cd android
./gradlew bundleRelease
# → android/app/build/outputs/bundle/release/app-release.aab
```
ต้องตั้ง signing key ก่อน (Android Studio → Build → Generate Signed Bundle/APK)

---

## 5. ไอคอน & Splash

สร้างจากโลโก้จริงอัตโนมัติ:
```bash
npm run mobile:assets
```
สคริปต์ใช้ `assets-mobile/icon.png` (พื้นกรมท่า + โลโก้สีกระดูก) และ
`splash.png` (พื้นกระดูก + โลโก้ + เส้นคาด) แล้ว gen ทุกขนาดของ iOS (14 ไฟล์)
และ Android (148 ไฟล์ รวม night/landscape)

---

## 6. เดโมบนมือถือจริง (ไม่ต้องบิลด์)

### ทางที่เร็วที่สุด — เปิดจากลิงก์
1. เอาโปรเจกต์ขึ้นโฮสต์ที่มี HTTPS (Vercel/Netlify/Cloudflare Pages)
   ```bash
   vercel deploy --prod
   ```
2. เปิด `/demo` บนคอมพิวเตอร์ → **สแกน QR** ด้วยกล้องมือถือ
3. บนมือถือ: Safari (iOS) → แชร์ → *เพิ่มไปยังหน้าจอโฮม* ·
   Chrome (Android) → ⋮ → *ติดตั้งแอป*
4. เปิดจากไอคอน → ได้แอปเต็มจอ มีแถบเมนูล่าง 5 แท็บ (Home/Shop/Search/Bag/About)
   และเปิดดูสินค้าได้แม้ปิดเน็ต (service worker)

สร้าง QR เองสำหรับ URL ที่ต้องการ:
```bash
npm run demo:qr -- https://your-preview-url.example
# → public/demo/qr.png
```

### รันเดโมจากเครื่อง dev ในวง LAN เดียวกัน
```bash
npm run dev -- -H 0.0.0.0
# หา IP เครื่อง: ipconfig getifaddr en0 (macOS) / hostname -I (Linux)
# เปิดบนมือถือ: http://192.168.1.x:3000
```
> หมายเหตุ: `http://` ใช้ทดสอบ UI ได้ แต่ **ติดตั้งเป็น PWA ไม่ได้** (ต้อง https)

### ทดสอบ UI บนเดสก์ท็อป
Chrome → DevTools → Toggle device toolbar → iPhone 15 Pro / Pixel 8
แถบเมนูล่างจะปรากฏอัตโนมัติที่ความกว้าง ≤ 720px

---

## 7. โครงสร้างไฟล์ที่เกี่ยวกับแอป

```
capacitor.config.ts          appId / appName / webDir / splash / status bar
scripts/build-mobile.mjs     static export + build stamp
lib/native.ts                status bar, splash, haptics, back button, openExternal
components/app-shell.tsx     แถบเมนูล่าง 5 แท็บ (แสดงในแอป/มือถือ)
lib/catalog-client.ts        แคตตาล็อกฝังในแอป + รีเฟรชจาก API (แคช 30 นาที)
assets-mobile/               ต้นฉบับไอคอน + splash
ios/                         โปรเจกต์ Xcode (Swift Package Manager)
android/                     โปรเจกต์ Gradle
```

---

## 8. แก้ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
| --- | --- |
| `cap sync` เตือนไม่มี `out/` | รัน `npm run build:mobile` ก่อน (หรือใช้ `npm run mobile:sync`) |
| Xcode: *Signing for "App" requires a development team* | ใส่ Team ใน Signing & Capabilities |
| Android: `SDK location not found` | ตั้ง `ANDROID_HOME` หรือเปิดโปรเจกต์ผ่าน Android Studio ครั้งแรก |
| หน้าเว็บขาวในแอป | ตรวจว่า `webDir` ชี้ที่ `out` และรัน `npm run mobile:sync` ใหม่ |
| รูปสินค้าไม่ขึ้นตอนออฟไลน์ | ต้องเปิดแอปออนไลน์หนึ่งครั้งให้ service worker แคช `/catalog/*` |
| ต้องการรูปสดจาก Google Drive | deploy เว็บแล้วตั้ง `NEXT_PUBLIC_CATALOG_API=https://your-domain` ก่อน `build:mobile` |

---

## 9. Checklist ก่อนส่งขึ้น Store

- [ ] `appId` เป็นของคุณ (`com.<company>.pilotlibrary`)
- [ ] ไอคอน + splash ผ่าน `npm run mobile:assets`
- [ ] เวอร์ชันใน `ios/App/App/Info.plist` (`CFBundleShortVersionString`) และ
      `android/app/build.gradle` (`versionName`, `versionCode`)
- [ ] Privacy: แอปไม่เก็บข้อมูลผู้ใช้ (ตะกร้าเก็บในเครื่อง) — ระบุใน App Privacy
- [ ] ภาพหน้าจอ 6.7"/6.5" (iOS) และ phone/tablet (Android)
- [ ] คำอธิบายร้านค้า + ลิงก์นโยบายความเป็นส่วนตัว
