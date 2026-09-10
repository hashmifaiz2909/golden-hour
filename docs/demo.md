# Golden Hour — Smart India Hackathon 2026 Presentation Guide

**Project Name:** Golden Hour  
**Theme:** MedTech / BioTech / HealthTech  
**Problem Statement ID:** SIH26198  

---

## 1. Quick Judge Demonstration Script (3-Minute Flow)

### Step 1: Open the Interactive Demo Suite
Navigate to `http://localhost:3000/demo` (or click **SIH Demo Suite** in the top navigation bar).

### Step 2: Explain the Problem & Dual-Pathway Solution
- *Pitch Line:* "During road accidents, if a rider loses consciousness, the Golden Hour is lost before anyone knows where they are or what their blood type is. Golden Hour solves this with autonomous kinetic detection and a zero-login bystander medical QR."

### Step 3: Show the Rider Phone (Left Side)
- Review the medical profile (Blood: O+, Penicillin Allergy).
- Point to Helmet QR Tag `GH-7749`.
- Click **"Preview Public QR Web View"** to show `/id/GH-7749` (highlighting zero login and stripped private emails/passwords).

### Step 4: Trigger Kinetic Crash Simulation
- Click **"Simulate 4.8G Impact"** or click **"Start Auto-Walkthrough"**.
- Watch the live kinetic waveform spike to 4.8G.
- Show the 20-Second **"ARE YOU OK?"** safeguard modal.
- Explain: "If the rider is conscious, they tap *I'm OK*. If unconscious, the timer expires and autonomous dispatch begins."

### Step 5: Live Responder Command Center (Right Side)
- Watch the Leaflet map immediately receive the incident marker with pulsating emergency rings via real-time Server-Sent Events.
- Show the clinical dossier appearing on the right panel with blood group and emergency contacts.
- Click **"Acknowledge Alert"** $\rightarrow$ Click **"Dispatch EMS (Mark Responding)"** $\rightarrow$ Click **"Mark Incident Resolved"**.
- Show status transitioning seamlessly in real time on both sides.

---

## 2. Key Differentiation Points for Judges

1. **Working Full-Stack Software:** Not just Figma slides. Every button triggers real REST APIs, WebSocket/SSE streams, and heuristic/ML classification logic.
2. **Ethical AI:** No exaggerated claims of 100% accuracy. Clear transparent disclaimers and multi-stage false positive filtration (potholes vs hard braking vs crashes).
3. **Zero-Login QR Safeguard:** Bystanders don't need to register or install an app to save a life.
