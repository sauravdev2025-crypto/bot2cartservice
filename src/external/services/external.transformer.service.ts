import { Injectable } from '@nestjs/common';
import { ProcessTransformApiResponse } from '../../utility/libraries/process.transform.api.response';

@Injectable()
export class ExternalTransformerService {
  constructor() {}

  async getListTransformedData(listingData: any, constant: any) {
    const records = new ProcessTransformApiResponse(listingData?.records).process(constant);
    return { ...listingData, records };
  }

  async getTransformedData(data: any, constant: any) {
    const transformedData = new ProcessTransformApiResponse([data]).process(constant);
    return transformedData;
  }
}
