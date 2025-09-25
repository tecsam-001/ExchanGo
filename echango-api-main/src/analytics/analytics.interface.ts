export interface DashboardSummary {
  profileViews: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  phoneCalls: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  gpsClicks: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  waAlertPrice: {
    total: number;
    percentageChange: number;
  };
  rateAlertFrequency: string;
  keyStats: Array<{
    day: string;
    value: number;
  }>;
  lastUpdate: Date;
}
