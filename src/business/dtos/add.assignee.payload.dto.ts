import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class AddAssigneePayloadDto {
  @Expose()
  @IsOptional()
  assignee_id: number;
}
