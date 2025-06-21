## 🎓 VIP 창의적 종합설계

### 📌 프로젝트명  
**터치 한 번으로 이체 끝! NFC 간편 송금 시스템**

### 📽️ 발표자료 및 시연 영상  
[📎 Canva 발표자료 & 시연영상 링크](https://www.canva.com/design/DAGqYxE9_vU/lQ9is7Os6dEzJnHm8OGzvw/edit?utm_content=DAGqYxE9_vU&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

---

## 🧱 구성 요소 (하드웨어)

- Raspberry Pi 4
- PN532 (UART 설정, breakout 보드)
- LCD1602 (I2C 연결)
- 유선 키패드 (3x4 배열)
- 전원 포트 (USB or 외장 배터리)
- 스마트폰 (사용자용 은행 앱)
- POS 앱 (수취측 기기)

> 📦 하드웨어 연결이 완료되면, 필요한 Python 라이브러리는 import 에 따라 설치만 해주시면 됩니다.

---

## 🧰 라즈베리파이 초기 설정

### 1. 가상환경 생성 및 진입

```bash
# 가상환경 모듈 설치
sudo apt install python3-venv

# 가상환경 생성
python3 -m venv nfc

# 가상환경 진입
source nfc/bin/activate
```

### 2. 하드웨어 연결 확인 (I2C 장치 감지)

```bash
sudo i2cdetect -y 1
```

→ `0x27` 또는 `0x3F` 등 LCD 주소가 보이면 정상입니다.

---

## ⚙️ 코드 구성

- `main.py` – 전체 구동 제어
- `nfc_reader.py` – PN532로부터 NFC URL 읽기
- `lcd_display.py` – 1602 LCD 출력용 모듈
- `keypad_input.py` – 비밀번호 입력 처리
- `transfer_handler.py` – 은행 송금 시뮬레이션 처리

> 실제 하드웨어 코드는 각 모듈에 분리되어 있으며, `main.py`에서 실행을 통합합니다.

---

# 💳 VIP-TagPayClient: NFC 기반 생체 인증 간편 송금 시스템

TagPay는 스마트폰 화면을 켜지 않아도 NFC 태그를 인식하여 **은행, 계좌, 금액 정보를 자동 수신**하고, **생체 인증만으로 송금이 완료**되는 시스템입니다.

본 프로젝트는 2025년 VIP 졸업설계를 위해 개발되었으며, 사용자 편의성과 보안을 동시에 만족시키는 **차세대 간편 송금 서비스**를 지향합니다.

---

## 📱 주요 기능

- 📡 **NFC 태그 자동 인식 및 앱 실행**
- 🔐 **생체 인증 처리** (Face → Fingerprint → 비밀번호 fallback)
- 🧾 **송금 내역 관리 및 조회**
- 🏦 **다중 은행 계좌 등록**
- 🔑 **JWT 기반 로그인/회원가입**
- ✅ **완전한 Android 생체 인증 및 NFC 설정 포함**

---

## 🛠️ 기술 스택

| 구분        | 기술                              |
|-------------|-----------------------------------|
| Frontend    | React Native, TypeScript, AsyncStorage, React Navigation |
| Backend     | Node.js (Express), MySQL, JWT, bcrypt |
| Native Code | Android NFC, Biometric (Kotlin)  |

---

## 📂 프로젝트 구조

```bash
VIP-TagPay/
├── src/
│   ├── screens/           # NFC, 생체 인증, 로그인 등 화면
│   ├── components/        # 공통 UI 컴포넌트
│   └── constants/         # API 주소 등 설정값
├── server/
│   ├── routes/            # 사용자, 계좌, 결제 관련 API
│   ├── db/                # MySQL 연동 및 쿼리
│   └── app.js             # 백엔드 엔트리 포인트
└── README.md
```

---

## ⚙️ Android 필수 설정

> ⚠️ 앱을 정상적으로 빌드/실행하려면 반드시 아래 설정을 수동으로 추가해야 합니다.

### ✅ 권한 및 NFC 설정

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### ✅ NFC 태그 인식용 인텐트 필터

```xml
<intent-filter>
  <action android:name="android.nfc.action.NDEF_DISCOVERED" />
  <category android:name="android.intent.category.DEFAULT" />
  <data android:scheme="https" android:host="example.com" android:pathPrefix="/pay" />
</intent-filter>
```

📌 **주의**
- `launchMode="singleTask"` → NFC 태그 중복 실행 방지
- `host="example.com"` → 실제 사용하는 도메인으로 수정
- `pathPrefix="/pay"` → NFC URL 형식에 맞게 조정

---

## 🚀 실행 방법

### 1. 백엔드 실행

```bash
cd server
npm install
node app.js
```

### 2. 프론트엔드 실행 (Android)

```bash
cd TagPayProject
npx react-native run-android
```

🔐 **실행 전 반드시 위의 `AndroidManifest.xml` 설정이 적용되어 있어야 합니다.**

---


