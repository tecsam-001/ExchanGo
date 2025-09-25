# Working Hours API Endpoints

This document describes the API endpoints for managing working hours of the authenticated user's office.

## Authentication

All endpoints require JWT Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

## Base URL
```
/v1/working-hours
```

---

## GET Working Hours

### Endpoint
```http
GET /v1/working-hours
```

### Description
Retrieves the working hours for the authenticated user's office for all days of the week.

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request
No request body required.

### Success Response (200 OK)
```json
[
  {
    "id": "working-hour-uuid-1",
    "dayOfWeek": "MONDAY",
    "isActive": true,
    "fromTime": "09:00",
    "toTime": "17:00",
    "hasBreak": true,
    "breakFromTime": "12:00",
    "breakToTime": "13:00",
    "officeId": "office-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  {
    "id": "working-hour-uuid-2",
    "dayOfWeek": "TUESDAY",
    "isActive": true,
    "fromTime": "08:30",
    "toTime": "16:30",
    "hasBreak": false,
    "breakFromTime": null,
    "breakToTime": null,
    "officeId": "office-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  },
  {
    "id": "working-hour-uuid-3",
    "dayOfWeek": "WEDNESDAY",
    "isActive": false,
    "fromTime": "00:00",
    "toTime": "00:00",
    "hasBreak": false,
    "breakFromTime": null,
    "breakToTime": null,
    "officeId": "office-uuid",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
  // ... continues for all 7 days of the week
]
```

### Error Responses

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "No office found for the authenticated user",
  "error": "Not Found"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the working hour record |
| `dayOfWeek` | string | Day of the week (`MONDAY`, `TUESDAY`, etc.) |
| `isActive` | boolean | Whether the office is open on this day |
| `fromTime` | string | Opening time in `HH:MM` format (24-hour) |
| `toTime` | string | Closing time in `HH:MM` format (24-hour) |
| `hasBreak` | boolean | Whether there's a break period |
| `breakFromTime` | string\|null | Break start time in `HH:MM` format |
| `breakToTime` | string\|null | Break end time in `HH:MM` format |
| `officeId` | string | ID of the office these working hours belong to |
| `createdAt` | string | ISO timestamp of creation |
| `updatedAt` | string | ISO timestamp of last update |

### Example JavaScript/TypeScript Usage

```javascript
// Fetch working hours
const getWorkingHours = async () => {
  try {
    const response = await fetch('/v1/working-hours', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch working hours');
    }
    
    const workingHours = await response.json();
    return workingHours;
  } catch (error) {
    console.error('Error fetching working hours:', error);
    throw error;
  }
};
```

---

## UPDATE Working Hours

### Endpoint
```http
PATCH /v1/working-hours
```

### Description
Updates the working hours for the authenticated user's office. You can update one or multiple days in a single request.

### Headers
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### Request Body
```json
{
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "isActive": true,
      "fromTime": "09:00",
      "toTime": "17:00",
      "hasBreak": true,
      "breakFromTime": "12:00",
      "breakToTime": "13:00"
    },
    {
      "dayOfWeek": "TUESDAY",
      "isActive": true,
      "fromTime": "08:30",
      "toTime": "16:30",
      "hasBreak": false
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "isActive": false
    }
  ]
}
```

### Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workingHours` | array | Yes | Array of working hour objects to update |
| `workingHours[].dayOfWeek` | string | Yes | Day of the week (`MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`) |
| `workingHours[].isActive` | boolean | Yes | Whether the office is open on this day |
| `workingHours[].fromTime` | string | Conditional | Opening time in `HH:MM` format. Required if `isActive` is `true` |
| `workingHours[].toTime` | string | Conditional | Closing time in `HH:MM` format. Required if `isActive` is `true` |
| `workingHours[].hasBreak` | boolean | No | Whether there's a break period (default: `false`) |
| `workingHours[].breakFromTime` | string | Conditional | Break start time in `HH:MM` format. Required if `hasBreak` is `true` |
| `workingHours[].breakToTime` | string | Conditional | Break end time in `HH:MM` format. Required if `hasBreak` is `true` |

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Working hours updated successfully",
  "data": [
    {
      "id": "working-hour-uuid-1",
      "dayOfWeek": "MONDAY",
      "isActive": true,
      "fromTime": "09:00",
      "toTime": "17:00",
      "hasBreak": true,
      "breakFromTime": "12:00",
      "breakToTime": "13:00",
      "officeId": "office-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
    // ... other updated working hours
  ]
}
```

### Error Responses

#### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "No office found for the authenticated user",
  "error": "Not Found"
}
```

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Break times are required when hasBreak is true for MONDAY",
  "error": "Bad Request"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Validation Rules

1. **Break Times**: If `hasBreak` is `true`, both `breakFromTime` and `breakToTime` are required
2. **Break Within Working Hours**: Break times must be within the working hours (`fromTime` to `toTime`)
3. **Break Order**: `breakFromTime` must be before `breakToTime`
4. **Working Hours**: If `isActive` is `true`, both `fromTime` and `toTime` are required
5. **Time Format**: All times must be in `HH:MM` format (24-hour)

### Example JavaScript/TypeScript Usage

```javascript
// Update working hours
const updateWorkingHours = async (workingHoursData) => {
  try {
    const response = await fetch('/v1/working-hours', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        workingHours: workingHoursData
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update working hours');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating working hours:', error);
    throw error;
  }
};

// Example usage
const newWorkingHours = [
  {
    dayOfWeek: 'MONDAY',
    isActive: true,
    fromTime: '09:00',
    toTime: '17:00',
    hasBreak: true,
    breakFromTime: '12:00',
    breakToTime: '13:00'
  },
  {
    dayOfWeek: 'FRIDAY',
    isActive: true,
    fromTime: '09:00',
    toTime: '15:00',
    hasBreak: false
  }
];

updateWorkingHours(newWorkingHours)
  .then(result => console.log('Updated successfully:', result))
  .catch(error => console.error('Update failed:', error));
```

## Common Use Cases

### 1. Update Single Day
```json
{
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "isActive": true,
      "fromTime": "10:00",
      "toTime": "18:00",
      "hasBreak": false
    }
  ]
}
```

### 2. Close Office on Specific Day
```json
{
  "workingHours": [
    {
      "dayOfWeek": "SUNDAY",
      "isActive": false
    }
  ]
}
```

### 3. Update Multiple Days with Different Schedules
```json
{
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "isActive": true,
      "fromTime": "09:00",
      "toTime": "17:00",
      "hasBreak": true,
      "breakFromTime": "12:00",
      "breakToTime": "13:00"
    },
    {
      "dayOfWeek": "FRIDAY",
      "isActive": true,
      "fromTime": "09:00",
      "toTime": "15:00",
      "hasBreak": false
    },
    {
      "dayOfWeek": "SATURDAY",
      "isActive": false
    }
  ]
}
```

## Notes for Frontend Implementation

1. **Always include the JWT token** in the Authorization header
2. **Handle 404 errors** gracefully - user might not have an office yet
3. **Validate times on frontend** before sending to prevent unnecessary API calls
7. **Time format is 24-hour** (`HH:MM`) - convert from/to 12-hour format if needed for UI
