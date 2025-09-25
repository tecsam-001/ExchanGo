# Nearby Offices API Documentation

## Overview
The Nearby Offices API allows you to find exchange offices within a specified radius of a given location, with comprehensive filtering and currency conversion capabilities.

## Endpoint
```
GET /api/v1/offices/nearby
```

## Authentication
- **Type**: Anonymous (no authentication required)
- **Guards**: `AuthGuard('anonymous')`

## Request Parameters

### Required Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `latitude` | number | Latitude coordinate of the search center | `33.5731` |
| `longitude` | number | Longitude coordinate of the search center | `-7.5898` |
| `radiusInKm` | number | Search radius in kilometers | `10` |

### Optional Filter Parameters

#### Currency Conversion
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `baseCurrency` | string | Base currency code or ID | `EUR` |
| `targetCurrency` | string | Target currency code or ID | `MAD` |
| `targetCurrencyRate` | number | Target currency rate for conversion | `10.85` |

#### Available Currencies Filter
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `availableCurrencies` | string[] | Array of currency codes to filter by | `["USD", "EUR", "GBP"]` |

#### Trend Filters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `isPopular` | boolean | Filter for popular exchanges | `false` |
| `isFeatured` | boolean | Filter for featured offices | `undefined` |
| `isVerified` | boolean | Filter for verified offices | `undefined` |
| `mostSearched` | boolean | Filter for most searched offices | `false` |
| `nearest` | boolean | Sort by nearest distance | `false` |

#### Office Status Filters
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `isActive` | boolean | Filter for active offices | `undefined` |
| `isOpen` | boolean | Filter for currently open offices | `true` |
| `showOnlyOpenNow` | boolean | Show only currently open offices | `false` |

## Example Requests

### Basic Request
```javascript
const response = await fetch('/api/v1/offices/nearby?' + new URLSearchParams({
  latitude: '33.5731',
  longitude: '-7.5898',
  radiusInKm: '10'
}));
```

### With Currency Conversion
```javascript
const params = new URLSearchParams({
  latitude: '33.5731',
  longitude: '-7.5898', 
  radiusInKm: '10',
  baseCurrency: 'EUR',
  targetCurrency: 'MAD',
  targetCurrencyRate: '10.85'
});

const response = await fetch(`/api/v1/offices/nearby?${params}`);
```

### With Filters (Based on UI)
```javascript
const params = new URLSearchParams({
  latitude: '33.5731',
  longitude: '-7.5898',
  radiusInKm: '10',
  // Available Currencies Filter
  availableCurrencies: 'USD,EUR,AUD,CAD,GBP,CHF,SAR,QAR',
  // Trend Filters
  isPopular: 'true',        // Popular Exchange
  isVerified: 'true',       // Verified Offices  
  // Office Hours Filter
  showOnlyOpenNow: 'true'   // Show only currently open offices
});

const response = await fetch(`/api/v1/offices/nearby?${params}`);
```

## Response Format

### Success Response (200 OK)
```json
[
  {
    "id": "uuid-string",
    "officeName": "Al Jalal Safetysa",
    "address": "R/001 43 Oulad Khallouf, Marrakech-Safi, Morocco",
    "primaryPhoneNumber": "+212-xxx-xxx-xxx",
    "whatsappNumber": "+212-xxx-xxx-xxx",
    "email": "office@example.com",
    "location": {
      "type": "Point",
      "coordinates": [-7.5898, 33.5731]
    },
    "distanceInKm": 2.5,
    "city": {
      "id": "city-uuid",
      "name": "Casablanca",
      "nameAr": "الدار البيضاء"
    },
    "country": {
      "id": "country-uuid", 
      "name": "Morocco",
      "nameAr": "المغرب"
    },
    "logo": {
      "id": "file-uuid",
      "path": "https://backend.domain.com/api/v1/files/logo.jpg"
    },
    "images": [
      {
        "id": "image-uuid-1",
        "path": "https://backend.domain.com/api/v1/files/office1.jpg"
      },
      {
        "id": "image-uuid-2", 
        "path": "https://backend.domain.com/api/v1/files/office2.jpg"
      },
      {
        "id": "placeholder-uuid-1",
        "path": "https://backend.domain.com/api/v1/files/place-holder.png"
      },
      {
        "id": "placeholder-uuid-2",
        "path": "https://backend.domain.com/api/v1/files/place-holder.png"
      },
      {
        "id": "placeholder-uuid-3", 
        "path": "https://backend.domain.com/api/v1/files/place-holder.png"
      }
    ],
    "rates": [
      {
        "id": "rate-uuid",
        "baseCurrency": {
          "id": "currency-uuid",
          "code": "EUR",
          "name": "Euro"
        },
        "targetCurrency": {
          "id": "currency-uuid", 
          "code": "MAD",
          "name": "Moroccan Dirham"
        },
        "buyRate": 10.80,
        "sellRate": 10.90,
        "isActive": true
      }
    ],
    "workingHours": [
      {
        "dayOfWeek": "MONDAY",
        "openTime": "09:00:00",
        "closeTime": "17:00:00",
        "isOpen": true
      }
    ],
    "todayWorkingHours": {
      "dayOfWeek": "MONDAY", 
      "openTime": "09:00:00",
      "closeTime": "17:00:00",
      "isOpen": true
    },
    "isActive": true,
    "isVerified": true,
    "isFeatured": false,
    "equivalentValue": 108.5,
    "slug": "al-jalal-safetysa",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T14:45:00Z"
  }
]
```

## Frontend Integration Guide

### 1. Filter Implementation

Based on your UI, here's how to map the filters:

#### Available Currencies
```javascript
const selectedCurrencies = ['USD', 'EUR', 'AUD', 'CAD', 'GBP', 'CHF', 'SAR', 'QAR'];
// Send as comma-separated string
params.append('availableCurrencies', selectedCurrencies.join(','));
```

#### Trend Filters
```javascript
// Popular Exchange (🔥Popular Exchange)
if (isPopularSelected) {
  params.append('isPopular', 'true');
}

// Verified Offices (✅Verified Offices)  
if (isVerifiedSelected) {
  params.append('isVerified', 'true');
}

// Newest Offices (🆕Newest Offices)
// Note: This is handled by sorting, not filtering
```

#### Office Hours
```javascript
// Show only currently open offices checkbox
if (showOnlyOpenOffices) {
  params.append('showOnlyOpenNow', 'true');
}
```

### 2. Complete Integration Example

```javascript
class NearbyOfficesService {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getNearbyOffices(location, filters = {}) {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(), 
      radiusInKm: (filters.radiusInKm || 10).toString()
    });

    // Add currency conversion if provided
    if (filters.baseCurrency) params.append('baseCurrency', filters.baseCurrency);
    if (filters.targetCurrency) params.append('targetCurrency', filters.targetCurrency);
    if (filters.targetCurrencyRate) params.append('targetCurrencyRate', filters.targetCurrencyRate.toString());

    // Add available currencies filter
    if (filters.availableCurrencies?.length) {
      params.append('availableCurrencies', filters.availableCurrencies.join(','));
    }

    // Add trend filters
    if (filters.isPopular) params.append('isPopular', 'true');
    if (filters.isVerified) params.append('isVerified', 'true'); 
    if (filters.isFeatured) params.append('isFeatured', 'true');

    // Add office status filters
    if (filters.showOnlyOpenNow) params.append('showOnlyOpenNow', 'true');
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    try {
      const response = await fetch(`${this.baseURL}/api/v1/offices/nearby?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby offices:', error);
      throw error;
    }
  }
}

// Usage Example
const officesService = new NearbyOfficesService('https://your-api-domain.com');

const filters = {
  radiusInKm: 10,
  availableCurrencies: ['USD', 'EUR', 'GBP'],
  isPopular: true,
  isVerified: true, 
  showOnlyOpenNow: true,
  baseCurrency: 'EUR',
  targetCurrency: 'MAD',
  targetCurrencyRate: 10.85
};

const offices = await officesService.getNearbyOffices(
  { latitude: 33.5731, longitude: -7.5898 },
  filters
);
```

## Important Notes

### Images
- **Always 5 images**: Every office will have exactly 5 images in the `images` array
- **Placeholder handling**: Missing images are filled with placeholder images
- **Placeholder path**: `${backendDomain}/api/v1/files/place-holder.png`

### Currency Conversion
- **Rate Direction**: Automatically determined based on MAD currency position
- **Equivalent Value**: Calculated when currency parameters are provided
- **Rate Selection**: BUY rate used when MAD is target currency, SELL rate when MAD is base currency

### Distance
- **distanceInKm**: Always included in response, calculated from search center
- **Sorting**: Results are typically sorted by distance (nearest first)

### Working Hours
- **todayWorkingHours**: Convenient field for today's hours
- **Real-time status**: Use this to determine if office is currently open

### Error Handling
```javascript
// Handle common errors
try {
  const offices = await getNearbyOffices(location, filters);
} catch (error) {
  if (error.message.includes('400')) {
    // Bad request - check parameters
  } else if (error.message.includes('404')) {
    // No offices found or invalid location
  } else if (error.message.includes('500')) {
    // Server error
  }
}
```
