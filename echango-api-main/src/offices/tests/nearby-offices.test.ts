import { Test, TestingModule } from '@nestjs/testing';
import { OfficesService } from '../offices.service';
import { OfficeRepository } from '../infrastructure/persistence/office.repository';
import { CitiesService } from '../../cities/cities.service';
import { CountriesService } from '../../countries/countries.service';
import { CurrenciesService } from '../../currencies/currencies.service';
import { FilesService } from '../../files/files.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { NearbyOfficeFilter } from '../types';
import { Office } from '../domain/office';
import { Currency } from '../../currencies/domain/currency';

describe('OfficesService - Nearby Offices', () => {
  let service: OfficesService;
  let officeRepository: jest.Mocked<OfficeRepository>;
  let currenciesService: jest.Mocked<CurrenciesService>;

  const mockMADCurrency: Currency = {
    id: 'mad-currency-id',
    code: 'MAD',
    name: 'Moroccan Dirham',
    namePlural: 'Moroccan Dirhams',
    symbol: 'DH',
    symbolNative: 'د.م.',
    decimalDigits: 2,
    rounding: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOffice: Office = {
    id: 'office-1',
    officeName: 'Test Office',
    location: { type: 'Point', coordinates: [-7.5898, 33.5731] },
    registrationNumber: 'REG123',
    currencyExchangeLicenseNumber: 'LIC123',
    address: 'Test Address',
    primaryPhoneNumber: '+212600000000',
    isActive: true,
    isVerified: true,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    distanceInKm: 2.5,
    owner: {} as any,
    workingHours: [],
  };

  beforeEach(async () => {
    const mockOfficeRepository = {
      findNearbyOffices: jest.fn(),
    };

    const mockCurrenciesService = {
      getDefaultBaseCurrencyMAD: jest.fn(),
      findByCode: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficesService,
        { provide: OfficeRepository, useValue: mockOfficeRepository },
        { provide: CitiesService, useValue: {} },
        { provide: CountriesService, useValue: {} },
        { provide: CurrenciesService, useValue: mockCurrenciesService },
        { provide: FilesService, useValue: {} },
        { provide: EventEmitter2, useValue: {} },
      ],
    }).compile();

    service = module.get<OfficesService>(OfficesService);
    officeRepository = module.get(OfficeRepository);
    currenciesService = module.get(CurrenciesService);

    // Setup default mocks
    currenciesService.getDefaultBaseCurrencyMAD.mockResolvedValue(
      mockMADCurrency,
    );
    // officeRepository.findNearbyOffices.mockResolvedValue([mockOffice]);
  });

  describe('Input Validation', () => {
    it('should throw BadRequestException for invalid latitude', async () => {
      const filter: NearbyOfficeFilter = {};

      await expect(
        service.findNearbyOffices(91, 0, 10, filter),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.findNearbyOffices(-91, 0, 10, filter),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid longitude', async () => {
      const filter: NearbyOfficeFilter = {};

      await expect(
        service.findNearbyOffices(0, 181, 10, filter),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.findNearbyOffices(0, -181, 10, filter),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid radius', async () => {
      const filter: NearbyOfficeFilter = {};

      await expect(service.findNearbyOffices(0, 0, 0, filter)).rejects.toThrow(
        BadRequestException,
      );

      await expect(
        service.findNearbyOffices(0, 0, 1001, filter),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative currency rate', async () => {
      const filter: NearbyOfficeFilter = {
        targetCurrencyRate: -1,
      };

      await expect(
        service.findNearbyOffices(33.5731, -7.5898, 10, filter),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when currency rate provided without rate direction', async () => {
      const filter: NearbyOfficeFilter = {
        targetCurrencyRate: 100,
        // rateDirection is missing
      };

      await expect(
        service.findNearbyOffices(33.5731, -7.5898, 10, filter),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Currency Processing', () => {
    it('should handle currency codes and convert to IDs', async () => {
      const mockUSDCurrency: Currency = {
        id: 'usd-currency-id',
        code: 'USD',
        name: 'US Dollar',
        namePlural: 'US Dollars',
        symbol: '$',
        symbolNative: '$',
        decimalDigits: 2,
        rounding: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      currenciesService.findByCode.mockResolvedValue(mockUSDCurrency);

      const filter: NearbyOfficeFilter = {
        baseCurrencyId: 'USD', // Currency code instead of ID
        targetCurrencyId: 'MAD',
      };

      await service.findNearbyOffices(33.5731, -7.5898, 10, filter);

      expect(currenciesService.findByCode).toHaveBeenCalledWith('USD');
      expect(officeRepository.findNearbyOffices).toHaveBeenCalledWith(
        33.5731,
        -7.5898,
        10,
        expect.objectContaining({
          baseCurrencyId: 'usd-currency-id',
          targetCurrencyId: 'mad-currency-id',
        }),
      );
    });

    it('should throw BadRequestException for invalid currency code', async () => {
      currenciesService.findByCode.mockResolvedValue(null);

      const filter: NearbyOfficeFilter = {
        baseCurrencyId: 'INVALID',
      };

      await expect(
        service.findNearbyOffices(33.5731, -7.5898, 10, filter),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Filter Processing', () => {
    it('should successfully find nearby offices with basic filters', async () => {
      const filter: NearbyOfficeFilter = {
        isActive: true,
        isVerified: true,
        isFeatured: false,
      };

      const result = await service.findNearbyOffices(
        33.5731,
        -7.5898,
        10,
        filter,
      );

      expect(result).toEqual([mockOffice]);
      expect(officeRepository.findNearbyOffices).toHaveBeenCalledWith(
        33.5731,
        -7.5898,
        10,
        expect.objectContaining(filter),
      );
    });

    it('should handle showOnlyOpenNow filter', async () => {
      const filter: NearbyOfficeFilter = {
        showOnlyOpenNow: true,
      };

      await service.findNearbyOffices(33.5731, -7.5898, 10, filter);

      expect(officeRepository.findNearbyOffices).toHaveBeenCalledWith(
        33.5731,
        -7.5898,
        10,
        expect.objectContaining({ showOnlyOpenNow: true }),
      );
    });

    it('should handle trending filters (popular, mostSearched, nearest)', async () => {
      const popularFilter: NearbyOfficeFilter = { isPopular: true };
      const mostSearchedFilter: NearbyOfficeFilter = { mostSearched: true };
      const nearestFilter: NearbyOfficeFilter = { nearest: true };

      await service.findNearbyOffices(33.5731, -7.5898, 10, popularFilter);
      await service.findNearbyOffices(33.5731, -7.5898, 10, mostSearchedFilter);
      await service.findNearbyOffices(33.5731, -7.5898, 10, nearestFilter);

      expect(officeRepository.findNearbyOffices).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException when MAD currency not found', async () => {
      currenciesService.getDefaultBaseCurrencyMAD.mockResolvedValue(null);

      const filter: NearbyOfficeFilter = {};

      await expect(
        service.findNearbyOffices(33.5731, -7.5898, 10, filter),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle repository errors gracefully', async () => {
      officeRepository.findNearbyOffices.mockRejectedValue(
        new Error('Database error'),
      );

      const filter: NearbyOfficeFilter = {};

      await expect(
        service.findNearbyOffices(33.5731, -7.5898, 10, filter),
      ).rejects.toThrow();
    });
  });
});
