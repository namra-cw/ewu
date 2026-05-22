import { OffsetPaginationDTO } from '@mediastar/shared';
import { PAGINATION_DEFAULTS } from '@mediastar/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

import { CASE_DISPLAY_PROPERTIES, type CaseDisplayPropertyKey } from '../interfaces/case.interface';

export class CasesQueryDTO extends OffsetPaginationDTO {
  @ApiPropertyOptional({ description: 'Filter cases by stage ID', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  stageId?: number;

  @ApiPropertyOptional({
    description: 'Maximum cases to include per stage in grouped response',
    minimum: 1,
    maximum: PAGINATION_DEFAULTS.MAX_LIMIT,
    default: PAGINATION_DEFAULTS.LIMIT,
    example: PAGINATION_DEFAULTS.LIMIT,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(PAGINATION_DEFAULTS.MAX_LIMIT)
  @Type(() => Number)
  caseLimit?: number = PAGINATION_DEFAULTS.LIMIT;

  @ApiPropertyOptional({
    description:
      'Case display fields to include in grouped responses (defaults to caseName + caseNumber + created + priority)',
    enum: CASE_DISPLAY_PROPERTIES.map((property) => property.key),
    isArray: true,
    example: CASE_DISPLAY_PROPERTIES.filter((property) => property.selected).map((property) => property.key),
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    const values = Array.isArray(value) ? value : String(value).split(',');
    return values.map((item) => String(item).trim()).filter(Boolean);
  })
  @IsArray()
  @IsIn(CASE_DISPLAY_PROPERTIES.map((property) => property.key), { each: true })
  displayPropertiesFilter?: CaseDisplayPropertyKey[];
}