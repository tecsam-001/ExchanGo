import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';
import { User } from 'src/users/domain/user';
import { City } from 'src/cities/domain/city';
import { TriggerType } from 'src/alerts/infrastructure/persistence/relational/entities/alert.entity';

export class Alert {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  triggerType: TriggerType;

  @ApiProperty({
    type: String,
  })
  whatsAppNumber: string;

  @ApiProperty({
    type: [City],
  })
  cities?: City[] | null;

  @ApiProperty({
    type: [Office],
  })
  offices?: Office[] | null;

  @ApiProperty({
    type: Currency,
  })
  currency: Currency;

  @ApiProperty({
    type: User,
  })
  user?: User | null;

  @ApiProperty({
    type: Number,
  })
  baseCurrencyAmount: number;

  @ApiProperty({
    type: Number,
  })
  targetCurrencyAmount: number;

  @ApiProperty({
    type: Currency,
  })
  targetCurrency: Currency;

  @ApiProperty({
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}
