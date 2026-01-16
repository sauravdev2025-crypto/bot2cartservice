import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { ScheduleBroadcastDto } from '../dtos/schedule.broadcast.dto';
import { BusinessEntity } from '../entities/business.entity';
import { ScheduleBroadcastEntity } from '../entities/schedule.broadcast.entity';
import { ProcessScheduledCsvData } from './process.scheduled.csv.data';

export class ProcessScheduleBroadcast {
  protected body: ScheduleBroadcastDto;
  protected broadcast: ScheduleBroadcastEntity;

  protected file_url: string;

  constructor(protected readonly business: BusinessEntity) {}

  async process(_body: ScheduleBroadcastDto) {
    this.body = _body;

    await this.init();
    await this.validate();

    return this.save();
  }

  async init() {
    let broadcast = await ScheduleBroadcastEntity.findOne({ where: { business_id: this.business.id, id: this.body.id } });
    if (!this.body.id) broadcast = ScheduleBroadcastEntity.create({ business_id: this.business.id });

    this.file_url = this.body.csv_link;
    this.broadcast = broadcast;
  }

  async validate() {
    if (this.broadcast.initiated_at) throw new OperationException('This Message has been sent');

    if (!this.file_url || typeof this.file_url !== 'string' || !this.file_url.trim().toLowerCase().endsWith('.csv')) {
      throw new OperationException('Only CSV files are supported');
    }

    const payload = await new ProcessScheduledCsvData().process(this.file_url, this.body.template_id);
    if (!payload?.length) throw new OperationException('Invalid CSV data no any data is there..');
  }

  async save() {
    this.broadcast.name = this.body.name;
    this.broadcast.description = this?.body.description;
    this.broadcast.template_id = this.body.template_id;
    this.broadcast.scheduled_at = this.body.scheduled_at;
    this.broadcast.csv = this.body.csv_link;

    return this.broadcast.save();
  }
}
