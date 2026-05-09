# AGENT.md — Two-Layer Fall Detection System

## Project Goal

Build a real-time patient fall detection and caregiver alert system using:

- Raspberry Pi 5 as the edge sensor/camera controller
- Backend API as the central decision layer
- Vision LLM as second-layer fall verification
- SQLite as local event storage
- React frontend as the caregiver dashboard
- WebSocket for real-time emergency updates

The system should reduce false alarms by using sensor detection first, then confirming with AI vision analysis before triggering caregiver alerts.

---

## Core Architecture

```txt
[Sensor / Pi5]
     ↓
Layer 1: Fall suspected by sensor logic
     ↓
[Pi Camera Capture]
     ↓
POST image + sensor metadata to backend API
     ↓
[Backend FastAPI]
     ↓
Layer 2: Vision LLM verification
     ↓
Save event/result into SQLite
     ↓
Broadcast result through WebSocket
     ↓
[React Caregiver Dashboard]
```

---

## Key System Principle

The Raspberry Pi 5 should only detect a possible fall and capture evidence.

The backend should decide whether the image confirms a real fall.

```txt
Pi5 = trigger + image capture
Backend = decision logic + storage + alert control
LLM = visual verification
Frontend = caregiver interface
```

---

## Recommended Tech Stack

### Raspberry Pi 5

- Python
- GPIO sensor reading
- Pi Camera / OpenCV / Picamera2
- `requests` for sending API data

### Backend

- FastAPI
- SQLite
- SQLAlchemy or raw SQLite
- WebSocket
- Vision LLM API integration

### Frontend

- React
- Vite
- TailwindCSS
- WebSocket client
- Alert popup UI
- Patient monitoring cards

---

## Local Network Setup

Both the Pi5 and backend device must be connected to the same WiFi network.

Example:

```txt
Laptop backend IP: 192.168.1.25
Backend API port: 8000
Pi5 sends to: http://192.168.1.25:8000/api/fall-verification
Frontend opens: http://192.168.1.25:5173
```

Run backend with:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Do not run backend only on `localhost`, because Pi5 cannot access your laptop's localhost.

---

## Step-by-Step Build Plan

## Step 1 — Create Backend Project

Recommended folder structure:

```txt
fall-detection-system/
├── backend/
│   ├── app.py
│   ├── database.py
│   └── schema.sql
│
├── rpi/
│   ├── main.py
│   ├── camera.py
│   ├── inference.py
│   ├── serial_listener.py
│   ├── alert.py
│   ├── speaker.py
│   └── config.py
│
├── dashboard/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .env
├── requirements.txt
└── AGENT.md
```

---

## Step 2 — Backend API Endpoint

Create an endpoint:

```txt
POST /api/fall-verification
```

This endpoint receives:

- patient_id
- bed_id
- trigger_type
- sensor_confidence
- distance_cm
- timestamp
- captured image

Expected backend behavior:

1. Receive image and metadata
2. Save image into `/captures`
3. Store initial event in SQLite
4. Send image to Vision LLM
5. Receive verification result
6. Update SQLite event
7. Push real-time alert to frontend through WebSocket
8. Return result to Pi5

---

## Step 3 — Pi5 Sensor Trigger Logic

The Pi5 continuously reads sensor data.

Example logic:

```txt
IF abnormal distance change detected
OR fall posture threshold exceeded
OR sudden movement pattern detected
THEN:
    capture image
    send image + sensor metadata to backend
```

Important:

The Pi5 should not immediately alert the caregiver.

It should only send a fall-suspected event to the backend.

---

## Step 4 — Pi5 Camera Capture

When the Pi5 detects possible fall:

1. Activate camera
2. Capture image
3. Save locally as temporary file
4. Send to backend API

Example image filename:

```txt
BED_01_2026_05_09_230501.jpg
```

---

## Step 5 — Send Image From Pi5 to Backend

Pi5 sends a multipart form request:

```python
import requests
from datetime import datetime

API_URL = "http://192.168.1.25:8000/api/fall-verification"

data = {
    "patient_id": "PATIENT_001",
    "bed_id": "BED_01",
    "trigger_type": "fall_suspected",
    "sensor_confidence": 0.82,
    "distance_cm": 22.5,
    "timestamp": datetime.now().isoformat()
}

files = {
    "image": open("capture.jpg", "rb")
}

response = requests.post(API_URL, data=data, files=files)
print(response.json())
```

---

## Step 6 — Backend Vision LLM Verification

The backend sends the image to a vision-capable LLM.

The LLM should classify into one of these statuses:

```txt
FALL_CONFIRMED
FALL_UNCERTAIN
NO_FALL
```

Suggested output format:

```json
{
  "classification": "FALL_CONFIRMED",
  "confidence": 0.91,
  "reason": "The patient appears to be lying on the floor beside the bed.",
  "recommended_action": "Notify caregiver immediately."
}
```

---

## Step 7 — Alert Decision Logic

Backend should decide alert severity.

```txt
If classification == FALL_CONFIRMED:
    severity = CRITICAL
    show emergency popup
    notify caregiver

If classification == FALL_UNCERTAIN:
    severity = WARNING
    show review-required alert

If classification == NO_FALL:
    severity = NORMAL
    log event only
```

---

## Step 8 — Store Event in SQLite

Store each fall event with:

- event_id
- patient_id
- bed_id
- trigger_type
- sensor_confidence
- image_path
- llm_classification
- llm_confidence
- reason
- recommended_action
- severity
- timestamp
- acknowledged status

Example table:

```sql
CREATE TABLE fall_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT,
    bed_id TEXT,
    trigger_type TEXT,
    sensor_confidence REAL,
    distance_cm REAL,
    image_path TEXT,
    llm_classification TEXT,
    llm_confidence REAL,
    reason TEXT,
    recommended_action TEXT,
    severity TEXT,
    timestamp TEXT,
    acknowledged INTEGER DEFAULT 0
);
```

---

## Step 9 — WebSocket Real-Time Update

Frontend connects to:

```txt
ws://192.168.1.25:8000/ws/alerts
```

When backend completes LLM verification, it broadcasts:

```json
{
  "type": "fall_alert",
  "severity": "CRITICAL",
  "patient_id": "PATIENT_001",
  "bed_id": "BED_01",
  "classification": "FALL_CONFIRMED",
  "confidence": 0.91,
  "reason": "Patient appears to be lying on the floor beside the bed.",
  "recommended_action": "Notify caregiver immediately.",
  "image_url": "/captures/BED_01_2026_05_09_230501.jpg",
  "timestamp": "2026-05-09T23:05:01"
}
```

---

## Step 10 — Frontend Alert Behavior

Frontend should respond based on severity.

### CRITICAL

- Patient card moves to top
- Red emergency popup appears
- Incident appears in right-side alert queue
- Sound or visual pulse activates
- Caregiver can click "Acknowledge"

### WARNING

- Patient card turns amber
- Alert appears in incident queue
- No full emergency popup unless repeated

### NORMAL

- Event is logged
- Dashboard remains calm

---

## Frontend UX Requirements

When fall is confirmed:

```txt
🚨 FALL CONFIRMED

Patient: PATIENT_001
Location: Ward 3A • Bed 01
AI Confidence: 91%

Recommended Action:
Notify caregiver immediately.

[View Evidence] [Acknowledge] [Escalate]
```

When uncertain:

```txt
⚠ Fall Verification Uncertain

The sensor detected abnormal movement, but the AI could not confidently confirm a fall.

[Review Image] [Continue Monitoring]
```

---

## Backend Safety Rules

The backend must:

1. Validate incoming image
2. Limit image size
3. Save image with safe filename
4. Never trust raw Pi5 data fully
5. Handle LLM API failure gracefully
6. Store every event even if LLM fails
7. Notify frontend if verification fails

If LLM fails:

```json
{
  "classification": "FALL_UNCERTAIN",
  "confidence": 0.0,
  "reason": "Vision verification failed. Manual caregiver review required.",
  "severity": "WARNING"
}
```

---

## Recommended Development Order

### Phase 1 — Local API Test

- Build FastAPI endpoint
- Test image upload from Postman or Python
- Save image locally

### Phase 2 — SQLite Logging

- Create `fall_events` table
- Store received event
- Return event ID

### Phase 3 — Fake LLM Result

- Hardcode dummy AI output first
- Test frontend alert popup
- Make sure dashboard updates correctly

### Phase 4 — WebSocket

- Connect frontend to backend WebSocket
- Broadcast dummy fall event
- Animate patient card and popup

### Phase 5 — Pi5 Integration

- Connect Pi5 to same WiFi
- Send actual image to backend
- Test local network connection

### Phase 6 — Real Vision LLM

- Add LLM API call
- Send captured image for verification
- Parse structured JSON result

### Phase 7 — Polish UI

- Add emergency popup
- Add incident queue
- Add acknowledge button
- Add image evidence viewer
- Add event timeline

---

## Environment Variables

Create `.env` inside backend:

```env
VISION_LLM_API_KEY=your_api_key_here
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DATABASE_URL=sqlite:///./fall_events.db
CAPTURE_DIR=./captures
```

---

## API Routes To Implement

```txt
POST /api/fall-verification
GET  /api/fall-events
GET  /api/fall-events/{event_id}
POST /api/fall-events/{event_id}/acknowledge
GET  /captures/{filename}
WS   /ws/alerts
```

---

## Agent Instructions

When generating code for this project:

1. Prefer FastAPI for backend.
2. Use SQLite for local database.
3. Use clean modular files instead of putting everything into one file.
4. Keep Pi5 code separate from backend code.
5. Backend must be accessible from Pi5 using local IP.
6. Use WebSocket for frontend live alert updates.
7. Use HTTP POST multipart form upload for Pi5 image transfer.
8. Treat sensor trigger as first-layer detection only.
9. Treat Vision LLM as second-layer verification.
10. Do not trigger emergency alert until backend has verification result.
11. If LLM is unavailable, classify as `FALL_UNCERTAIN` and ask for manual caregiver review.
12. Store all events in SQLite.
13. Design frontend around severity:
    - CRITICAL = red popup + top priority
    - WARNING = amber review alert
    - NORMAL = log only
14. Keep caregiver UI simple, urgent, and action-oriented.
15. Prioritize reliability over fancy effects.

---

## Final System Summary

This system uses a two-layer fall detection model:

```txt
Layer 1:
Pi5 sensor detects possible fall.

Layer 2:
Vision LLM verifies whether the captured image truly shows a fall.

Final Output:
Caregiver dashboard receives real-time verified alert.
```

This reduces false alarms while maintaining fast emergency response.
