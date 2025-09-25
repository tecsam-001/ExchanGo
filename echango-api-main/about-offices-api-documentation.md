# About Offices API Documentation

## Overview
The About Offices endpoint provides comprehensive information about offices registered on the platform with advanced filtering capabilities. This endpoint is similar to the office-engagement endpoint but focuses on office metadata and registration information.

## Endpoint
```
GET /api/v1/admins/about-offices
```

## Authentication
This endpoint requires admin authentication via JWT token.

## Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `countryId` | string | No | Filter by country ID | `country-uuid-123` |
| `cityIds` | string | No | Filter by multiple city IDs (comma-separated) | `city-1,city-2,city-3` |
| `status` | enum | No | Filter by office status | `ACCEPTED` |
| `duration` | enum | No | Filter by duration on platform | `LAST_1_MONTH` |
| `page` | number | No | Page number for pagination (default: 1) | `1` |
| `limit` | number | No | Number of items per page (default: 10) | `20` |
| `search` | string | No | Search term for office name or city | `Exchange Office` |

### Status Filter Values
- `REQUESTED` - Office registration requested
- `ON_HOLD` - Office registration on hold
- `ACCEPTED` - Office registration accepted (default if no request found)
- `REJECTED` - Office registration rejected

### Duration Filter Values
- `ALL_TIME` - All offices regardless of registration date
- `LAST_7_DAYS` - Offices registered in the last 7 days
- `LAST_1_MONTH` - Offices registered in the last 30 days
- `LAST_6_MONTHS` - Offices registered in the last 180 days

## Response Structure

```json
{
  "data": [
    {
      "officeName": "Exchange Office Downtown",
      "city": "Casablanca",
      "country": "Morocco",
      "registrationDate": "2024-01-15T10:30:00Z",
      "status": "ACCEPTED",
      "duration": 45
    }
  ],
  "totalOffices": 150,
  "filteredCount": 10,
  "appliedFilters": {
    "countryId": "country-uuid",
    "cityIds": ["city-uuid-1", "city-uuid-2"],
    "status": "ACCEPTED",
    "duration": "LAST_1_MONTH",
    "search": "Exchange"
  },
  "pagination": {
    "currentPage": 1,
    "pageSize": 10,
    "totalPages": 15,
    "totalItems": 150,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Response Fields

### Office Data Fields
- `officeName`: Name of the office
- `city`: City name where the office is located
- `country`: Country name where the office is located
- `registrationDate`: Date when the office was registered on the platform
- `status`: Current status of the office (from requests table, defaults to ACCEPTED)
- `duration`: Number of days since registration

### Metadata Fields
- `totalOffices`: Total number of offices matching the filters
- `filteredCount`: Number of offices returned in the current page
- `appliedFilters`: Summary of all applied filters
- `pagination`: Pagination information including current page, total pages, etc.

## Example Requests

### Basic Request
```bash
curl -X GET "http://localhost:3000/api/v1/admins/about-offices?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Filter by Country and Status
```bash
curl -X GET "http://localhost:3000/api/v1/admins/about-offices?countryId=morocco-uuid&status=ACCEPTED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Filter by Multiple Cities and Duration
```bash
curl -X GET "http://localhost:3000/api/v1/admins/about-offices?cityIds=casablanca-uuid,rabat-uuid&duration=LAST_1_MONTH" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search with Pagination
```bash
curl -X GET "http://localhost:3000/api/v1/admins/about-offices?search=exchange&page=2&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Status Logic
The endpoint determines office status using the following logic:
1. Checks the requests table for the office's latest request status
2. If no request is found, defaults to "ACCEPTED"
3. Status reflects the current state of the office registration process

## Duration Calculation
Duration is calculated as the number of days between the office's registration date (`createdAt`) and the current date.

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid query parameters",
  "error": "Bad Request"
}
```

## Notes
- All date filters are inclusive
- Search is case-insensitive and searches both office name and city name
- Pagination starts from page 1
- Maximum limit per page is typically 100 (configurable)
- The endpoint is optimized for admin dashboard usage with comprehensive filtering options
