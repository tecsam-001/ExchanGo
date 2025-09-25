import { Office } from '../../../../domain/office';
import { OfficeEntity } from '../entities/office.entity';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { UserMapper } from 'src/users/infrastructure/persistence/relational/mappers/user.mapper';
import { FileEntity } from 'src/files/infrastructure/persistence/relational/entities/file.entity';
import { CityEntity } from 'src/cities/infrastructure/persistence/relational/entities/city.entity';
import { CityMapper } from 'src/cities/infrastructure/persistence/relational/mappers/city.mapper';
import { CountryEntity } from 'src/countries/infrastructure/persistence/relational/entities/country.entity';
import { CountryMapper } from 'src/countries/infrastructure/persistence/relational/mappers/country.mapper';
import { OfficeRateMapper } from 'src/office-rates/infrastructure/persistence/relational/mappers/office-rate.mapper';
import { WorkingHourMapper } from 'src/working-hours/infrastructure/persistence/relational/mappers/working-hour.mapper';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';

export class OfficeMapper {
  static toDomain(raw: OfficeEntity): Office {
    const domainEntity = new Office();
    domainEntity.id = raw.id;
    domainEntity.officeName = raw.officeName;
    domainEntity.registrationNumber = raw.registrationNumber;
    domainEntity.currencyExchangeLicenseNumber =
      raw.currencyExchangeLicenseNumber;
    domainEntity.address = raw.address;
    if (raw.city) {
      domainEntity.city = CityMapper.toDomain(raw.city);
    }
    if (raw.country) {
      domainEntity.country = CountryMapper.toDomain(raw.country);
    }
    domainEntity.state = raw.state;
    domainEntity.primaryPhoneNumber = raw.primaryPhoneNumber;
    domainEntity.secondaryPhoneNumber = raw.secondaryPhoneNumber;
    domainEntity.thirdPhoneNumber = raw.thirdPhoneNumber;
    domainEntity.whatsappNumber = raw.whatsappNumber;
    domainEntity.location = raw.location;
    domainEntity.logo = raw.logo;
    domainEntity.mainImage = raw.mainImage;
    if (raw.images) {
      domainEntity.images = raw.images.map((image) =>
        FileMapper.toDomain(image),
      );
    }
    if (raw.slug) {
      domainEntity.slug = raw.slug;
    }
    if (raw.owner) {
      domainEntity.owner = UserMapper.toDomain(raw.owner);
    }
    domainEntity.isActive = raw.isActive;
    domainEntity.isVerified = raw.isVerified;
    domainEntity.isFeatured = raw.isFeatured;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = raw.deletedAt;
    domainEntity.email = raw.email;

    if (raw.rates && Array.isArray(raw.rates)) {
      domainEntity.rates = raw.rates.map((rate) =>
        OfficeRateMapper.toDomain(rate),
      );
    } else {
      domainEntity.rates = [];
    }

    if (raw.workingHours && Array.isArray(raw.workingHours)) {
      domainEntity.workingHours = raw.workingHours.map((workingHour) =>
        WorkingHourMapper.toDomain(workingHour),
      );
    } else {
      domainEntity.workingHours = [];
    }

    if (raw.workingHours && Array.isArray(raw.workingHours)) {
      domainEntity.todayWorkingHours = raw.workingHours.find(
        (workingHour) =>
          workingHour.dayOfWeek ===
          new Date()
            .toLocaleString('en-us', {
              weekday: 'long',
            })
            .toUpperCase(),
      );
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Office): OfficeEntity {
    let owner: UserEntity | undefined = undefined;

    if (domainEntity.owner) {
      owner = new UserEntity();
      owner.id = Number(domainEntity.owner.id);
    }

    let logo: FileEntity | undefined | null = undefined;

    if (domainEntity.logo) {
      logo = new FileEntity();
      logo.id = domainEntity.logo.id;
      logo.path = domainEntity.logo.path;
    } else if (domainEntity.logo === null) {
      logo = null;
    }

    let mainImage: FileEntity | undefined | null = undefined;

    if (domainEntity.mainImage) {
      mainImage = new FileEntity();
      mainImage.id = domainEntity.mainImage.id;
      mainImage.path = domainEntity.mainImage.path;
    } else if (domainEntity.mainImage === null) {
      mainImage = null;
    }

    let city: CityEntity | undefined | null = undefined;

    if (domainEntity.city) {
      city = new CityEntity();
      city.id = domainEntity.city.id;
    } else if (domainEntity.city === null) {
      city = null;
    }

    let country: CountryEntity | undefined | null = undefined;

    if (domainEntity.country) {
      country = new CountryEntity();
      country.id = domainEntity.country.id;
    } else if (domainEntity.country === null) {
      country = null;
    }

    let images: FileEntity[] = [];

    if (domainEntity.images && domainEntity.images.length > 0) {
      images = domainEntity.images.map((image) => {
        const fileEntity = new FileEntity();
        fileEntity.id = image.id;
        fileEntity.path = image.path;
        return fileEntity;
      });
    }

    const persistenceEntity = new OfficeEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }

    persistenceEntity.officeName = domainEntity.officeName;

    persistenceEntity.registrationNumber = domainEntity.registrationNumber;
    persistenceEntity.currencyExchangeLicenseNumber =
      domainEntity.currencyExchangeLicenseNumber;
    persistenceEntity.address = domainEntity.address;
    persistenceEntity.city = city as CityEntity | null;
    persistenceEntity.location = domainEntity.location;
    persistenceEntity.state = domainEntity.state;
    persistenceEntity.country = country as CountryEntity | null;
    persistenceEntity.primaryPhoneNumber = domainEntity.primaryPhoneNumber;
    persistenceEntity.secondaryPhoneNumber = domainEntity.secondaryPhoneNumber;
    persistenceEntity.thirdPhoneNumber = domainEntity.thirdPhoneNumber;
    persistenceEntity.whatsappNumber = domainEntity.whatsappNumber;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.owner = owner as UserEntity;
    persistenceEntity.logo = domainEntity.logo as FileEntity | null;
    persistenceEntity.mainImage = mainImage as FileEntity | null;
    persistenceEntity.images = images;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.email = domainEntity.email;

    return persistenceEntity;
  }
}
