import { Test, TestingModule } from '@nestjs/testing';
import { OfficesService } from '../offices.service';
import { BadRequestException } from '@nestjs/common';

describe('OfficesService - Currency Conversion for City Offices', () => {
  let service: OfficesService;
  let mockCurrencyService: any;
  let mockOfficeRepository: any;

  const mockMADCurrency = {
    id: 'mad-currency-id',
    code: 'MAD',
    name: 'Moroccan Dirham',
  };

  const mockUSDCurrency = {
    id: 'usd-currency-id',
    code: 'USD',
    name: 'US Dollar',
  };

  const mockEURCurrency = {
    id: 'eur-currency-id',
    code: 'EUR',
    name: 'Euro',
  };

  const mockOffice = {
    id: 'office-123',
    officeName: 'Test Exchange',
    rates: [
      {
        id: 'rate-1',
        baseCurrency: mockMADCurrency,
        targetCurrency: mockUSDCurrency,
        buyRate: 10.15,
        sellRate: 10.25,
      },
      {
        id: 'rate-2',
        baseCurrency: mockMADCurrency,
        targetCurrency: mockEURCurrency,
        buyRate: 11.0,
        sellRate: 11.5,
      },
    ],
  };

  beforeEach(async () => {
    mockCurrencyService = {
      getDefaultBaseCurrencyMAD: jest.fn().mockResolvedValue(mockMADCurrency),
      findByCode: jest.fn(),
    };

    mockOfficeRepository = {
      findOfficesByCityName: jest.fn().mockResolvedValue({
        data: [mockOffice],
        meta: { totalItems: 1 },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficesService,
        { provide: 'CurrenciesService', useValue: mockCurrencyService },
        { provide: 'OfficeRepository', useValue: mockOfficeRepository },
        // Add other required dependencies as mocks
      ],
    }).compile();

    service = module.get<OfficesService>(OfficesService);
  });

  describe('Currency Direction Logic', () => {
    it('should use SELL rate when MAD is base currency (MAD → USD)', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockMADCurrency) // baseCurrency
        .mockResolvedValueOnce(mockUSDCurrency); // targetCurrency

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        targetCurrency: 'USD',
        targetCurrencyRate: 1000,
      });

      // Should use SELL rate: 1000 * 0.0976 (1/10.25) ≈ 97.56 USD
      expect(result.offices[0].equivalentValue).toBeCloseTo(97.56, 2);
    });

    it('should use BUY rate and swap currencies when MAD is target currency (USD → MAD)', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockUSDCurrency) // baseCurrency
        .mockResolvedValueOnce(mockMADCurrency); // targetCurrency

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'USD',
        targetCurrency: 'MAD',
        targetCurrencyRate: 100,
      });

      // Should use BUY rate after swapping: 100 * 10.15 = 1015 MAD
      expect(result.offices[0].equivalentValue).toBe(1015);
    });

    it('should throw error for cross-currency exchange (USD → EUR)', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockUSDCurrency) // baseCurrency
        .mockResolvedValueOnce(mockEURCurrency); // targetCurrency

      await expect(
        service.getOfficesInCity('casablanca', {
          baseCurrency: 'USD',
          targetCurrency: 'EUR',
          targetCurrencyRate: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Currency Code Resolution', () => {
    it('should resolve currency codes to IDs', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockMADCurrency)
        .mockResolvedValueOnce(mockUSDCurrency);

      await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        targetCurrency: 'USD',
        targetCurrencyRate: 1000,
      });

      expect(mockCurrencyService.findByCode).toHaveBeenCalledWith('MAD');
      expect(mockCurrencyService.findByCode).toHaveBeenCalledWith('USD');
    });

    it('should throw error for invalid currency code', async () => {
      mockCurrencyService.findByCode.mockResolvedValue(null);

      await expect(
        service.getOfficesInCity('casablanca', {
          baseCurrency: 'INVALID',
          targetCurrency: 'MAD',
          targetCurrencyRate: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Equivalent Value Calculation', () => {
    it('should calculate correct equivalent value for MAD → USD', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockMADCurrency)
        .mockResolvedValueOnce(mockUSDCurrency);

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        targetCurrency: 'USD',
        targetCurrencyRate: 1025, // 1025 MAD
      });

      // Should use SELL rate: 1025 / 10.25 = 100 USD
      expect(result.offices[0].equivalentValue).toBe(100);
    });

    it('should calculate correct equivalent value for USD → MAD', async () => {
      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockUSDCurrency)
        .mockResolvedValueOnce(mockMADCurrency);

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'USD',
        targetCurrency: 'MAD',
        targetCurrencyRate: 100, // 100 USD
      });

      // Should use BUY rate after swapping: 100 * 10.15 = 1015 MAD
      expect(result.offices[0].equivalentValue).toBe(1015);
    });

    it('should not add equivalentValue when no matching rate found', async () => {
      const officeWithoutUSDRate = {
        ...mockOffice,
        rates: [
          {
            id: 'rate-2',
            baseCurrency: mockMADCurrency,
            targetCurrency: mockEURCurrency,
            buyRate: 11.0,
            sellRate: 11.5,
          },
        ],
      };

      mockOfficeRepository.findOfficesByCityName.mockResolvedValue({
        data: [officeWithoutUSDRate],
        meta: { totalItems: 1 },
      });

      mockCurrencyService.findByCode
        .mockResolvedValueOnce(mockMADCurrency)
        .mockResolvedValueOnce(mockUSDCurrency);

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        targetCurrency: 'USD',
        targetCurrencyRate: 1000,
      });

      expect(result.offices[0].equivalentValue).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should return offices without conversion when currency service fails', async () => {
      mockCurrencyService.getDefaultBaseCurrencyMAD.mockResolvedValue(null);

      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        targetCurrency: 'USD',
        targetCurrencyRate: 1000,
      });

      // Should return offices without equivalentValue
      expect(result.offices).toHaveLength(1);
      expect(result.offices[0].equivalentValue).toBeUndefined();
    });

    it('should return offices without conversion when parameters are missing', async () => {
      const result = await service.getOfficesInCity('casablanca', {
        baseCurrency: 'MAD',
        // Missing targetCurrency and targetCurrencyRate
      });

      expect(result.offices).toHaveLength(1);
      expect(result.offices[0].equivalentValue).toBeUndefined();
    });
  });
});

/**
 * Test Cases Summary:
 *
 * ✅ MAD → Foreign (SELL rate): 1000 MAD → USD uses sellRate
 * ✅ Foreign → MAD (BUY rate + swap): 100 USD → MAD uses buyRate after currency swap
 * ✅ Cross-currency error: USD → EUR throws BadRequestException
 * ✅ Currency code resolution: 'MAD', 'USD' → currency IDs
 * ✅ Invalid currency error: 'INVALID' → BadRequestException
 * ✅ Correct calculations: Proper math for both directions
 * ✅ Missing rate handling: No equivalentValue when rate not found
 * ✅ Error graceful handling: Returns offices without conversion on errors
 * ✅ Missing parameters: No conversion when required params missing
 */
