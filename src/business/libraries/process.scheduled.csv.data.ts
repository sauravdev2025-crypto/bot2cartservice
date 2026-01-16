import axios from 'axios';

import { parse } from 'csv-parse';

import { OperationException } from '@servicelabsco/nestjs-utility-services';
import { BusinessMetaIntegrationService } from '../../utility/services/business.meta.integration.service';
import { CreateBroadcastMessagePayload } from './create.broadcast.message.payload';

export class ProcessScheduledCsvData {
  protected file_url: string;

  constructor(protected readonly businessMetaIntegrationService?: BusinessMetaIntegrationService) {}

  public async process(file_url: string, template_id: number) {
    this.file_url = file_url;

    const rows = await this.getData();
    if (!rows) return;

    try {
      const data = await this.setData(rows, template_id);
      return data;
    } catch (error) {
      throw new OperationException(`CSV ERROR: ${error?.message}`);
    }
  }

  private async setData(rows: any, template_id: number) {
    const payloads = [];
    for await (const row of rows) {
      const variables = [];

      let dialing_code: string = row?.['dialing_code'];
      let mobile: string = row?.['mobile'];

      const missingDialCodeOrMobile = !dialing_code || !mobile;

      if (missingDialCodeOrMobile && payloads.length > 0) continue;
      if (missingDialCodeOrMobile && payloads.length === 0) throw new OperationException('Mobile and dialing code is required in all fields');

      Object.entries(row).forEach(([key, value]) => {
        if (key === 'dialing_code' || key === 'mobile') return;
        variables.push({ key, value });
      });

      const payload = await new CreateBroadcastMessagePayload(this.businessMetaIntegrationService).create({
        dialing_code,
        mobile,
        variables,
        id: template_id,
      });

      payloads.push({ data: payload, dialing_code: +dialing_code, mobile });
    }

    return payloads;
  }

  private async getData() {
    try {
      const csvUrl = this.file_url;
      const { headers, rows } = (await this.parseCSVFromURL(csvUrl)) as {
        headers: string[];
        rows: Record<string, any>[];
      };

      return rows;
    } catch (error) {
      throw new OperationException(error?.message);
    }
  }

  async parseCSVFromURL(url: string) {
    try {
      // Fetch CSV content from URL
      const response = await axios.get(url);
      const csvData = response.data;

      return new Promise((resolve, reject) => {
        const results: any[] = [];

        // Parse CSV
        parse(csvData, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
          .on('data', (data) => {
            if ('' in data) delete data[''];
            results.push(data);
          })
          .on('error', (error) => {
            reject(error);
          })
          .on('end', () => {
            // If you need headers separately
            const headers = Object.keys(results[0] || {});

            resolve({
              headers,
              rows: results,
            });
          });
      });
    } catch (error) {
      throw new Error(`Failed to fetch or parse CSV: ${error}`);
    }
  }
}
