export interface CityRankingParams {
  baseCurrencyCode: string;
  targetCurrencyCode: string;
  amount?: number;
}

export interface CityRankingResult {
  rank: number;
  city: string;
  averageRate: number;
  bestRate: number;
  exchangeOffice: string;
}

export interface OfficeActivityData {
  office: {
    id: string;
    officeName: string;
    city?: {
      name: string;
    };
    country?: {
      name: string;
    };
  };
  lastUpdate: Date;
  updatesCount: number;
  activityStatus: 'Very Active' | 'Active' | 'Low Activity' | 'Inactive';
  activityColor: 'Green' | 'Yellow' | 'Red' | 'Grey';
}

export interface GetOfficeActivityParams {
  period?: '7days' | '30days' | '90days';
  cityId?: string;
  cityIds?: string[]; // Support for multiple cities
  countryId?: string;
  isActiveOnly?: boolean;
  limit?: number;
  offset?: number;
}
