# TebX Dashboard API Documentation

## Base URL
```
https://api.tebx.com/dashboard
```

## Authentication
All dashboard endpoints require an `Authorization` header with a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## Endpoints Overview

### 1. Clinic Overview
**GET** `/clinic/{clinicId}/overview`  
Provides a comprehensive real-time overview of clinic operations for today.

| Parameter | In   | Type   | Required | Description            |
|-----------|------|--------|----------|------------------------|
| clinicId  | path | string | ✓        | The clinic identifier  |

**Response Example**
```json
{
  "clinicId": "string",
  "clinicName": "string",
  "date": "2024-03-20",
  "appointmentSummary": {
    "total": 25,
    "completed": 8,
    "inProgress": 3,
    "booked": 12,
    "cancelled": 1,
    "noShow": 1
  },
  "patientFlow": {
    "waiting": 5,
    "withDoctor": 3,
    "arrivedToday": 15,
    "avgWaitTime": 18
  },
  "doctorStatus": [
    {
      "doctorId": "string",
      "doctorName": "Dr. Sarah Johnson",
      "speciality": "Cardiology",
      "currentPatients": 1,
      "todayAppointments": 8,
      "isAvailable": false,
      "nextAvailableSlot": "After current patient"
    }
  ],
  "lastUpdated": "2024-03-20T10:30:00Z"
}
```

---

### 2. Waiting Room Status
**GET** `/clinic/{clinicId}/waiting-room`  
Returns the current waiting-room queue with patient details and estimated wait times.

| Parameter | In   | Type   | Required | Description            |
|-----------|------|--------|----------|------------------------|
| clinicId  | path | string | ✓        | The clinic identifier  |

**Response Example**
```json
{
  "clinicId": "string",
  "totalInQueue": 5,
  "currentlyServed": 3,
  "averageWaitTime": 18,
  "queue": [
    {
      "patientId": "string",
      "patientNameAr": "أحمد محمد",
      "patientNameEn": "Ahmed Mohammed",
      "medicalFileNumber": "MRN001",
      "appointmentId": "string",
      "scheduledTime": "10:30",
      "arrivalTime": "2024-03-20T10:15:00Z",
      "queuePosition": 1,
      "estimatedWaitTime": 20,
      "status": "Booked",
      "doctorName": "Dr. Sarah Johnson",
      "serviceName": "Consultation"
    }
  ],
  "lastUpdated": "2024-03-20T10:30:00Z"
}
```

---

### 3. Queue Analytics
**GET** `/clinic/{clinicId}/queue-analytics`  
Provides detailed queue analytics including peak times, hourly data, and performance metrics.

| Parameter | In   | Type   | Required | Description            |
|-----------|------|--------|----------|------------------------|
| clinicId  | path | string | ✓        | The clinic identifier  |

**Response Example**
```json
{
  "clinicId": "string",
  "date": "2024-03-20",
  "peakQueueTime": "10:00",
  "maxQueueLength": 8,
  "averageServiceTime": 20,
  "totalPatientsServed": 15,
  "hourlyQueueData": [
    {
      "hour": 9,
      "queueLength": 3,
      "avgWaitTime": 15
    }
  ]
}
```

---

### 4. Patient Check-in
**POST** `/patient/check-in`  
Checks in a patient and adds them to the waiting queue.

| Field         | Type   | Required | Description                     |
|---------------|--------|----------|---------------------------------|
| patientId     | string | ✓        | Patient identifier              |
| appointmentId | string | ✓        | Appointment identifier          |
| notes         | string | ✗        | Optional arrival notes          |

**Request Example**
```json
{
  "patientId": "string",
  "appointmentId": "string",
  "notes": "Patient arrived early"
}
```

**Response Example**
```json
{
  "success": true,
  "message": "Patient checked in successfully",
  "data": {
    "appointmentId": "string",
    "patientArrivalTime": "2024-03-20T10:15:00Z"
  },
  "affectedIds": ["appointmentId"]
}
```

---

### 5. Emergency Booking
**POST** `/emergency-booking`  
Creates a high-priority emergency appointment with immediate availability.

| Field      | Type   | Required | Description                                                    |
|------------|--------|----------|----------------------------------------------------------------|
| patientId  | string | ✓        | Patient identifier                                             |
| clinicId   | string | ✓        | Clinic identifier                                              |
| branchId   | string | ✓        | Branch identifier                                              |
| serviceId  | string | ✓        | Medical service identifier                                     |
| doctorId   | string | ✗        | Preferred doctor identifier                                    |
| reason     | string | ✓        | Emergency reason                                               |
| notes      | string | ✗        | Additional notes                                               |
| priority   | enum   | ✓        | `high` \| `urgent` \| `critical`                               |

**Request Example**
```json
{
  "patientId": "string",
  "clinicId": "string",
  "branchId": "string",
  "serviceId": "string",
  "doctorId": "string",
  "reason": "Severe chest pain",
  "notes": "Patient needs immediate attention",
  "priority": "urgent"
}
```

**Response Example**
```json
{
  "success": true,
  "message": "Emergency appointment created successfully",
  "data": {
    "appointmentId": "string",
    "queuePosition": 1,
    "estimatedWaitTime": 5
  },
  "affectedIds": ["appointmentId"]
}
```

---

### 6. Bulk Status Update
**PUT** `/bulk-status-update`  
Updates the status for multiple appointments simultaneously.

| Field          | Type     | Required | Description                                 |
|----------------|----------|----------|---------------------------------------------|
| appointmentIds | string[] | ✓        | Array of appointment identifiers            |
| status         | enum     | ✓        | `Completed` \| `Booked` \| `In-progress` \| `Cancelled` \| `No-show` |
| notes          | string   | ✗        | Optional notes added to each appointment    |
| reason         | string   | ✓        | Reason for the bulk update                  |

**Request Example**
```json
{
  "appointmentIds": ["string1", "string2"],
  "status": "Cancelled",
  "notes": "System maintenance",
  "reason": "Emergency closure"
}
```

**Response Example**
```json
{
  "success": true,
  "message": "Successfully updated 2 appointments",
  "data": {
    "modifiedCount": 2
  },
  "affectedIds": ["string1", "string2"]
}
```

---

### 7. Quick Patient Lookup
**POST** `/patient/quick-lookup`  
Performs a fast patient search by name, phone, or medical file number.

| Field     | Type   | Required | Description                       |
|-----------|--------|----------|-----------------------------------|
| searchTerm| string | ✓        | Name, phone, or MRN fragment      |
| clinicId  | string | ✓        | Clinic scope for search           |
| limit     | number | ✗        | Max results (default 10)          |

**Request Example**
```json
{
  "searchTerm": "Ahmed",
  "clinicId": "string",
  "limit": 10
}
```

**Response Example**
```json
[
  {
    "patientId": "string",
    "fullNameAr": "أحمد محمد",
    "fullNameEn": "Ahmed Mohammed",
    "phone": "1234567890",
    "medicalFileNumber": "MRN001",
    "lastAppointmentDate": "2024-03-19T14:30:00Z",
    "hasActiveAppointment": true,
    "currentAppointmentStatus": "Booked"
  }
]
```

---

### 8. One-Click Operations
**POST** `/one-click-operation`  
Performs common receptionist actions in a single call.

| Field        | Type | Required | Description                                                                                               |
|--------------|------|----------|-----------------------------------------------------------------------------------------------------------|
| operation    | enum | ✓        | `mark-present` \| `mark-no-show` \| `cancel` \| `reschedule`                                              |
| appointmentId| string | ✓      | Appointment identifier                                                                                    |
| newDate      | string | ✗      | Required when `operation` is `reschedule` (ISO date)                                                      |
| newTime      | string | ✗      | Required when `operation` is `reschedule` (HH:mm)                                                         |
| reason       | string | ✗      | Optional reason or note                                                                                   |

**Request Example**
```json
{
  "operation": "mark-present",
  "appointmentId": "string",
  "reason": "Patient arrived"
}
```

**Response Example**
```json
{
  "success": true,
  "message": "Operation 'mark-present' completed successfully",
  "data": {
    "appointmentId": "string",
    "updatedStatus": "present",
    "timestamp": "2024-03-20T10:30:00Z"
  },
  "affectedIds": ["appointmentId"]
}
```

---

## Error Responses
All endpoints return a standardized error payload on failure:

```json
{
  "success": false,
  "message": "Detailed error message",
  "errorCode": "APPOINTMENT_NOT_FOUND",
  "timestamp": "2024-03-20T10:30:00Z"
}
```

| Error Code              | Description                       |
|-------------------------|-----------------------------------|
| APPOINTMENT_NOT_FOUND   | Appointment does not exist        |
| PATIENT_NOT_FOUND       | Patient does not exist            |
| CLINIC_NOT_FOUND        | Clinic does not exist             |
| UNAUTHORIZED            | Invalid or missing token          |
| FORBIDDEN               | Insufficient permissions          |
| VALIDATION_ERROR        | Invalid request data              |
| CONFLICT                | Resource conflict                 |
| INTERNAL_ERROR          | Server error                      |

---

## Rate Limiting
| Endpoint Category        | Limit                 |
|--------------------------|-----------------------|
| Overview / Queue         | 60 req / minute       |
| Action (check-in, bulk)  | 30 req / minute       |
| Search (patient lookup)  | 120 req / minute      |

---

## Caching Policy
| Endpoint              | TTL            |
|-----------------------|----------------|
| Clinic overview       | 30 seconds     |
| Waiting room          | 15 seconds     |
| Queue analytics       | 5 minutes      |
| Patient lookup        | 2 minutes      |

---

## Real-time Updates (Polling Example)
```javascript
// Poll clinic overview every 30 s
setInterval(async () => {
  const res = await fetch('/api/dashboard/clinic/123/overview', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  updateDashboardUI(data);
}, 30000);

// Poll waiting room every 15 s
setInterval(async () => {
  const res = await fetch('/api/dashboard/clinic/123/waiting-room', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  updateWaitingRoomUI(data);
}, 15000);
```

---

## Integration Example (TypeScript)
```typescript
class DashboardAPI {
  private base = 'https://api.tebx.com/dashboard';
  constructor(private token: string) {}

  private async request(path: string, init: RequestInit = {}) {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...(init.headers || {})
      }
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  getClinicOverview = (clinicId: string) =>
    this.request(`/clinic/${clinicId}/overview`);

  checkInPatient = (patientId: string, appointmentId: string, notes?: string) =>
    this.request('/patient/check-in', {
      method: 'POST',
      body: JSON.stringify({ patientId, appointmentId, notes })
    });

  createEmergencyBooking = (payload: Record<string, any>) =>
    this.request('/emergency-booking', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
}
```

---

## Support
For help:
- Refer to the in-code docs (`src/dashboard/README.md`)
- Review unit tests (`src/dashboard/dashboard.service.spec.ts`)
- Create an issue on GitHub or contact the TebX backend team.

---

**TebX Dashboard API** – Powering efficient healthcare reception operations.
