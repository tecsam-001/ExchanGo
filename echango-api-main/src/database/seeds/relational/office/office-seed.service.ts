import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfficeEntity } from '../../../../offices/infrastructure/persistence/relational/entities/office.entity';
import { CSVOfficeFactory } from './office.factory';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CSVOfficeSeedService {
  constructor(
    @InjectRepository(OfficeEntity)
    private repository: Repository<OfficeEntity>,
    private csvOfficeFactory: CSVOfficeFactory,
  ) {}

  async run(): Promise<void> {
    const count = await this.repository.count();

    if (count !== 0) {
      console.log('Starting CSV office seeding process...');

      try {
        // Path to your CSV file - adjust this path based on your project structure
        //const csvFilePath = path.join(process.cwd(), 'src', 'database', 'seeds', 'data', 'Liste des bureaux de change Maroc (2) - Feuil1-3.csv');

        // Alternative paths in case the file is in a different location:
        // const csvFilePath = path.join(process.cwd(), 'Liste des bureaux de change Maroc (2) - Feuil1-3.csv');
        const csvFilePath = path.join(
          process.cwd(),
          'src',
          'database',
          'seeds',
          'relational',
          'office',
          'data',
          'before_trip.csv',
        );

        console.log(`Looking for CSV file at: ${csvFilePath}`);

        const offices =
          await this.csvOfficeFactory.createOfficesFromCSV(csvFilePath);

        console.log(`\n=== SEEDING COMPLETE ===`);
        console.log(`Total offices created: ${offices.length}`);

        // Get statistics by city
        const stats = await this.getStats();
        console.log('\n=== CITY BREAKDOWN ===');
        stats.byCities.forEach((stat) => {
          console.log(`${stat.cityName}: ${stat.officeCount} offices`);
        });
      } catch (error: any) {
        console.error('Error during CSV office seeding:', error);

        if (error.code === 'ENOENT') {
          console.error('\n❌ CSV file not found!');
          console.error(
            'Please make sure the CSV file exists at the specified path.',
          );
          console.error('Current working directory:', process.cwd());
        }

        throw error;
      }
    } else {
      console.log(`Skipping office seeding - ${count} offices already exist`);
    }
  }

  /**
   * Seed offices from a specific CSV file path
   */
  async seedFromCSV(
    csvFilePath: string,
    force: boolean = false,
  ): Promise<OfficeEntity[]> {
    if (!force) {
      const count = await this.repository.count();
      if (count > 0) {
        console.log(
          `Warning: ${count} offices already exist. Use force=true to proceed anyway.`,
        );
        return [];
      }
    }

    console.log(`Seeding offices from CSV: ${csvFilePath}`);

    try {
      const offices =
        await this.csvOfficeFactory.createOfficesFromCSV(csvFilePath);
      console.log(`Successfully created ${offices.length} offices from CSV`);
      return offices;
    } catch (error) {
      console.error(`Error seeding from CSV:`, error);
      throw error;
    }
  }

  /**
   * Clear all offices (use with caution!)
   */
  async clearAllOffices(): Promise<void> {
    console.log('⚠️  Clearing all offices...');

    // Delete in order to respect foreign key constraints
    await this.repository.manager.query(
      'DELETE FROM working_hours WHERE office_id IN (SELECT id FROM offices)',
    );
    await this.repository.manager.query(
      'DELETE FROM office_rates WHERE office_id IN (SELECT id FROM offices)',
    );
    await this.repository.delete({});

    console.log('✅ All offices cleared');
  }

  /**
   * Get seeding statistics
   */
  async getStats(): Promise<{
    total: number;
    byCities: Array<{ cityName: string; officeCount: string }>;
  }> {
    const totalCount = await this.repository.count();

    const stats = await this.repository
      .createQueryBuilder('office')
      .leftJoin('office.city', 'city')
      .select('city.name', 'cityName')
      .addSelect('COUNT(office.id)', 'officeCount')
      .groupBy('city.name')
      .orderBy('COUNT(office.id)', 'DESC')
      .getRawMany();

    return {
      total: totalCount,
      byCities: stats,
    };
  }

  /**
   * Validate CSV file before seeding
   */
  validateCSV(csvFilePath: string): {
    isValid: boolean;
    errors: string[];
    rowCount: number;
  } {
    const errors: string[] = [];

    try {
      if (!fs.existsSync(csvFilePath)) {
        errors.push(`CSV file not found: ${csvFilePath}`);
        return { isValid: false, errors, rowCount: 0 };
      }

      // Basic validation - support both old (data_office.csv) and new (new.csv) formats
      const csvContent = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvContent.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        errors.push('CSV file appears to be empty or has no data rows');
      }

      const header = lines[0];
      const headerLower = header.toLowerCase();
      const isNewFormat =
        headerLower.includes('city') && headerLower.includes('nom');

      if (isNewFormat) {
        const requiredNew = ['City', 'Nom'];
        for (const column of requiredNew) {
          if (!header.includes(column)) {
            errors.push(`Missing required column: ${column}`);
          }
        }
      } else {
        const requiredOld = ['Bureau de change', 'Adresse', 'Ville'];
        for (const column of requiredOld) {
          if (!header.includes(column)) {
            errors.push(`Missing required column: ${column}`);
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        rowCount: Math.max(0, lines.length - 1), // Subtract header row
      };
    } catch (error: any) {
      errors.push(`Error reading CSV file: ${error.message}`);
      return { isValid: false, errors, rowCount: 0 };
    }
  }
}
