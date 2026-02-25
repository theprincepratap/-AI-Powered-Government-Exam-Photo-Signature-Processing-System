<div align="center">

# 🇮🇳 GovPhoto AI Processor

**AI-powered government photo & signature processor for Indian competitive exams and government portals.**

Crop · AI background removal · Resize to exact government spec — all in the browser, no uploads to any third-party server.

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.x-092E20?logo=django&logoColor=white)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![rembg](https://img.shields.io/badge/AI-rembg%20U2Net-FF6B6B)](https://github.com/danielgatis/rembg)

</div>

---

## ✨ Features

| Feature | Details |
|---|---|
| **5-step guided workflow** | Upload → Crop → Background → Resize → Download |
| **Interactive crop tool** | Zoom, pan, rotate, lock aspect ratio (`react-easy-crop`) |
| **AI background removal** | U2-Net model via `rembg`; falls back to OpenCV GrabCut |
| **Background fill** | White, sky blue, black, transparent, or any custom hex colour |
| **11 exam templates** | SSC CGL, UPSC CSE, IBPS/SBI, Railways RRB, Bihar Police, UP Police, NTA (JEE/NEET/CUET), Passport, CAT, MPSC, Custom |
| **Manual resize** | Custom width × height, DPI, max file size, JPEG/PNG/WebP output |
| **Photo + Signature mode** | Process both in one session; signature skips crop / BG steps |
| **Side-by-side comparison** | Original → Cropped → AI-BG → Resized in Step 5 |
| **One-click download** | Downloads the final government-spec image instantly |
| **100 % browser-side resize** | Canvas API; no file ever leaves your machine for resizing |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│  React 18 + TypeScript + Vite  (localhost:5173)     │
│  5-step UI · Canvas crop · react-easy-crop          │
│  /api  ──proxy──►  Django (localhost:8000)          │
└───────────────────────────┬─────────────────────────┘
                            │ REST (DRF)
┌───────────────────────────▼─────────────────────────┐
│  Django 5 + Django REST Framework  (localhost:8000) │
│                                                     │
│  POST /api/remove-background/  ← rembg U2-Net AI   │
│  GET  /api/templates/          ← 11 exam templates  │
│  POST /api/photos/             ← upload + process   │
│  POST /api/signatures/         ← upload + process   │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
AI_Govt_Photo_Signature_Processor/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── templates_config.json       ← 11 exam resize templates
│   ├── ai_engine/
│   │   ├── background_removal.py   ← OpenCV GrabCut
│   │   ├── face_detection.py       ← Haar cascade detector
│   │   ├── image_resize.py         ← Pillow resize to spec
│   │   ├── rules.py                ← Business rule engine
│   │   └── signature_processing.py ← Adaptive threshold
│   ├── api/
│   │   ├── models.py               ← PhotoSubmission, SignatureSubmission
│   │   ├── serializers.py
│   │   ├── views.py                ← REST endpoints + rembg
│   │   └── urls.py
│   ├── core/
│   │   ├── settings.py
│   │   └── urls.py
│   └── media/
│       ├── uploads/
│       └── processed/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx                 ← 5-step orchestrator
│       ├── components/
│       │   ├── Step1Upload.tsx
│       │   ├── Step2Crop.tsx
│       │   ├── Step3Background.tsx
│       │   ├── Step4Resize.tsx
│       │   └── Step5Results.tsx
│       ├── utils/
│       │   ├── api.ts              ← Django API client
│       │   ├── cropImage.ts        ← Canvas crop + rotation
│       │   └── resizeImage.ts      ← Canvas resize + compression
│       └── types/index.ts
├── datasets/
│   ├── photos/
│   └── signatures/
└── docs/
    └── screenshots/
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1 — Clone

```bash
git clone https://github.com/theprincepratap/AI_Govt_Photo_Signature_Processor.git
cd AI_Govt_Photo_Signature_Processor
```

### 2 — Backend setup

```bash
cd backend
python -m venv ../.venv

# Windows
..\.venv\Scripts\activate
# macOS / Linux
source ../.venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # → http://localhost:8000
```

### 3 — Frontend setup

```bash
cd frontend
npm install
npm run dev                         # → http://localhost:5173
```

Open **http://localhost:5173** in your browser.

> The Django backend must be running for AI background removal (`POST /api/remove-background/`). The rembg U2-Net model (~170 MB) is downloaded automatically on first use and cached in `~/.u2net/`.

---

## 🖼 Supported Exam Templates

| Template | Photo (px) | Signature (px) | Max size |
|---|---|---|---|
| SSC CGL / CHSL / MTS | 413 × 531 | 413 × 177 | Photo 300 KB · Sig 100 KB |
| UPSC CSE / IAS / IPS | 413 × 531 | 413 × 177 | Photo 300 KB · Sig 100 KB |
| IBPS / SBI PO & Clerk | 200 × 230 | 140 × 60 | Photo 50 KB · Sig 20 KB |
| Railways RRB NTPC | 413 × 531 | 413 × 177 | Photo 100 KB · Sig 30 KB |
| Bihar Police Constable | 413 × 531 | 413 × 177 | Photo 80 KB · Sig 30 KB |
| UP Police Constable | 413 × 531 | 413 × 177 | Photo 80 KB · Sig 30 KB |
| NTA (JEE / NEET / CUET) | 200 × 250 | 200 × 80 | Photo 40 KB · Sig 30 KB |
| Passport / Visa | 600 × 600 | 413 × 177 | Photo 500 KB · Sig 100 KB |
| CAT / IIM | 300 × 400 | 300 × 80 | Photo 200 KB · Sig 50 KB |
| MPSC Maharashtra | 413 × 531 | 413 × 177 | Photo 200 KB · Sig 80 KB |
| Custom | user-defined | user-defined | user-defined |

---

## 🛠 Tech Stack

**Backend**
- [Django 5](https://djangoproject.com) + [Django REST Framework](https://www.django-rest-framework.org)
- [rembg](https://github.com/danielgatis/rembg) (U2-Net AI background removal)
- [OpenCV](https://opencv.org) (GrabCut fallback, face detection, signature processing)
- [Pillow](https://python-pillow.org) (image resize, format conversion)

**Frontend**
- [React 18](https://react.dev) + [TypeScript 5](https://typescriptlang.org)
- [Vite 5](https://vitejs.dev)
- [react-easy-crop](https://github.com/ValentinH/react-easy-crop) (interactive crop + rotation)
- Canvas API (resize, background compositing)
- CSS Modules

---

## 📡 API Reference

### `GET /api/templates/`
Returns the list of 11 exam templates from `templates_config.json`.

### `POST /api/remove-background/`
Removes the background from a photo using U2-Net AI.

**Request:** `multipart/form-data` — field `image` (JPEG/PNG file)

**Response:**
```json
{
  "result_b64": "<base64 PNG with transparent background>",
  "mime": "image/png"
}
```

### `POST /api/photos/`
Upload a new photo submission.

### `POST /api/photos/{id}/process/`
Run the full AI pipeline (face detection → background removal → resize → rules).

### `POST /api/signatures/`
Upload a new signature submission.

### `POST /api/signatures/{id}/process/`
Run the signature processing pipeline (clean → analyse → resize → rules).

---

## 🧑‍💻 Development

```bash
# Run backend tests
cd backend
python manage.py test

# Frontend lint + type-check
cd frontend
npm run build       # tsc + vite build
```

---

## 🤝 Connect

<div align="center">

| Platform | Link |
|---|---|
| 📸 Instagram | [@itsprincepratap](https://www.instagram.com/itsprincepratap) |
| 🐙 GitHub | [@theprincepratap](https://github.com/theprincepratap) |
| 💼 LinkedIn | [thprincepratap](https://www.linkedin.com/in/thprincepratap/) |

</div>

---

## 💛 Support

If this project helped you, consider buying me a coffee:

**[💰 PayPal — paypal.me/theprincepratap](https://www.paypal.com/paypalme/theprincepratap)**

---

## 📄 License

MIT © Prince Pratap
