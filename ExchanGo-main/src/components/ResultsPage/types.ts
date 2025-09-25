export interface WorkingHoursObject {
  dayOfWeek: string;
  isActive: boolean;
  fromTime: string;
  toTime: string;
  hasBreak: boolean;
  breakFromTime?: string;
  breakToTime?: string;
  officeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: {
    id: string;
    code: string;
    name: string;
    namePlural: string;
    symbol: string;
    symbolNative: string;
    decimalDigits: number;
    rounding: string;
    createdAt: string;
    updatedAt: string;
    flag: string;
  };
  targetCurrency: {
    id: string;
    code: string;
    name: string;
    namePlural: string;
    symbol: string;
    symbolNative: string;
    decimalDigits: number;
    rounding: string;
    createdAt: string;
    updatedAt: string;
    flag: string;
  };
  buyRate: string;
  sellRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHour {
  id: string;
  dayOfWeek: string;
  isActive: boolean;
  fromTime: string;
  toTime: string;
  hasBreak: boolean;
  breakFromTime?: string;
  breakToTime?: string | null;
}

export interface ExchangeOffice {
  id: string | number;
  officeName?: string;
  address?: string;
  city?: {
    name: string;
  };
  country?: {
    name: string;
    emoji?: string;
  };
  primaryPhoneNumber?: string;
  whatsappNumber?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  images?: Array<{ id: string; path: string }> | string[];
  slug?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isFeatured?: boolean;
  bestOffice?: boolean;
  isPopular?: boolean;
  availableCurrencies?: string[];
  searchCount?: number;
  rates?: ExchangeRate[];
  workingHours?: WorkingHour[];
  todayWorkingHours?: {
    isActive: boolean;
    fromTime: string;
    toTime: string;
    hasBreak?: boolean;
    breakFromTime?: string;
    breakToTime?: string | null;
  };
  distanceInKm?: number;
  distance?: number;
  equivalentValue?: number;
  buyRate?: string | number;
  sellRate?: string | number;
  targetCurrency?: {
    code?: string;
    symbol?: string;
  };
  isCurrentlyOpen?: boolean;
}

export interface MapMarker {
  id: number;
  position: {
    top: string;
    left: string;
  };
  label: string;
}

export interface SearchBarProps {
  location?: string;
  amount?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  onSearch?: () => void;
}

export interface FilterState {
  selectedCurrencies: string[];
  selectedTrends: string[];
  showOpenOfficesOnly: boolean;
}

export interface FilterSortProps {
  count?: number;
  location?: string;
  lastUpdate?: string;
  onFilter?: () => void;
  onSort?: (option: string) => void;
  onRefresh?: () => void;
  onApplyFilters?: (filters: FilterState) => void;
  onClearFilters?: () => void;
}
