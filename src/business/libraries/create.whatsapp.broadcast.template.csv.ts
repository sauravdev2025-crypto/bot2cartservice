import { FileUploadService } from '@servicelabsco/slabs-access-manager';
import * as fs from 'fs';
import { TemplateUtil } from '../../common/template.util';
import { CommunicationWhatsappTemplateEntity } from '../entities/communication.whatsapp.template.entity';

export class CreateWhatsappBroadcastTemplateCsv {
  protected template: CommunicationWhatsappTemplateEntity;

  constructor(protected readonly fileUploadService: FileUploadService) {}

  async getLink(id: number): Promise<string> {
    await this.init(id);

    const fileName = await this.generateCsv();
    const fileUrl = await this.uploadCsvFile(fileName);

    fs.unlinkSync(fileName);

    return fileUrl;
  }

  /**
   * Uploads the CSV file to a storage service.
   * @param {string} fileName - The name of the file to upload.
   * @returns {Promise<string>} The URL of the uploaded file.
   */
  private async uploadCsvFile(fileName: string): Promise<string> {
    return this.fileUploadService.uploadFile({
      originalname: fileName,
      buffer: fs.readFileSync(fileName),
      mimetype: 'text/csv',
      ACL: 'private',
    });
  }

  /**
   * Generates a CSV file for the report.
   * @returns {Promise<void>}
   */
  private async generateCsv() {
    const headers = this.getCsvHeaders();
    const fileName = `${this.template.identifier}.csv`;

    // Convert headers to CSV format
    const headerRow = headers.map((h) => h.name).join(',') + '\n';

    const filePointer = fs.openSync(fileName, 'a');

    // Write headers to file
    fs.writeSync(filePointer, headerRow);

    // Write sample data row
    const sampleData = headers.map((h) => h.default).join(',') + '\n';
    fs.writeSync(filePointer, sampleData);
    fs.closeSync(filePointer);

    return fileName;
  }

  private getCsvHeaders() {
    const header = [];

    // Add fixed columns
    header.push({ type: 'number', name: 'dialing_code', default: '91' });
    header.push({ type: 'number', name: 'mobile', default: '98xxxxxxxx' });

    const sample_contents = TemplateUtil.getVariableExamples(this.template?.template_config);
    const variables = Object.keys(sample_contents);

    variables.forEach((value) => {
      header.push({
        type: 'string',
        name: value,
        default: sample_contents[value],
      });
    });

    return header;
  }
  private async init(id: number) {
    this.template = await CommunicationWhatsappTemplateEntity.first(id);
  }
}
