# Golden Hour — REST API & Event Stream Documentation

Base URL: `http://localhost:5000/api`

---

## 1. Authentication Endpoints

### Register
`POST /api/auth/register`
```json
{
  "name": "Aarav Mehta",
  "email": "rider@goldenhour.org",
  "phone": "+919876543210",
  "password": "demo123",
  "role": "rider"
}
```

### Login
`POST /api/auth/login`
```json
{
  "email": "rider@goldenhour.org",
  "password": "demo123"
}
```

### Get Session
`GET /api/auth/me`  
Header: `Authorization: Bearer <token>`

---

## 2. Profile & Public QR Endpoints

### Get Rider Profile (Protected)
`GET /api/profile`  
Header: `Authorization: Bearer <token>`

### Update Rider Profile (Protected)
`PUT /api/profile`  
Header: `Authorization: Bearer <token>`
```json
{
  "name": "Aarav Mehta",
  "bloodGroup": "O+",
  "allergies": ["Penicillin", "Sulfa drugs"],
  "medicalConditions": ["Mild Asthma"],
  "emergencyContacts": [
    { "name": "Pooja Mehta", "phone": "+919876543211", "relationship": "Spouse", "isPrimary": true }
  ]
}
```

### Get Public Emergency Profile (Zero-Login)
`GET /api/profile/tag/:tagId`  
*Example: `GET /api/profile/tag/GH-7749`*
```json
{
  "profile": {
    "tagId": "GH-7749",
    "name": "Aarav Mehta",
    "bloodGroup": "O+",
    "allergies": ["Penicillin", "Sulfa drugs"],
    "medicalConditions": ["Mild Asthma (carries inhaler)"],
    "emergencyContacts": [
      { "name": "Pooja Mehta (Spouse)", "phone": "+919876543211", "relationship": "Spouse" }
    ],
    "lastUpdated": "2026-09-08T11:00:00.000Z",
    "isEmergencyVerified": true
  }
}
```

---

## 3. Emergency Alerts Endpoints

### Create & Dispatch Alert
`POST /api/alerts`
```json
{
  "riderId": "user-rider-demo-01",
  "riderName": "Aarav Mehta",
  "tagId": "GH-7749",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "detectionType": "threshold_impact",
  "confidence": 0.92,
  "sensorSummary": {
    "peakG": 4.8,
    "maxJerk": 26.4,
    "tiltAngleDelta": 68.0
  }
}
```

### List Alerts
`GET /api/alerts?status=pending`

### Update Alert Status
`PATCH /api/alerts/:id/status`
```json
{
  "status": "acknowledged",
  "responderName": "Captain Suresh Rao"
}
```

---

## 4. Responder Command Endpoints

### Get Responder Incident List
`GET /api/responder/alerts`

### Get Responder Summary KPIs
`GET /api/responder/stats`

### Update Triage Phase
`PATCH /api/responder/alerts/:id/status`
```json
{
  "status": "responding",
  "responderName": "Delhi Trauma EMS Unit 2"
}
```

---

## 5. Real-Time Server-Sent Events (SSE)

### Live Stream Connection
`GET /api/events`  
Pushes events: `ALERT_CREATED`, `ALERT_STATUS_UPDATED`, `NOTIFICATION_SENT`.
