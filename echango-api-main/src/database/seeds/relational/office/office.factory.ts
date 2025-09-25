import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeEntity } from '../../../../offices/infrastructure/persistence/relational/entities/office.entity';
import { CityEntity } from '../../../../cities/infrastructure/persistence/relational/entities/city.entity';
import { CountryEntity } from '../../../../countries/infrastructure/persistence/relational/entities/country.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { FileEntity } from '../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { OfficeRateEntity } from '../../../../office-rates/infrastructure/persistence/relational/entities/office-rate.entity';
import { CurrencyEntity } from '../../../../currencies/infrastructure/persistence/relational/entities/currency.entity';
import { WorkingHourEntity } from '../../../../working-hours/infrastructure/persistence/relational/entities/working-hour.entity';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';

interface CSVOfficeData {
  // Original format (data_office.csv)
  Ville?: string;
  'Bureau de change'?: string;
  Adresse?: string;
  'Code postal'?: string;
  Téléphone?: string;
  Lundi?: string;
  Mardi?: string;
  Mercredi?: string;
  Jeudi?: string;
  Vendredi?: string;
  Samedi?: string;
  Dimanche?: string;
  Lien?: string;
  'Site Web/Email'?: string;
  Longitude?: string;
  Latitude?: string;
  'Image 1'?: string;
  'Image 2'?: string;
  'Image 3'?: string;

  // New format (new.csv)
  City?: string;
  Nom?: string;
  Contact?: string;
  phone?: string;
  WhatsApp?: string;
  phone2?: string;
  Email?: string;
  Coordinates?: string; // "lat,long[,z]"
}

@Injectable()
export class CSVOfficeFactory {
  constructor(
    @InjectRepository(OfficeEntity)
    private repositoryOffice: Repository<OfficeEntity>,
    @InjectRepository(CityEntity)
    private repositoryCity: Repository<CityEntity>,
    @InjectRepository(CountryEntity)
    private repositoryCountry: Repository<CountryEntity>,
    @InjectRepository(UserEntity)
    private repositoryUser: Repository<UserEntity>,
    @InjectRepository(FileEntity)
    private repositoryFile: Repository<FileEntity>,
    @InjectRepository(CurrencyEntity)
    private repositoryCurrency: Repository<CurrencyEntity>,
    @InjectRepository(OfficeRateEntity)
    private repositoryOfficeRate: Repository<OfficeRateEntity>,
    @InjectRepository(WorkingHourEntity)
    private repositoryWorkingHour: Repository<WorkingHourEntity>,
  ) {}

  private parseCSVData(csvFilePath: string): Promise<CSVOfficeData[]> {
    return new Promise((resolve, reject) => {
      const csvFile = fs.readFileSync(csvFilePath, 'utf8');

      // Detect new format via header row
      const firstLine = csvFile.split(/\r?\n/)[0]?.toLowerCase() || '';
      const isNewFormat =
        firstLine.startsWith('city,nom,adresse') &&
        firstLine.includes('coordinates');

      if (!isNewFormat) {
        // Parse as original (headered) format
        Papa.parse(csvFile, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          delimiter: ',',
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
            }
            resolve(results.data as CSVOfficeData[]);
          },
          error: (error) => reject(error),
        });
        return;
      }

      // Parse as new format: header has duplicate empty columns for split days.
      // Use header: false and map indices to a normalized object.
      Papa.parse(csvFile, {
        header: false,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimiter: ',',
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV parsing errors:', results.errors);
          }
          const rows = results.data as string[][];
          // Remove header row
          const dataRows = rows.slice(1);
          const mapped: CSVOfficeData[] = dataRows.map((cols) => {
            // Ensure array has at least 23 columns
            const c = (i: number) => (cols[i] ?? '').toString().trim();
            // Combine split day parts into a single string, comma-separated if both present
            const combineDay = (a: string, b: string) => {
              const p1 = a?.trim();
              const p2 = b?.trim();
              if (p1 && p2) return `${p1},${p2}`;
              return p1 || p2 || '';
            };

            const obj: CSVOfficeData = {
              City: c(0),
              Nom: c(1),
              Adresse: c(2),
              Contact: c(3),
              phone: c(4),
              WhatsApp: c(5),
              phone2: c(6),
              Email: c(7),
              Coordinates: c(8),
              Lundi: combineDay(c(9), c(10)),
              Mardi: combineDay(c(11), c(12)),
              Mercredi: combineDay(c(13), c(14)),
              Jeudi: combineDay(c(15), c(16)),
              Vendredi: combineDay(c(17), c(18)),
              Samedi: combineDay(c(19), c(20)),
              Dimanche: combineDay(c(21), c(22)),
            };
            return obj;
          });
          resolve(mapped);
        },
        error: (error) => reject(error),
      });
    });
  }

  private parseWorkingHours(timeString?: string): {
    startTime: string;
    endTime: string;
    isActive: boolean;
    hasBreak: boolean;
  } {
    if (
      !timeString ||
      timeString.toLowerCase() === 'fermé' ||
      timeString.toLowerCase() === 'closed'
    ) {
      return {
        startTime: '00:00',
        endTime: '00:00',
        isActive: false,
        hasBreak: false,
      };
    }

    // If there are multiple intervals separated by comma, use the first and flag break
    const hasBreak = timeString.includes(',');
    const firstInterval = timeString.split(',')[0]?.trim() || timeString;

    // Parse format like "09:00–19:30" or "09:00-19:30"
    const timeMatch = firstInterval.match(
      /(\d{2}:\d{2})[\s]*[–-][\s]*(\d{2}:\d{2})/,
    );
    if (timeMatch) {
      return {
        startTime: timeMatch[1],
        endTime: timeMatch[2],
        isActive: true,
        hasBreak,
      };
    }

    // If format is different, return default active hours
    return {
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      hasBreak,
    };
  }

  private async createWorkingHours(
    office: OfficeEntity,
    csvData: CSVOfficeData,
  ): Promise<void> {
    const dayMappings = {
      MONDAY: csvData.Lundi,
      TUESDAY: csvData.Mardi,
      WEDNESDAY: csvData.Mercredi,
      THURSDAY: csvData.Jeudi,
      FRIDAY: csvData.Vendredi,
      SATURDAY: csvData.Samedi,
      SUNDAY: csvData.Dimanche,
    };

    for (const [dayOfWeek, timeString] of Object.entries(dayMappings)) {
      const { startTime, endTime, isActive, hasBreak } =
        this.parseWorkingHours(timeString);

      const workingHour = this.repositoryWorkingHour.create({
        office: office,
        dayOfWeek,
        fromTime: startTime,
        toTime: endTime,
        isActive,
        hasBreak,
      });

      await this.repositoryWorkingHour.save(workingHour);
    }
  }

  private async createDefaultRates(office: OfficeEntity): Promise<void> {
    const [madCurrency, usdCurrency, eurCurrency] = await Promise.all([
      this.repositoryCurrency.findOne({ where: { code: 'MAD' } }),
      this.repositoryCurrency.findOne({ where: { code: 'USD' } }),
      this.repositoryCurrency.findOne({ where: { code: 'EUR' } }),
    ]);

    if (!madCurrency || !usdCurrency || !eurCurrency) {
      throw new Error('Required currencies not found');
    }

    // Create realistic USD rate (MAD to USD)
    // Current market rate around 10.0-10.2, with typical exchange office spread
    const usdBaseRate = faker.number.float({
      min: 9.95,
      max: 10.15,
      fractionDigits: 2,
    });
    const usdSpread = faker.number.float({
      min: 0.15,
      max: 0.35,
      fractionDigits: 2,
    });
    const officeUsdRate = this.repositoryOfficeRate.create({
      office: office,
      baseCurrency: madCurrency,
      targetCurrency: usdCurrency,
      buyRate: parseFloat((usdBaseRate - usdSpread / 2).toFixed(2)), // Office buys USD at lower rate
      sellRate: parseFloat((usdBaseRate + usdSpread / 2).toFixed(2)), // Office sells USD at higher rate
      isActive: true,
    });

    // Create realistic EUR rate (MAD to EUR)
    // Current market rate around 10.8-11.2, with typical exchange office spread
    const eurBaseRate = faker.number.float({
      min: 10.85,
      max: 11.15,
      fractionDigits: 2,
    });
    const eurSpread = faker.number.float({
      min: 0.2,
      max: 0.4,
      fractionDigits: 2,
    });
    const officeEurRate = this.repositoryOfficeRate.create({
      office: office,
      baseCurrency: madCurrency,
      targetCurrency: eurCurrency,
      buyRate: parseFloat((eurBaseRate - eurSpread / 2).toFixed(2)), // Office buys EUR at lower rate
      sellRate: parseFloat((eurBaseRate + eurSpread / 2).toFixed(2)), // Office sells EUR at higher rate
      isActive: true,
    });

    await Promise.all([
      this.repositoryOfficeRate.save(officeUsdRate),
      this.repositoryOfficeRate.save(officeEurRate),
    ]);
  }

  private async createImages(csvData: CSVOfficeData): Promise<FileEntity[]> {
    const imagesObjects: FileEntity[] = [];

    // Handle CSV-based image paths (legacy)
    const csvImages =
      csvData['Image 1'] || csvData['Image 2'] || csvData['Image 3'];
    if (csvImages) {
      const imagePaths = csvImages.split(',').map((path) => path.trim());
      for (const imagePath of imagePaths) {
        const file = await this.repositoryFile.create({
          path: imagePath,
        });
        imagesObjects.push(file);
      }
    }

    // Handle actual image files from /images folder
    const officeName =
      csvData['Bureau de change']?.trim() || csvData.Nom?.trim();
    if (officeName) {
      const foundImages = await this.findAndMoveOfficeImages(officeName);
      imagesObjects.push(...foundImages);
    }

    return imagesObjects;
  }

  private async findAndMoveOfficeImages(
    officeName: string,
  ): Promise<FileEntity[]> {
    const imagesObjects: FileEntity[] = [];
    const projectRoot = process.cwd();
    const imagesDir = path.join(
      projectRoot,
      'src',
      'database',
      'seeds',
      'relational',
      'office',
      'images',
    );
    const filesDir = path.join(projectRoot, 'files');

    // Ensure files directory exists
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    try {
      // Check if images directory exists
      if (!fs.existsSync(imagesDir)) {
        console.log(`Images directory not found: ${imagesDir}`);
        return imagesObjects;
      }

      // Look for a subfolder that matches the office name exactly
      const officeImageDir = path.join(imagesDir, officeName);
      if (
        fs.existsSync(officeImageDir) &&
        fs.statSync(officeImageDir).isDirectory()
      ) {
        console.log(`Found image folder for office: ${officeName}`);

        const officeImages = fs.readdirSync(officeImageDir).filter((file) => {
          const filePath = path.join(officeImageDir, file);
          return fs.statSync(filePath).isFile() && this.isImageFile(file);
        });

        console.log(
          `Found ${officeImages.length} images for office "${officeName}"`,
        );

        for (const imageFile of officeImages) {
          const sourcePath = path.join(officeImageDir, imageFile);
          const fileEntity = await this.moveImageToFiles(
            sourcePath,
            imageFile,
            filesDir,
          );
          if (fileEntity) {
            imagesObjects.push(fileEntity);
          }
        }
      } else {
        // Try to find a folder with similar name (case-insensitive, normalized)
        const availableFolders = fs.readdirSync(imagesDir).filter((item) => {
          const itemPath = path.join(imagesDir, item);
          return fs.statSync(itemPath).isDirectory();
        });

        const normalizedOfficeName = this.normalizeForMatching(officeName);
        const matchingFolder = availableFolders.find(
          (folder) =>
            this.normalizeForMatching(folder) === normalizedOfficeName,
        );

        if (matchingFolder) {
          console.log(
            `Found matching folder "${matchingFolder}" for office "${officeName}"`,
          );

          const matchingFolderPath = path.join(imagesDir, matchingFolder);
          const officeImages = fs
            .readdirSync(matchingFolderPath)
            .filter((file) => {
              const filePath = path.join(matchingFolderPath, file);
              return fs.statSync(filePath).isFile() && this.isImageFile(file);
            });

          console.log(
            `Found ${officeImages.length} images in folder "${matchingFolder}"`,
          );

          for (const imageFile of officeImages) {
            const sourcePath = path.join(matchingFolderPath, imageFile);
            const fileEntity = await this.moveImageToFiles(
              sourcePath,
              imageFile,
              filesDir,
            );
            if (fileEntity) {
              imagesObjects.push(fileEntity);
            }
          }
        } else {
          console.log(`No image folder found for office: "${officeName}"`);
          if (availableFolders.length > 0) {
            console.log(
              `Available folders: ${availableFolders.slice(0, 5).join(', ')}${availableFolders.length > 5 ? '...' : ''}`,
            );
          }
        }
      }
    } catch (error) {
      console.error(
        `Error processing images for office "${officeName}":`,
        error,
      );
    }

    return imagesObjects;
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  private normalizeForMatching(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/\([^)]*\)/g, '') // Remove content in parentheses
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async moveImageToFiles(
    sourcePath: string,
    originalFilename: string,
    filesDir: string,
  ): Promise<FileEntity | null> {
    try {
      // Use the original filename
      let finalFilename = originalFilename;
      let destinationPath = path.join(filesDir, finalFilename);

      // Check if file already exists and make it unique if needed
      let counter = 1;
      const nameWithoutExt = path.parse(originalFilename).name;
      const fileExtension = path.extname(originalFilename);

      while (fs.existsSync(destinationPath)) {
        finalFilename = `${nameWithoutExt}-${counter}${fileExtension}`;
        destinationPath = path.join(filesDir, finalFilename);
        counter++;
      }

      // Create FileEntity with the final path
      const fileEntity = this.repositoryFile.create({
        path: `/api/v1/files/${finalFilename}`,
      });

      const savedFileEntity = await this.repositoryFile.save(fileEntity);

      // Copy file to files directory
      fs.copyFileSync(sourcePath, destinationPath);

      console.log(`Moved image: ${originalFilename} -> ${finalFilename}`);
      return savedFileEntity;
    } catch (error) {
      console.error(`Error moving image ${originalFilename}:`, error);
      return null;
    }
  }

  /**
   * Check if an office already exists in the database by name and address
   * @param officeName The name of the office
   * @param address The address of the office
   * @returns The existing office entity if found, null otherwise
   */
  private async checkOfficeExists(
    officeName: string,
    address: string,
  ): Promise<OfficeEntity | null> {
    if (!officeName || !address) {
      return null;
    }

    // Normalize the inputs for comparison
    const normalizedName = officeName.toLowerCase().trim();
    const normalizedAddress = address.toLowerCase().trim();

    // Check for exact match first
    let existingOffice = await this.repositoryOffice.findOne({
      where: {
        officeName: normalizedName,
        address: normalizedAddress,
      },
    });

    if (existingOffice) {
      return existingOffice;
    }

    // Check for case-insensitive match using ILIKE (PostgreSQL) or LIKE (other databases)
    existingOffice = await this.repositoryOffice
      .createQueryBuilder('office')
      .where('LOWER(office.officeName) = :name', { name: normalizedName })
      .andWhere('LOWER(office.address) = :address', {
        address: normalizedAddress,
      })
      .getOne();

    return existingOffice;
  }

  private async ensureUniqueOffice(
    officeData: Partial<OfficeEntity>,
    maxRetries: number = 5,
  ): Promise<OfficeEntity> {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const office = this.repositoryOffice.create(officeData);
        return await this.repositoryOffice.save(office);
      } catch (error: any) {
        attempts++;

        if (error.code === '23505' && attempts < maxRetries) {
          console.log(
            `Duplicate detected, modifying office name (attempt ${attempts}/${maxRetries})`,
          );

          // Modify the office name to make it unique
          officeData.officeName = `${officeData.officeName} - ${attempts}`;

          continue;
        }

        throw error;
      }
    }

    throw new Error(
      `Failed to create unique office after ${maxRetries} attempts`,
    );
  }

  async createOfficeFromCSV(csvData: CSVOfficeData): Promise<OfficeEntity> {
    // Get Morocco country
    const country = await this.repositoryCountry.findOne({
      where: { alpha2: 'MA' },
    });

    if (!country) {
      throw new Error('Country Morocco not found');
    }

    // Get or create city (support both formats)
    const cityName = (csvData.Ville || csvData.City || '').toLowerCase().trim();
    if (!cityName) {
      throw new Error('City is missing in CSV row');
    }
    let city = await this.repositoryCity.findOne({
      where: { name: cityName },
    });

    if (!city) {
      console.log(`Creating city: ${cityName}`);
      city = this.repositoryCity.create({
        name: cityName,
        country: country,
      });
      city = await this.repositoryCity.save(city);
    }

    // Get random user as owner
    const usersCount = await this.repositoryUser.count();
    if (usersCount === 0) {
      throw new Error('No users found. Please seed users first.');
    }

    const randomUser = await this.repositoryUser.findOne({
      where: { id: Math.floor(Math.random() * usersCount) + 1 },
    });

    if (!randomUser) {
      throw new Error('User not found');
    }

    // Parse coordinates
    let latitude = 0;
    let longitude = 0;
    if (csvData.Longitude && csvData.Latitude) {
      // Original file had flipped columns, preserve existing behavior
      longitude = parseFloat(String(csvData.Latitude ?? '0')) || 0;
      latitude = parseFloat(String(csvData.Longitude ?? '0')) || 0;
    } else if (csvData.Coordinates) {
      // new.csv provides "lat,long[,z]"
      const parts = csvData.Coordinates.split(',').map((p) => p.trim());
      const lat = parseFloat(parts[0] || '0');
      const lon = parseFloat(parts[1] || '0');
      latitude = isNaN(lat) ? 0 : lat;
      longitude = isNaN(lon) ? 0 : lon;
    }

    // Clean and map phone numbers to their respective fields with fallback logic
    let primaryPhone =
      (csvData.phone || csvData['Téléphone'] || '')?.replace(/\s/g, '') || '';
    let secondaryPhone = csvData.phone2?.replace(/\s/g, '') || null;
    const whatsappPhone = csvData.WhatsApp?.replace(/\s/g, '') || null;

    // If primary phone is empty but secondary exists, use secondary as primary
    if (!primaryPhone && secondaryPhone) {
      primaryPhone = secondaryPhone;
      secondaryPhone = null;
    }

    // create images
    const images = await this.createImages(csvData);

    // Prepare office data
    const officeData = {
      officeName:
        csvData['Bureau de change']?.trim() ||
        csvData.Nom?.trim() ||
        'Unknown Office',
      registrationNumber: `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      currencyExchangeLicenseNumber: `LIC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      address: csvData.Adresse?.trim() || '',
      postalCode: csvData['Code postal']?.trim() || '',
      city: city,
      country: country,
      state: cityName, // Set state to city name
      primaryPhoneNumber: primaryPhone,
      secondaryPhoneNumber: secondaryPhone,
      whatsappNumber: whatsappPhone,
      email: csvData.Email?.trim() || null, // Insert email from CSV
      owner: randomUser,
      website: (csvData['Site Web/Email'] || csvData.Email)?.trim() || null,
      googleMapsLink: csvData.Lien?.trim() || null,
      logo: null,
      images: images,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    };

    // Create office with retry logic
    const savedOffice = await this.ensureUniqueOffice(
      officeData as Partial<OfficeEntity>,
    );

    // Create working hours
    await this.createWorkingHours(savedOffice, csvData);

    // Create default rates
    await this.createDefaultRates(savedOffice);

    return savedOffice;
  }

  async createOfficesFromCSV(csvFilePath: string): Promise<OfficeEntity[]> {
    console.log(`Reading CSV file: ${csvFilePath}`);

    const csvData = await this.parseCSVData(csvFilePath);
    console.log(`Found ${csvData.length} offices in CSV`);

    const offices: OfficeEntity[] = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];

      try {
        // Skip rows with empty office names
        if (!row['Bureau de change']?.trim() && !row.Nom?.trim()) {
          console.log(`Skipping row ${i + 1}: Empty office name`);
          continue;
        }

        const officeName = row['Bureau de change']?.trim() || row.Nom?.trim();
        const address = row.Adresse?.trim() || '';

        // Check if office already exists by name and address (only if officeName exists)
        if (officeName) {
          const existingOffice = await this.checkOfficeExists(
            officeName,
            address,
          );
          if (existingOffice) {
            console.log(
              `Skipping row ${i + 1}: Office "${officeName}" at "${address}" already exists in database`,
            );
            skippedCount++;
            continue;
          }
        }

        console.log(
          `Creating office ${i + 1}/${csvData.length}: ${officeName}`,
        );

        const office = await this.createOfficeFromCSV(row);
        offices.push(office);
        successCount++;

        // Log progress
        if (successCount % 5 === 0) {
          console.log(`Progress: ${successCount} offices created successfully`);
        }
      } catch (error: any) {
        errorCount++;
        console.error(
          `Error creating office from row ${i + 1}:`,
          error.message,
        );

        // Continue with next office instead of stopping
        continue;
      }
    }

    console.log(`\n=== CSV IMPORT COMPLETE ===`);
    console.log(`Successfully created: ${successCount} offices`);
    console.log(`Skipped (already exists): ${skippedCount} offices`);
    console.log(`Errors encountered: ${errorCount}`);
    console.log(`Total processed: ${csvData.length} rows`);

    return offices;
  }
}
