# Currency Conversion Feature for Office Listing

## Overview

The office listing API now includes **currency conversion functionality** similar to the nearby offices feature. This allows users to see equivalent values when browsing offices in a specific city.

## 🎯 Key Features Added

### **1. Currency Conversion Parameters**
- **`baseCurrency`**: Source currency code (e.g., "USD", "MAD")
- **`targetCurrency`**: Target currency code (e.g., "MAD", "EUR") 
- **`targetCurrencyRate`**: Amount to convert (e.g., 100)
- **`rateDirection`**: "BUY" or "SELL" (auto-determined if not provided)

### **2. Equivalent Value Calculation**
- **`equivalentValue`**: Calculated conversion result added to each office
- **Real-time Rates**: Uses current exchange rates from office data
- **Automatic Direction**: Determines BUY/SELL based on MAD currency

### **3. Smart Currency Resolution**
- **Code to ID Conversion**: Accepts currency codes, converts to internal IDs
- **MAD Detection**: Automatically determines rate direction when MAD is involved
- **Error Handling**: Graceful fallback when currencies not found

## 🔧 Technical Implementation

### **Service Method Enhancement**
```typescript
async getOfficesInCity(
  cityName: string,
  filters?: {
    // ... existing filters
    baseCurrency?: string;
    targetCurrency?: string;
    targetCurrencyRate?: number;
    rateDirection?: 'BUY' | 'SELL';
  }
): Promise<OfficeListingResponse>
```

### **Currency Conversion Logic**
```typescript
// Find matching rate for office
const matchingRate = office.rates.find(rate => 
  rate?.baseCurrency?.id === processedFilter.baseCurrencyId &&
  rate?.targetCurrency?.id === processedFilter.targetCurrencyId
);

// Calculate equivalent value
if (matchingRate && targetCurrencyRate) {
  const rateValue = rateDirection === 'BUY' 
    ? matchingRate.buyRate 
    : matchingRate.sellRate;
    
  office.equivalentValue = targetCurrencyRate * rateValue;
}
```

## 📊 API Usage Examples

### **Basic Currency Conversion**
```bash
# Convert 100 USD to MAD equivalent
GET /api/v1/offices/city/casablanca?baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=100
```

**Response includes:**
```json
{
  "offices": [
    {
      "id": "office-123",
      "officeName": "Atlas Exchange",
      "rates": [
        {
          "baseCurrency": { "code": "USD" },
          "targetCurrency": { "code": "MAD" },
          "buyRate": 10.15,
          "sellRate": 10.25
        }
      ],
      "equivalentValue": 1015.0  // 100 * 10.15 (buy rate)
    }
  ]
}
```

### **Reverse Conversion (MAD to Foreign)**
```bash
# Convert 1000 MAD to EUR equivalent
GET /api/v1/offices/city/rabat?baseCurrency=MAD&targetCurrency=EUR&targetCurrencyRate=1000&rateDirection=SELL
```

### **Combined with Filtering**
```bash
# Find verified offices with USD rates and convert 500 USD
GET /api/v1/offices/city/tangier?isVerified=true&availableCurrencies=USD&baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=500
```

## 🎨 Frontend Integration

### **React Hook with Currency Conversion**
```typescript
const { data, loading } = useOfficesInCity(
  'casablanca',
  {
    isActive: true,
    isVerified: true
  },
  {
    baseCurrency: 'USD',
    targetCurrency: 'MAD', 
    targetCurrencyRate: 100,
    rateDirection: 'BUY'
  }
);
```

### **Office Card with Equivalent Value**
```typescript
const OfficeCard = ({ office }) => (
  <div className="office-card">
    <h3>{office.officeName}</h3>
    
    <div className="exchange-rates">
      {office.rates?.map(rate => (
        <div key={rate.id}>
          <span>{rate.baseCurrency.code}/{rate.targetCurrency.code}</span>
          <span>Buy: {rate.buyRate} | Sell: {rate.sellRate}</span>
        </div>
      ))}
      
      {office.equivalentValue && (
        <div className="equivalent-value highlight">
          <strong>100 USD = {office.equivalentValue.toFixed(2)} MAD</strong>
        </div>
      )}
    </div>
  </div>
);
```

## 🔄 Rate Direction Logic (EXACT Same as Nearby Offices)

### **Automatic Determination Based on MAD Position**
- **MAD as Base Currency** (MAD → Foreign): Uses **SELL** rate (office selling foreign currency)
- **MAD as Target Currency** (Foreign → MAD): Uses **BUY** rate (office buying foreign currency)
  - **Important**: Currencies are automatically swapped to maintain consistent database structure
- **Cross-Currency** (Foreign → Foreign): **Not supported** - throws error requiring MAD

### **Currency Swapping Logic**
When target currency is MAD (e.g., USD → MAD):
1. **Input**: `baseCurrency=USD`, `targetCurrency=MAD`
2. **Automatic Swap**: `baseCurrency=MAD`, `targetCurrency=USD`
3. **Rate Direction**: `BUY` (office buying USD from client)
4. **Calculation**: `amount * buyRate`

### **Concrete Examples**

#### **Example 1: Client wants to exchange 100 USD for MAD**
```bash
GET /api/v1/offices/city/casablanca?baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=100
```
**Logic:**
- Input: USD → MAD (target is MAD)
- **Automatic swap**: MAD → USD
- **Rate direction**: BUY (office buys USD from client)
- **Calculation**: 100 * buyRate (e.g., 100 * 10.15 = 1015 MAD)

#### **Example 2: Client wants to exchange 1000 MAD for EUR**
```bash
GET /api/v1/offices/city/rabat?baseCurrency=MAD&targetCurrency=EUR&targetCurrencyRate=1000
```
**Logic:**
- Input: MAD → EUR (base is MAD)
- **No swap needed**: MAD → EUR
- **Rate direction**: SELL (office sells EUR to client)
- **Calculation**: 1000 * sellRate (e.g., 1000 * 0.087 = 87 EUR)

### **Manual Override (Not Recommended)**
```bash
# Force specific direction (can cause incorrect calculations)
GET /api/v1/offices/city/rabat?baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=100&rateDirection=SELL
```

## ⚡ Performance Considerations

### **Optimizations**
- **Parallel Processing**: Currency resolution happens in parallel
- **Caching**: MAD currency cached for performance
- **Graceful Degradation**: Returns offices without conversion on errors
- **Selective Calculation**: Only calculates for offices with matching rates

### **Error Handling**
- **Invalid Currency Codes**: Returns structured error response
- **Missing Rates**: Office returned without equivalentValue
- **Conversion Errors**: Logged but doesn't break the response

## 🎯 Use Cases

### **1. Price Comparison**
Users can see how much their money is worth across different offices:
```bash
GET /api/v1/offices/city/casablanca?baseCurrency=USD&targetCurrency=MAD&targetCurrencyRate=1000
```

### **2. Budget Planning**
Calculate how much foreign currency they can get for their MAD:
```bash
GET /api/v1/offices/city/rabat?baseCurrency=MAD&targetCurrency=EUR&targetCurrencyRate=5000&rateDirection=SELL
```

### **3. Rate Shopping**
Find best rates for specific amounts:
```bash
GET /api/v1/offices/city/marrakech?baseCurrency=GBP&targetCurrency=MAD&targetCurrencyRate=500&sortBy=popular
```

## 🚀 Benefits

### **User Experience**
- ✅ **Instant Conversion**: See equivalent values immediately
- ✅ **Real-time Rates**: Uses current office exchange rates
- ✅ **Smart Defaults**: Automatic rate direction determination
- ✅ **Flexible Input**: Accepts currency codes or IDs

### **Developer Experience**
- ✅ **Consistent API**: Same pattern as nearby offices
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Error Handling**: Comprehensive error responses
- ✅ **Documentation**: Complete API documentation

### **Business Value**
- ✅ **Better Engagement**: Users can compare values easily
- ✅ **Informed Decisions**: Clear equivalent value display
- ✅ **Rate Transparency**: Shows actual conversion amounts
- ✅ **Competitive Analysis**: Easy rate comparison across offices

## 🔮 Future Enhancements

### **Planned Features**
- **Multi-currency Conversion**: Convert to multiple currencies simultaneously
- **Historical Rates**: Show rate trends and history
- **Rate Alerts**: Notify when rates reach target values
- **Conversion Calculator**: Interactive rate calculator widget

This currency conversion feature makes the office listing API **perfect for your exchange office page**, providing users with immediate value calculations and transparent rate comparisons! 🎯✨
