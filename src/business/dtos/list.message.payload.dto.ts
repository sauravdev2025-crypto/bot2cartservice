import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

class ListMessageRowDto {
  @ApiProperty({ description: 'Unique identifier for the row', example: 'row_1' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Title of the row', example: 'Option 1' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: 'Description for the row', example: 'This is the first option' })
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}

class ListMessageSectionDto {
  @ApiProperty({ description: 'Title of the section', example: 'Section 1' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Rows in the section',
    type: [ListMessageRowDto],
    example: [
      { id: 'row_1', text: 'Option 1', description: 'This is the first option' },
      { id: 'row_2', text: 'Option 2' },
    ],
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListMessageRowDto)
  rows: ListMessageRowDto[];
}

export class ListMessagePayloadDto {
  @ApiProperty({ description: 'Body text of the list message', example: 'Please select an option:' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  html: string;

  @ApiProperty({
    description: 'Sections containing rows for the list message',
    type: [ListMessageSectionDto],
    example: [
      {
        title: 'Section 1',
        rows: [
          { id: 'row_1', text: 'Option 1', description: 'This is the first option' },
          { id: 'row_2', text: 'Option 2' },
        ],
      },
    ],
  })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ListMessageSectionDto)
  sections: ListMessageSectionDto[];

  @ApiPropertyOptional({ description: 'Header text for the list message', example: 'Header Title' })
  @Expose()
  @IsOptional()
  @IsString()
  header?: string;

  @ApiPropertyOptional({ description: 'Footer text for the list message', example: 'Footer note' })
  @Expose()
  @IsOptional()
  @IsString()
  footer?: string;

  @ApiPropertyOptional({ description: 'Button name for the list message', example: 'Choose' })
  @Expose()
  @IsOptional()
  @IsString()
  buttonName?: string;
}
