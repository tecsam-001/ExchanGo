import { Test, TestingModule } from '@nestjs/testing';
import { OfficesService } from '../offices.service';
import { OfficeRepository } from '../infrastructure/persistence/office.repository';
import { CitiesService } from '../../cities/cities.service';
import { CountriesService } from '../../countries/countries.service';
import { CurrenciesService } from '../../currencies/currencies.service';
import { FilesService } from '../../files/files.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { CreateOfficeDto } from '../dto/create-office.dto';
import { FileDto } from '../../files/dto/file.dto';

describe('OfficesService - Office Creation', () => {
  let service: OfficesService;
  let filesService: FilesService;
  let officeRepository: OfficeRepository;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockCity = {
    id: 'city-123',
    name: 'Casablanca',
    country: { id: 'country-123', name: 'Morocco' },
  };

  const mockCountry = {
    id: 'country-123',
    name: 'Morocco',
    alpha2: 'MA',
  };

  const mockLogoFile = {
    id: 'file-123',
    path: 'logos/test-logo.png',
  };

  const createOfficeDto: CreateOfficeDto = {
    officeName: 'Test Exchange Office',
    registrationNumber: 'REG-123456',
    currencyExchangeLicenseNumber: 'LIC-789012',
    address: '123 Test Street, Casablanca',
    city: 'city-123',
    state: 'Casablanca-Settat',
    primaryPhoneNumber: '+212600000000',
    location: {
      type: 'Point',
      coordinates: [-7.5898, 33.5731],
    },
    logo: {
      id: 'file-123',
    } as FileDto,
    owner: mockUser as any,
  };

  beforeEach(async () => {
    const mockOfficeRepository = {
      checkOfficeExistsUsingRegistrationNumber: jest
        .fn()
        .mockResolvedValue(false),
      checkOfficeExistsUsingPrimaryPhoneNumber: jest
        .fn()
        .mockResolvedValue(false),
      checkOfficeExistsUsingCurrencyExchangeLicenseNumber: jest
        .fn()
        .mockResolvedValue(false),
      checkOwnerHasOffice: jest.fn().mockResolvedValue(false),
      checkOfficeExistsUsingSlug: jest.fn().mockResolvedValue(false),
      create: jest.fn(),
    };

    const mockCitiesService = {
      findById: jest.fn().mockResolvedValue(mockCity),
    };

    const mockCountriesService = {
      findByAlpha2: jest.fn().mockResolvedValue(mockCountry),
      getDefaultMorocco: jest.fn().mockResolvedValue(mockCountry),
    };

    const mockFilesService = {
      findById: jest.fn(),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficesService,
        { provide: OfficeRepository, useValue: mockOfficeRepository },
        { provide: CitiesService, useValue: mockCitiesService },
        { provide: CountriesService, useValue: mockCountriesService },
        { provide: CurrenciesService, useValue: {} },
        { provide: FilesService, useValue: mockFilesService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OfficesService>(OfficesService);
    filesService = module.get<FilesService>(FilesService);
    officeRepository = module.get<OfficeRepository>(OfficeRepository);
  });

  describe('Logo Validation', () => {
    it('should throw NotFoundException when logo file does not exist', async () => {
      // Mock filesService to return null (file not found)
      jest.spyOn(filesService, 'findById').mockResolvedValue(null);

      await expect(service.create(createOfficeDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
    });

    it('should proceed with office creation when logo file exists', async () => {
      // Mock filesService to return the logo file
      jest.spyOn(filesService, 'findById').mockResolvedValue(mockLogoFile);

      // Mock successful office creation
      const mockCreatedOffice = {
        id: 'office-123',
        ...createOfficeDto,
        city: mockCity,
        country: mockCountry,
        isActive: false,
        isVerified: false,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(officeRepository, 'create')
        .mockResolvedValue(mockCreatedOffice as any);

      const result = await service.create(createOfficeDto);

      expect(filesService.findById).toHaveBeenCalledWith('file-123');
      expect(officeRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('office-123');
    });

    it('should proceed with office creation when no logo is provided', async () => {
      const createOfficeDtoWithoutLogo = {
        ...createOfficeDto,
        logo: undefined,
      };

      // Mock successful office creation
      const mockCreatedOffice = {
        id: 'office-123',
        ...createOfficeDtoWithoutLogo,
        city: mockCity,
        country: mockCountry,
        isActive: false,
        isVerified: false,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(officeRepository, 'create')
        .mockResolvedValue(mockCreatedOffice as any);

      const result = await service.create(createOfficeDtoWithoutLogo);

      expect(filesService.findById).not.toHaveBeenCalled();
      expect(officeRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('office-123');
    });

    it('should proceed with office creation when logo is null', async () => {
      const createOfficeDtoWithNullLogo = {
        ...createOfficeDto,
        logo: null,
      };

      // Mock successful office creation
      const mockCreatedOffice = {
        id: 'office-123',
        ...createOfficeDtoWithNullLogo,
        city: mockCity,
        country: mockCountry,
        isActive: false,
        isVerified: false,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest
        .spyOn(officeRepository, 'create')
        .mockResolvedValue(mockCreatedOffice as any);

      const result = await service.create(createOfficeDtoWithNullLogo);

      expect(filesService.findById).not.toHaveBeenCalled();
      expect(officeRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('office-123');
    });
  });

  describe('Error Handling', () => {
    it('should return proper error structure for logo not found', async () => {
      jest.spyOn(filesService, 'findById').mockResolvedValue(null);

      try {
        await service.create(createOfficeDto);
        fail('Expected NotFoundException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.getResponse()).toEqual({
          status: 404,
          errors: {
            logo: 'logoFileNotFound',
          },
        });
      }
    });

    // Note: Logo constraint violation testing is done through integration tests
    // since the service layer catches and re-throws repository exceptions
  });
});
