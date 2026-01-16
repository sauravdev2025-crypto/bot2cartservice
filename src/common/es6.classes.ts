import { RedisIoAdapter } from './adapters/redis.io.adapter';
import { BusinessParamDto } from './dtos/business.param.dto';
import { CommonListFilterDto } from './dtos/common.list.filter.dto';
import { IdPayloadDto } from './dtos/id.payload.dto';

const es6Classes = {
  adapters: [RedisIoAdapter],
  dtos: [BusinessParamDto, CommonListFilterDto, IdPayloadDto],
};

export default es6Classes;
