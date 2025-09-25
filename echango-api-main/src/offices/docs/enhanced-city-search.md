# Enhanced City Search with Office Information

## Overview

The enhanced `searchCitiesWithNumberOfOfficeInCity` service provides comprehensive search functionality for cities with detailed office information, statistics, and flexible filtering options.

## Features

### 🔍 **Advanced Search Capabilities**
- **Text-based city search** with fuzzy matching
- **Pagination support** with configurable page size
- **Multiple sorting options** (city name, office count, newest office, etc.)
- **Comprehensive filtering** by office status, currencies, and counts

### 📊 **Rich Statistics**
- Total, active, verified, and featured office counts
- Available currencies per city
- Currently open offices count
- Newest office creation date
- Average ratings (when available)

### 🎯 **Flexible Data Inclusion**
- **Simplified office data** for performance
- **Detailed office information** when needed
- **Working hours integration** with real-time open status
- **Currency availability** tracking

### ⚡ **Performance Optimizations**
- **Efficient database queries** with proper joins
- **Parallel processing** of city data
- **Execution time tracking** for monitoring
- **Comprehensive error handling** and logging

## API Endpoints

### Enhanced Search Endpoint
```
GET /api/v1/offices/search-by-city
```

### Legacy Endpoint (Deprecated)
```
GET /api/v1/offices/search-by-city-legacy?query=cityName
```

## Request Parameters

### SearchCitiesWithOfficesDto

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ | - | Search query for city names |
| `page` | number | ❌ | 1 | Page number (1-based) |
| `limit` | number | ❌ | 10 | Items per page (max 50) |
| `sortBy` | enum | ❌ | `officeCount` | Sort criteria |
| `sortOrder` | enum | ❌ | `DESC` | Sort direction |
| `minOffices` | number | ❌ | - | Minimum office count filter |
| `maxOffices` | number | ❌ | - | Maximum office count filter |
| `onlyActiveOffices` | boolean | ❌ | false | Filter cities with active offices only |
| `onlyVerifiedOffices` | boolean | ❌ | false | Filter cities with verified offices only |
| `onlyFeaturedOffices` | boolean | ❌ | false | Filter cities with featured offices only |
| `includeOfficeDetails` | boolean | ❌ | false | Include full office information |
| `includeStatistics` | boolean | ❌ | true | Include office statistics |
| `availableCurrencies` | string[] | ❌ | - | Filter by currency availability |

### Sort Options

| Value | Description |
|-------|-------------|
| `cityName` | Sort by city name alphabetically |
| `officeCount` | Sort by total number of offices |
| `newestOffice` | Sort by most recent office creation |
| `mostVerified` | Sort by number of verified offices |
| `mostFeatured` | Sort by number of featured offices |

## Response Structure

### SearchCitiesWithOfficesResponse

```typescript
{
  data: CityWithOfficesResponse[],
  meta: {
    page: number,
    limit: number,
    totalCities: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  },
  summary: {
    totalOfficesFound: number,
    totalActiveOffices: number,
    totalVerifiedOffices: number,
    searchQuery: string,
    executionTimeMs: number
  }
}
```

### CityWithOfficesResponse

```typescript
{
  city: City,
  statistics: {
    totalOffices: number,
    activeOffices: number,
    verifiedOffices: number,
    featuredOffices: number,
    availableCurrencies: string[],
    currentlyOpenOffices: number,
    newestOfficeDate?: Date,
    averageRating?: number
  },
  offices?: SimplifiedOffice[],      // When includeOfficeDetails = false
  detailedOffices?: Office[]         // When includeOfficeDetails = true
}
```

## Example Usage

### Basic Search
```bash
GET /api/v1/offices/search-by-city?query=Casa&page=1&limit=10
```

### Advanced Search with Filters
```bash
GET /api/v1/offices/search-by-city?query=Rabat&sortBy=officeCount&sortOrder=DESC&onlyActiveOffices=true&minOffices=5&availableCurrencies=USD,EUR
```

### Detailed Office Information
```bash
GET /api/v1/offices/search-by-city?query=Marrakech&includeOfficeDetails=true&onlyVerifiedOffices=true
```

## Error Handling

The service provides comprehensive error handling with structured error responses:

### Validation Errors (400)
```json
{
  "status": 400,
  "errors": {
    "query": "Search query is required and cannot be empty"
  }
}
```

### Business Logic Errors (400)
```json
{
  "status": 400,
  "errors": {
    "offices": "Minimum offices cannot be greater than maximum offices"
  }
}
```

### Internal Server Errors (500)
```json
{
  "status": 500,
  "errors": {
    "search": "Failed to search cities with offices"
  }
}
```

## Performance Considerations

### Optimization Features
- **Database query optimization** with efficient joins
- **Parallel processing** of city statistics
- **Selective data loading** based on request parameters
- **Execution time monitoring** for performance tracking

### Recommended Usage
- Use `includeOfficeDetails=false` for list views (better performance)
- Use `includeOfficeDetails=true` only when full office data is needed
- Implement reasonable pagination limits (max 50 items per page)
- Cache frequently accessed city searches on the client side

## Migration from Legacy Endpoint

### Legacy Format
```typescript
Array<{
  city: City;
  numberOfOffices: number;
  offices: Office[];
}>
```

### Enhanced Format
```typescript
{
  data: CityWithOfficesResponse[];
  meta: SearchMetadata;
  summary: SearchSummary;
}
```

### Migration Steps
1. Update API calls to use new endpoint structure
2. Handle pagination metadata in responses
3. Utilize enhanced statistics for better UX
4. Implement error handling for structured error responses
5. Remove dependency on legacy endpoint

## Logging and Monitoring

The service provides comprehensive logging:
- **Request logging** with search parameters
- **Performance logging** with execution times
- **Error logging** with stack traces
- **Debug logging** for development troubleshooting

## Future Enhancements

Planned improvements:
- **Geospatial search** integration
- **Advanced analytics** and trending data
- **Caching layer** for frequently searched cities
- **Real-time updates** for office status changes
- **Machine learning** for search result optimization
