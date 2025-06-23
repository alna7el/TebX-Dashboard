# TebX Dashboard Module

## Overview
The Dashboard Module delivers **real-time operational insight** for healthcare‐facility receptionists. It aggregates data from appointments, patients, doctors, and clinics to present an up-to-the-second picture of clinic activity and provides quick-action tooling that streamlines front-desk workflows.

## Features
### 🏥 Real-time Clinic Overview
* **Today's Appointment Summary** – live counts by status  
* **Patient Flow Metrics** – waiting, with-doctor, arrivals, average wait time  
* **Doctor Status Board** – availability, workload, next slot  
* **Live Updates** – designed for polling or WebSockets

### 👥 Patient Check-in Management
* **Waiting Room Queue** – ordered queue with arrival timestamps & position  
* **Check-in Workflow** – mark arrival, auto-queue, capture notes  
* **Queue Analytics** – peak times, hourly stats, service time averages  
* **Patient Status Pipeline** – arrival → waiting → in-progress → completed

### ⚡ Quick Action Dashboard
* **Emergency Booking** – create high-priority appointments in seconds  
* **Bulk Operations** – update status across many appointments  
* **Quick Patient Lookup** – fuzzy search by name, phone, MRN  
* **One-click Operations** – reschedule, cancel, mark-present / no-show

---

## API Endpoints

### Clinic Overview
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/dashboard/clinic/:clinicId/overview` | Real-time clinic overview |
| GET | `/dashboard/clinic/:clinicId/waiting-room` | Current waiting queue |
| GET | `/dashboard/clinic/:clinicId/queue-analytics` | Queue performance analytics |

### Patient Check-in
| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/dashboard/patient/check-in` | Check patient in & add to queue |

### Quick Actions
| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/dashboard/emergency-booking` | Create emergency appointment |
| PUT  | `/dashboard/bulk-status-update` | Bulk status update |
| POST | `/dashboard/patient/quick-lookup` | Fast patient search |
| POST | `/dashboard/one-click-operation` | Reschedule / cancel / mark-present / mark-no-show |

### Representative Responses
#### Clinic Overview (`GET /dashboard/clinic/:clinicId/overview`)
{see user example}

#### Waiting Room (`GET /dashboard/clinic/:clinicId/waiting-room`)
{see user example}

---

## Data Models (DTOs)
| DTO | Purpose |
|-----|---------|
| `ClinicOverviewDto` | Full dashboard payload |
| `AppointmentSummaryDto` | Counts by appointment status |
| `PatientFlowDto` | Live flow metrics |
| `DoctorStatusDto` | Doctor availability & load |
| `WaitingRoomDto` | Current queue snapshot |
| `QueuePatientDto` | Individual queued patient |
| `QueueAnalyticsDto` | Performance analytics |
| `EmergencyBookingDto` | Emergency creation payload |
| `BulkStatusUpdateDto` | Mass status change |
| `QuickPatientLookupDto` / `QuickPatientResultDto` | Search request / response |
| `OneClickOperationDto` | Single operation params |
| `QuickActionResponseDto` | Standard quick-action reply |

---

## Usage Examples

```ts
// Fetch clinic overview
const overview = await fetch('/api/dashboard/clinic/123/overview').then(r => r.json());

// Check-in patient
await fetch('/api/dashboard/patient/check-in', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ patientId:'456', appointmentId:'789', notes:'Arrived' })
});

// Emergency booking
await fetch('/api/dashboard/emergency-booking', {
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    patientId:'456', clinicId:'123', branchId:'111',
    serviceId:'222', reason:'Severe pain', priority:'urgent'
  })
});
```

### Real-time Updates
```ts
// Simple polling
setInterval(async () => {
  const data = await fetch('/api/dashboard/clinic/123/overview').then(r=>r.json());
  updateUI(data);
}, 30000);
```

---

## Performance Considerations
* **Caching:** overview 30 s, queue 15 s, lookup 2 m, analytics 5 m  
* **Indexes:** `clinic`, `date`, `status`, `patient_arrival_time`  
* **Aggregation pipelines** for summaries; pagination for large result sets  
* Designed for stateless horizontal scaling.

---

## Error Handling
Standard error schema:
```json
{
  "success": false,
  "message": "Detailed error message",
  "errorCode": "APPOINTMENT_NOT_FOUND",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

---

## Security
* JWT authentication via Keycloak
* **Receptionist** role required
* Clinic-scoped data access
* Patient privacy enforced

---

## Testing Strategy
* **Unit Tests:** services, transformations, edge cases (95 %+)  
* **Integration Tests:** controllers, DB, auth (90 %+)  
* **Performance & load** profiling for queue endpoints

---

## Monitoring & Alerts
* Metrics: response time, DB queries, error counts, active users  
* Alerts: high error rate, slow responses, DB connectivity, auth failures

---

## Future Enhancements
* WebSocket push updates  
* Predictive wait-time analytics  
* Mobile-app optimized endpoints  
* Redis caching & DB sharding for scale

---

## Contributing
1. Follow existing patterns  
2. Add tests & docs  
3. Mind performance & security  
4. Open PRs with clear description

---

## Support
Consult API docs, tests, or contact the TebX backend team.

---

**TebX Dashboard Module** – Empowering receptionists with instant insight and rapid actions.
