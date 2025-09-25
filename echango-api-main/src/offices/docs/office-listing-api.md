# Office Listing API - City-Specific Office Display

## Overview

The **Office Listing API** is designed specifically for pages that display individual offices within a city, similar to the Rabat exchange offices page shown in your interface. This API provides comprehensive office information including rates, images, working hours, and real-time status.

## Key Differences from City Search API

| Feature | City Search API | Office Listing API |
|---------|----------------|-------------------|
| **Purpose** | Find cities with offices | Display offices in a specific city |
| **Response Focus** | City statistics & summaries | Individual office details |
| **Data Structure** | City-centric with office counts | Office-centric with full details |
| **Use Case** | City discovery & search | Office browsing & selection |

## API Endpoint

```
GET /api/v1/offices/city/{cityName}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cityName` | string | ✅ | Name of the city (e.g., "rabat", "casablanca") |

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 12 | Number of offices per page (optimized for grid layout) |
| `isActive` | boolean | - | Filter by active status |
| `isVerified` | boolean | - | Filter by verified status |
| `isFeatured` | boolean | - | Filter by featured status |
| `availableCurrencies` | string | - | Comma-separated currency codes (e.g., "USD,EUR,GBP") |
| `showOnlyOpenNow` | boolean | - | Show only currently open offices |
| `sortBy` | enum | - | Sort criteria: `name`, `newest`, `verified`, `featured`, `popular` |
| `sortOrder` | enum | ASC | Sort direction: `ASC` or `DESC` |
| `baseCurrency` | string | - | Base currency code (e.g., "MAD", "USD") - **One must be MAD** |
| `targetCurrency` | string | - | Target currency code (e.g., "USD", "EUR") - **One must be MAD** |
| `targetCurrencyRate` | number | - | Amount to convert (e.g., 100) |
| `rateDirection` | enum | - | Rate direction: `BUY`/`SELL` (auto-determined based on MAD position) |

## Response Structure

```typescript
{
  offices: Office[],           // Array of office objects with full details
  totalCount: number,          // Total number of offices (after filtering)
  cityInfo: {                  // City summary information
    name: string,
    totalOffices: number,
    activeOffices: number,
    verifiedOffices: number,
    featuredOffices: number,
    availableCurrencies: string[]
  },
  pagination: {                // Pagination metadata
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean
  }
}
```

### Office Object Structure

Each office in the `offices` array contains:

```typescript
{
  id: string,
  officeName: string,
  address: string,
  primaryPhoneNumber: string,
  secondaryPhoneNumber?: string,
  whatsappNumber?: string,
  email?: string,
  slug: string,
  isActive: boolean,
  isVerified: boolean,
  isFeatured: boolean,
  
  // Location & City Info
  city: {
    id: string,
    name: string,
    country: Country
  },
  
  // Visual Assets
  logo?: {
    id: string,
    path: string
  },
  images?: FileEntity[],
  
  // Exchange Rates
  rates?: {
    id: string,
    baseCurrency: Currency,
    targetCurrency: Currency,
    buyRate: number,
    sellRate: number,
    isActive: boolean,
    updatedAt: Date
  }[],
  
  // Working Hours
  workingHours?: {
    dayOfWeek: string,
    fromTime: string,
    toTime: string,
    isOpen: boolean
  }[],
  
  // Real-time Enhancements (added by API)
  isCurrentlyOpen?: boolean,
  todayWorkingHours?: string,

  // Currency Conversion (added when currency parameters provided)
  equivalentValue?: number,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

## Example API Calls

### 1. Basic Office Listing
```bash
GET /api/v1/offices/city/rabat
```

**Response:**
```json
{
  "offices": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "officeName": "Atlas Exchange",
      "address": "4160 Parker Rd. Allentown, New Mexico 31134",
      "primaryPhoneNumber": "+212522123456",
      "slug": "atlas-exchange-rabat",
      "isActive": true,
      "isVerified": true,
      "isFeatured": false,
      "city": {
        "id": "city-123",
        "name": "rabat"
      },
      "rates": [
        {
          "baseCurrency": { "code": "USD", "name": "US Dollar" },
          "targetCurrency": { "code": "MAD", "name": "Moroccan Dirham" },
          "buyRate": 10.15,
          "sellRate": 10.25,
          "isActive": true,
          "updatedAt": "2024-01-15T10:30:00Z"
        }
      ],
      "workingHours": [
        {
          "dayOfWeek": "monday",
          "fromTime": "09:00",
          "toTime": "17:00",
          "isOpen": true
        }
      ],
      "isCurrentlyOpen": true,
      "todayWorkingHours": "09:00 - 17:00",
      "equivalentValue": 1015.0
    }
  ],
  "totalCount": 108,
  "cityInfo": {
    "name": "rabat",
    "totalOffices": 108,
    "activeOffices": 95,
    "verifiedOffices": 67,
    "featuredOffices": 12,
    "availableCurrencies": ["USD", "EUR", "GBP", "CAD", "AUD"]
  },
  "pagination": {
    "page": 1,
    "limit": 12,
    "totalPages": 9,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Filtered and Sorted Listing
```bash
GET /api/v1/offices/city/casablanca?isActive=true&isVerified=true&sortBy=featured&sortOrder=DESC&availableCurrencies=USD,EUR
```

### 3. Currently Open Offices Only
```bash
GET /api/v1/offices/city/rabat?showOnlyOpenNow=true&sortBy=popular&sortOrder=DESC
```

### 4. Paginated Results
```bash
GET /api/v1/offices/city/marrakech?page=2&limit=20&sortBy=newest&sortOrder=DESC
```

### 5. Currency Conversion Examples
```bash
# Convert 100 USD to MAD equivalent (Foreign → MAD: uses BUY rate, auto-swapped)
GET /api/v1/offices/city/casablanca?baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=100

# Convert 1000 MAD to EUR equivalent (MAD → Foreign: uses SELL rate)
GET /api/v1/offices/city/rabat?baseCurrency=MAD&targetCurrency=EUR&targetCurrencyRate=1000

# Find offices with USD rates and calculate equivalent for 500 USD
GET /api/v1/offices/city/tangier?availableCurrencies=USD&baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=500

# Cross-currency not supported - will return error
GET /api/v1/offices/city/fez?baseCurrency=USD&targetCurrency=EUR&targetCurrencyRate=100
```

## Frontend Integration Examples

### React/TypeScript Example

```typescript
interface OfficeListingResponse {
  offices: Office[];
  totalCount: number;
  cityInfo: CityInfo;
  pagination: PaginationInfo;
}

interface CurrencyConversionParams {
  baseCurrency?: string;
  targetCurrency?: string;
  targetCurrencyRate?: number;
  rateDirection?: 'BUY' | 'SELL';
}

const useOfficesInCity = (
  cityName: string,
  filters?: OfficeFilters,
  currencyConversion?: CurrencyConversionParams
) => {
  const [data, setData] = useState<OfficeListingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
        if (filters?.availableCurrencies) params.set('availableCurrencies', filters.availableCurrencies.join(','));
        if (filters?.page) params.set('page', String(filters.page));

        // Add currency conversion parameters
        if (currencyConversion?.baseCurrency) params.set('baseCurrency', currencyConversion.baseCurrency);
        if (currencyConversion?.targetCurrency) params.set('targetCurrency', currencyConversion.targetCurrency);
        if (currencyConversion?.targetCurrencyRate) params.set('targetCurrencyRate', String(currencyConversion.targetCurrencyRate));
        if (currencyConversion?.rateDirection) params.set('rateDirection', currencyConversion.rateDirection);

        const response = await fetch(`/api/v1/offices/city/${cityName}?${params}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch offices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [cityName, filters, currencyConversion]);

  return { data, loading };
};

// Usage in component
const OfficeListingPage = ({ cityName }: { cityName: string }) => {
  const { data, loading } = useOfficesInCity(
    cityName,
    {
      isActive: true,
      page: 1,
      limit: 12
    },
    {
      baseCurrency: 'USD',
      targetCurrency: 'MAD',
      targetCurrencyRate: 100, // Convert 100 USD
      rateDirection: 'BUY'
    }
  );
  
  if (loading) return <div>Loading offices...</div>;
  
  return (
    <div>
      <h1>Exchange Offices in {data?.cityInfo.name}</h1>
      <div className="office-stats">
        <span>{data?.cityInfo.totalOffices} total offices</span>
        <span>{data?.cityInfo.activeOffices} active</span>
        <span>{data?.cityInfo.verifiedOffices} verified</span>
      </div>
      
      <div className="office-grid">
        {data?.offices.map(office => (
          <OfficeCard key={office.id} office={office} />
        ))}
      </div>
      
      <Pagination 
        current={data?.pagination.page}
        total={data?.pagination.totalPages}
        hasNext={data?.pagination.hasNextPage}
        hasPrev={data?.pagination.hasPreviousPage}
      />
    </div>
  );
};
```

### Office Card Component Example

```typescript
const OfficeCard = ({ office }: { office: Office }) => (
  <div className="office-card">
    <div className="office-header">
      {office.logo && <img src={office.logo.path} alt={office.officeName} />}
      <h3>{office.officeName}</h3>
      <div className="badges">
        {office.isVerified && <span className="verified">✓ Verified</span>}
        {office.isFeatured && <span className="featured">⭐ Featured</span>}
        {office.isCurrentlyOpen && <span className="open">🟢 Open</span>}
      </div>
    </div>
    
    <div className="office-info">
      <p>{office.address}</p>
      <p>{office.primaryPhoneNumber}</p>
      {office.todayWorkingHours && (
        <p>Today: {office.todayWorkingHours}</p>
      )}
    </div>
    
    <div className="exchange-rates">
      {office.rates?.slice(0, 3).map(rate => (
        <div key={rate.id} className="rate">
          <span>{rate.baseCurrency.code}/{rate.targetCurrency.code}</span>
          <span>Buy: {rate.buyRate} | Sell: {rate.sellRate}</span>
        </div>
      ))}

      {office.equivalentValue && (
        <div className="equivalent-value">
          <strong>Equivalent: {office.equivalentValue.toFixed(2)} MAD</strong>
        </div>
      )}
    </div>
    
    <button onClick={() => navigateToOffice(office.slug)}>
      Get Direction
    </button>
  </div>
);
```

## Performance Considerations

### Optimizations Included
- **Efficient Pagination**: Default 12 items per page for optimal grid layout
- **Selective Data Loading**: Only essential office data included
- **Real-time Enhancements**: Working hours calculated on-demand
- **Database Optimization**: Proper joins and indexing

### Best Practices
- Use reasonable page sizes (12-24 for grid layouts)
- Implement client-side caching for frequently accessed cities
- Consider infinite scroll for mobile interfaces
- Cache city statistics separately from office data

## Error Handling

### Common Error Responses

**City Not Found (404):**
```json
{
  "status": 404,
  "errors": {
    "city": "No offices found in the specified city"
  }
}
```

**Invalid Parameters (400):**
```json
{
  "status": 400,
  "errors": {
    "cityName": "City name is required"
  }
}
```

## Migration from Previous Implementation

### Old Response Structure
```typescript
// Previous response was just an array
Office[]
```

### New Response Structure
```typescript
// New structured response with metadata
{
  offices: Office[],
  totalCount: number,
  cityInfo: CityInfo,
  pagination: PaginationInfo
}
```

### Migration Steps
1. Update API endpoint from `/search-by-city` to `/city/{cityName}`
2. Handle new response structure with `offices` array
3. Utilize `cityInfo` for page headers and statistics
4. Implement pagination using `pagination` metadata
5. Use real-time data like `isCurrentlyOpen` for better UX

This API is specifically designed for your office listing page and provides all the data needed for a rich, interactive user experience! 🎯
