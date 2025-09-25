import { Office } from 'src/offices/domain/office';

export class OfficeCreatedEvent {
  constructor(public office: Office) {}
}
