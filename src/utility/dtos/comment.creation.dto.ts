import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CommentCreationDto {
  @IsNotEmpty()
  @Expose()
  comments: string;

  @IsNumber()
  @IsOptional()
  @Expose()
  id?: number;

  @IsBoolean()
  @IsOptional()
  is_system_generated?: boolean;
}
