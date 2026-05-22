import { OffsetPaginationDTO } from '@mediastar/shared';
import { PAGINATION_DEFAULTS } from '@mediastar/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

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
}