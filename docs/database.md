# Golden Hour — Database Schema & Data Models

---

## 1. Collections & Entities

### USERS
| Field | Type | Description |
|---|---|---|
| `id` | `string` (UUID) | Unique user identifier |
| `name` | `string` | Full name |
| `email` | `string` | Email login address |
| `phone` | `string` | Primary phone number |
| `role` | `'rider' \| 'responder' \| 'admin'` | Access control role |
| `createdAt` | `string` (ISO timestamp) | Registration date |

---

### PROFILES
| Field | Type | Description |
|---|---|---|
| `id` | `string` (UUID) | Profile identifier |
| `ownerUserId` | `string` (UUID) | Foreign key to `USERS.id` |
| `tagId` | `string` (e.g. `GH-7749`) | Unique public emergency tag |
| `name` | `string` | Rider name |
| `bloodGroup` | `'A+' \| 'A-' \| 'B+' \| 'B-' \| 'AB+' \| 'AB-' \| 'O+' \| 'O-' \| 'Unknown'` | Blood type |
| `allergies` | `string[]` | List of severe allergies (e.g. Penicillin) |
| `medicalConditions` | `string[]` | List of chronic conditions (e.g. Asthma) |
| `emergencyContacts` | `EmergencyContact[]` | Array of names, phones & relationships |
| `notes` | `string` | Additional clinical instructions |
| `updatedAt` | `string` (ISO timestamp) | Last update timestamp |

---

### ALERTS
| Field | Type | Description |
|---|---|---|
| `id` | `string` (UUID) | Emergency incident ID |
| `riderId` | `string` (UUID) | Rider ID |
| `riderName` | `string` | Rider full name |
| `tagId` | `string` | Associated QR medical tag |
| `latitude` | `number \| null` | Incident latitude coordinate |
| `longitude` | `number \| null` | Incident longitude coordinate |
| `locationName` | `string` | Reverse geocoded / GPS string |
| `timestamp` | `string` (ISO timestamp) | Alert trigger time |
| `status` | `'pending' \| 'acknowledged' \| 'responding' \| 'resolved' \| 'cancelled'` | Incident lifecycle status |
| `detectionType` | `'threshold_impact' \| 'ml_classifier' \| 'manual_sos' \| 'demo_simulated'` | Detection engine origin |
| `confidence` | `number` | Confidence score (0.0 to 1.0) |
| `sensorSummary` | `SensorSummary` | Peak G-force, max jerk, tilt delta |
| `medicalSummary` | `MedicalSummary` | Instant snapshot of blood group & contacts |
| `responderName` | `string` | Assigned ambulance / dispatch unit |
| `acknowledgedAt` | `string` | Timestamp when command acknowledged |
| `respondingAt` | `string` | Timestamp when unit dispatched |
| `resolvedAt` | `string` | Timestamp when incident closed |

---

### NOTIFICATIONS
| Field | Type | Description |
|---|---|---|
| `id` | `string` (UUID) | Notification log ID |
| `alertId` | `string` | Associated alert ID |
| `recipientName` | `string` | Contact recipient name |
| `recipientPhone` | `string` | Recipient phone number |
| `type` | `'sms' \| 'push'` | Dispatch medium |
| `status` | `'queued' \| 'sent' \| 'delivered' \| 'failed'` | Delivery status |
| `message` | `string` | Dispatched message text |
| `provider` | `'mock' \| 'twilio'` | Dispatch provider |
| `sentAt` | `string` (ISO timestamp) | Time sent |
