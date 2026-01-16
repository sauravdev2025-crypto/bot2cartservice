import { CommonSubscriber } from '@servicelabsco/nestjs-utility-services';
import { DataSource, EventSubscriber, InsertEvent } from 'typeorm';
import { IdentifierGeneratorService } from '../../utility/services/identifier.generator.service';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';
import { CommunicationWhatsappTemplateJob } from '../jobs/communication.whatsapp.template.job';

@EventSubscriber()
export class CommunicationWhatsappTemplateSubscriber extends CommonSubscriber<CommunicationWhatsappTemplateEntity> {
  constructor(
    private readonly dataSource: DataSource,
    protected readonly entityJob: CommunicationWhatsappTemplateJob,
    protected readonly identifierGeneratorService: IdentifierGeneratorService
  ) {
    super();
    dataSource.subscribers.push(this);
  }
  listenTo() {
    return CommunicationWhatsappTemplateEntity;
  }

  async beforeInsert(event: InsertEvent<CommunicationWhatsappTemplateEntity>) {
    if (!event.entity.identifier) event.entity.identifier = await this.identifierGeneratorService.getTemplateIdentifier(event.entity);
  }
}
