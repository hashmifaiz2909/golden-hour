# 🚨 Golden Hour — AI-Assisted Road Accident Emergency Response Platform

> **Smart India Hackathon 2026**  
> **Problem Statement ID:** SIH26198  
> **Organization:** AICTE  
> **Theme:** MedTech / BioTech / HealthTech  
> **Category:** Software  
> 
> *"When a victim cannot call for help, technology should speak for them."*

---

## 🌟 Quick Start Guide

### Prerequisites
- Node.js (v18+ or v20+)
- Python 3 (v3.9+)

### 1. Install Dependencies
```bash
# In golden-hour root
cd services/backend && npm install
cd ../../apps/web && npm install
```

### 2. Run the Full Stack
Open 3 terminal tabs (or run the services concurrently):

```bash
# Terminal 1: Backend Server (Port 5000)
cd golden-hour/services/backend
npm run dev

# Terminal 2: ML Classifier Microservice (Port 5001)
cd golden-hour/services/ml
python3 app.py

# Terminal 3: Web & Mobile Client (Port 3000)
cd golden-hour/apps/web
npm run dev
```

### 3. Open in Browser
- **Public Landing Website:** `http://localhost:3000`
- **SIH 2026 Interactive Demo Suite:** `http://localhost:3000/demo`
- **Rider Smartphone App:** `http://localhost:3000/mobile`
- **Responder Command Center:** `http://localhost:3000/responder/dashboard`
- **Sample Bystander QR Profile:** `http://localhost:3000/id/GH-7749`

---

## 🏗️ Architecture & Modules

```
golden-hour/
├── apps/
│   └── web/                   # Vite + React 18 + TypeScript + Leaflet + Lucide
├── services/
│   ├── backend/               # Node.js + Express + SSE + Twilio/Mock Notification
│   └── ml/                    # Python Feature Extraction & Classifier Service
├── shared/
│   ├── types/                 # Shared TypeScript Data Contracts
│   └── utils/                 # Kinetic Threshold Math & Geo Utilities
└── docs/
    ├── architecture.md        # Mathematical Formulations & Component Diagrams
    ├── api.md                 # Complete REST API Specifications
    ├── database.md            # Schema Models & Relations
    └── demo.md                # 3-Minute SIH Judge Demonstration Script
```

---

## 🔒 Security & Privacy Features
- **Public QR Sanitization:** Zero exposure of private emails, passwords, or internal auth IDs.
- **Configurable False-Alarm Filtration:** Separates potholes and hard braking from actual high-G crashes.
- **Transparent MedTech Ethics:** Clear disclaimers regarding sensor variances and operational limitations.
