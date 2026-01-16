import { AccessException, OperationException, PlatformUtility } from '@servicelabsco/nestjs-utility-services';
import { AccessBusinessEntity, AddApiAccountDto, ProcessCommonData } from '@servicelabsco/slabs-access-manager';
import { CommunicationApiAccountEntity } from '../entities/communication.api.account.entity';

export class ProcessApiAccountData extends ProcessCommonData {
  protected payload: AddApiAccountDto;
  protected allowedColumns = [];
  private credential: string;

  constructor(private readonly business: AccessBusinessEntity) {
    super();
  }

  async process(payload: AddApiAccountDto): Promise<CommunicationApiAccountEntity> {
    this.payload = payload;

    await this.validate();

    const account = await this.set();
    if (this.payload.id) return account;

    account.credential = this.credential;
    return account;
  }

  private async set() {
    let entity: CommunicationApiAccountEntity = CommunicationApiAccountEntity.create({ business_id: this.business.id });

    entity.name = this.payload.name;

    const payload = this.payload;
    if (this.payload.id) entity = await CommunicationApiAccountEntity.first(payload.id);
    else {
      entity.identifier = PlatformUtility.generateRandomAlpha(24).toLowerCase();
      entity.credential = this.getCredential();
    }

    if (entity?.business_id !== this.business.id) throw new AccessException();

    for (const column of this.allowedColumns) entity[column] = payload[column];

    return entity.save();
  }

  private async validate() {
    const existing = await CommunicationApiAccountEntity.find({
      where: { business_id: this.business.id },
    });

    if (existing?.length > 3) throw new OperationException('You cannot generate credentials more than 4');

    const name = await CommunicationApiAccountEntity.findOne({
      where: { business_id: this.business.id, name: this.payload.name },
    });

    if (name) this.setColumnError('name', 'duplicate name');

    this.throwExceptionOnError();
    await this.setAllowedColumns();
  }

  private async setAllowedColumns() {
    this.allowedColumns = Object.keys(this.payload);
  }

  private getCredential() {
    this.credential = PlatformUtility.generateRandomAlphaNumeric(32).toLowerCase();

    return this.credential;
  }
}
