export interface NearbyOfficeFilter {
  rateDirection?: 'BUY' | 'SELL';
  baseCurrencyId?: string;
  targetCurrencyId?: string;
  targetCurrencyRate?: number;
  isOpen?: boolean;
  availableCurrencies?: string[];
  isPopular?: boolean;
  mostSearched?: boolean;
  nearest?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  showOnlyOpenNow?: boolean;
  limit?: number; // Optional limit for pagination
  page?: number; // Optional page for pagination
}
