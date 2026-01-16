export class ProcessTransformApiResponse {
  protected entity: { [key: string]: any }[];

  constructor(entity: [key: string][]) {
    this.entity = entity;
  }

  public process(dtos: { db_key: string; external_key: string }[]) {
    const newData = [];

    this.entity.forEach((record) => {
      const transformedRecord = {};

      dtos.forEach((dto) => {
        const keys = dto.db_key.split('.');
        let value = record;

        // Only allow up to 3 levels of nesting
        for (let i = 0; i < keys.length && i < 3; i++) {
          const key = keys[i];
          if (value && value[key] !== undefined) {
            value = value[key];
          } else {
            value = undefined;
            break;
          }
        }

        if (value !== undefined) {
          transformedRecord[dto.external_key] = value;
        }
      });

      newData.push(transformedRecord);
    });

    return newData;
  }
}
