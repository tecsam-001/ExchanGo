import { ApiProperty } from '@nestjs/swagger';

export class WorkingHour {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the working hour record',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Day of the week',
    example: 'Monday',
    enum: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ],
  })
  dayOfWeek: string;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if the day is active for working hours',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: String,
    description: 'Start time of working hours',
    example: '09:00',
    nullable: true,
  })
  fromTime: string;

  @ApiProperty({
    type: String,
    description: 'End time of working hours',
    example: '17:00',
    nullable: true,
  })
  toTime: string;

  @ApiProperty({
    type: Boolean,
    description: 'Indicates if there is a break during this day',
    example: false,
  })
  hasBreak: boolean;

  @ApiProperty({
    type: String,
    description: 'Start time of break',
    example: '12:00',
    nullable: true,
  })
  breakFromTime: string;

  @ApiProperty({
    type: String,
    description: 'End time of break',
    example: '13:00',
    nullable: true,
  })
  breakToTime: string;

  @ApiProperty({
    type: String,
    description: 'ID of the associated office',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nullable: true,
  })
  officeId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T12:00:00Z',
  })
  updatedAt: Date;
}
