# ติดตั้งแอปบนเครื่องจริงแบบ Developer (APK / JDK)

เป้าหมาย: ได้ **ไฟล์ APK จริง** จากการคอมไพล์ด้วย **JDK + Gradle + Android SDK**
บนโปรเจกต์ Capacitor เดิม (ไม่ใช้ Ionic) แล้วติดตั้งลงมือถือ Android แบบ developer

มี 2 เส้นทาง เลือกตามเครื่องมือที่มี:

| เส้นทาง | ต้องมีในเครื่อง | ได้ไฟล์จาก |
| --- | --- | --- |
| **A. CI บิลด์ให้ (แนะนำ)** | ไม่ต้องมีอะไรเลย นอกจากเบราว์เซอร์ | GitHub Releases / Actions artifact |
| **B. บิลด์เองในเครื่อง** | JDK 21 + Android SDK + Node | `android/app/build/outputs/apk/debug/` |

---

## A. ให้ GitHub Actions บิลด์ APK ให้ (JDK อยู่บน runner)

1. เปิด repo → แท็บ **Actions** → เลือก workflow **build-android** → **Run workflow**
   (หรือ push tag `v1.0.0` ก็ได้)
2. รันจบ (~5–8 นาที) จะได้:
   - **Artifact** `app-debug-apk` ในหน้า run นั้น
   - **Release ชื่อ `dev-apk`** → ลิงก์ถาวร:
     `https://github.com/ProAke/PILOT-Library/releases/tag/dev-apk`
3. โหลด `app-debug.apk` เข้ามือถือ (โหลดบนมือถือโดยตรง หรือโหลดเข้าคอมแล้ว `adb install`)
4. แตะติดตั้ง → Android จะเตือน "ติดตั้งแอปที่ไม่รู้จัก" → อนุญาตสำหรับเบราว์เซอร์/ตัวจัดการไฟล์นั้น → ติดตั้งเสร็จ เปิดแอปได้เลย

> runner ใช้ **Temurin JDK 21 + Gradle wrapper + Android SDK** ของ GitHub เอง
> ดังนั้นเครื่องคุณไม่ต้องลง JDK ก็ได้

---

## B. บิลด์ APK เองในเครื่อง (developer build คลาสสิก)

### B1. ติดตั้ง JDK 21
| OS | คำสั่ง |
| --- | --- |
| macOS | `brew install --cask temurin@21` |
| Windows | `winget install EclipseAdoptium.Temurin.21.JDK` |
| Linux (Debian/Ubuntu) | `sudo apt install openjdk-21-jdk` หรือ sdkman: `sdk install java 21-tem` |

ตรวจ: `java -version` ต้องขึ้น 21.x และ `echo $JAVA_HOME` ชี้ไปที่ JDK

### B2. ติดตั้ง Android SDK
- ติด **Android Studio** (แนะนำ — มาพร้อม SDK + licenses) หรือ
- command-line tools ล้วน: โหลดจาก developer.android.com → วางที่ `~/Android/Sdk` →
  `sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"` แล้ว accept licenses

ตั้ง env:
```bash
export ANDROID_HOME=$HOME/Android/Sdk          # Linux/WSL
# macOS: export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### B3. บิลด์ + ติดตั้งเข้าเครื่อง
```bash
git clone https://github.com/ProAke/PILOT-Library && cd PILOT-Library
npm install
npm run mobile:sync        # export เว็บ → android/ (Capacitor)
npm run mobile:apk         # = cd android && ./gradlew assembleDebug
# APK อยู่ที่: android/app/build/outputs/apk/debug/app-debug.apk

# เสียบมือถือ (เปิด USB debugging) แล้วติดตั้งตรง:
npm run mobile:apk:install # = ./gradlew installDebug
# หรือmanual: adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### B4. เปิดโหมด developer บนมือถือ Android
1. ตั้งค่า → **เกี่ยวกับโทรศัพท์** → แตะ **หมายเลขบิลด์** 7 ครั้ง → "คุณเป็นนักพัฒนาแล้ว"
2. ตั้งค่า → ระบบ → **ตัวเลือกนักพัฒนา** → เปิด **USB debugging**
3. เสียบสาย / หรือติดตั้งผ่านไฟล์ APK: ตั้งค่า → แอป → พิเศษ → **ติดตั้งแอปที่ไม่รู้จัก** → อนุญาตแหล่งที่โหลดไฟล์มา

---

## iOS (อ้างอิง — ต้อง macOS)
iOS ไม่มีเส้นทาง sideload APK เทียบเท่า; แบบ developer คือ signing ด้วย Apple ID ส่วนตัว:
```bash
npm run mobile:sync && npm run mobile:ios
# Xcode → Signing & Capabilities → Team = Apple ID ของคุณ → Run ▶ บน iPhone
# ครั้งแรก: ตั้งค่า → ทั่วไป → VPN และการจัดการอุปกรณ์ → เชื่อใจโปรไฟล์
```
(ฟรี signing อายุ 7 วัน · ต้องการแจกยาวใช้ TestFlight)

---

## แก้ปัญหาที่พบบ่อย
| อาการ | แก้ |
| --- | --- |
| `SDK location not found` | ตั้ง `ANDROID_HOME` หรือสร้าง `android/local.properties` ว่า `sdk.dir=...` |
| Gradle บอก unsupported Java version | ต้อง JDK 21 (`java -version`) — Capacitor 8/AGP 8.x ไม่รับ JDK ต่ำกว่า 17 |
| `adb: device unauthorized` | กดยินยอม fingerprint บนหน้าจอมือถือ แล้วเสียบใหม่ |
| ติดตั้ง APK แล้วเด้ง "blocked by Play Protect" | เลือก "ติดตั้งต่อไป" (แอปเราไม่ได้กระจายผ่าน Play) |
| CI ล้มที่ gradle download | รันซ้ำได้ — runner แคช Gradle ไว้รอบถัดไปเร็วขึ้นมาก |
