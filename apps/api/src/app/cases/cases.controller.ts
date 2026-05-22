import { ApiStandardErrors, ApiWrappedResponse, ErrorResponseVM } from '@mediastar/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreateCaseDTO } from './dtos/create-case.dto';
import { DragCaseDTO } from './dtos/drag-case.dto';
import { UpdateCaseDTO } from './dtos/update-case.dto';
import { CasesService } from './cases.service';
import { ICaseMutationResult } from './interfaces/case.interface';

@ApiTags('Cases')
@ApiStandardErrors()
@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cases grouped by stages' })
  @ApiWrappedResponse({
    description: 'Cases grouped by stages',
    dataSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stageId: { type: 'number', nullable: true },
          stageTitle: { type: 'string', nullable: true },
          cases: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                subjectName: { type: 'string' },
              },
              required: ['id', 'subjectName'],
            },
          },
        },
        required: ['stageId', 'stageTitle', 'cases'],
      },
    },
  })
  getAllByStages(): Promise<
    { stageId: number | null; stageTitle: string | null; cases: ICaseMutationResult[] }[]
  > {
    return this.casesService.getAllCasesByAllStages();
  }

  @Post()
  @ApiOperation({ summary: 'Create a case' })
  @ApiWrappedResponse({
    description: 'Created case',
    status: 201,
    dataSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        caseNumber: { type: 'string' },
      },
      required: ['id', 'caseNumber'],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: ErrorResponseVM,
  })
  create(@Body() dto: CreateCaseDTO): Promise<ICaseMutationResult> {
    return this.casesService.create(dto);
  }

  @Patch('drag')
  @ApiOperation({ summary: 'Move case from current stage to a new stage (drag action)' })
  @ApiWrappedResponse({
    description: 'Moved case',
    dataSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        stageId: { type: 'number', nullable: true },
      },
      required: ['id', 'stageId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error or current stage mismatch',
    type: ErrorResponseVM,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Case or stage not found',
    type: ErrorResponseVM,
  })
  dragCase(@Body() dto: DragCaseDTO): Promise<ICaseMutationResult> {
    return this.casesService.dragCase(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiWrappedResponse({
    description: 'Updated case',
    dataSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subjectName: { type: 'string' },
      },
      required: ['id', 'subjectName'],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error',
    type: ErrorResponseVM,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Case not found',
    type: ErrorResponseVM,
  })
  @ApiParam({ name: 'id', description: 'Case ID', type: String })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCaseDTO,
  ): Promise<ICaseMutationResult> {
    return this.casesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a case' })
  @ApiWrappedResponse({
    description: 'Deleted case',
    dataSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        subjectName: { type: 'string' },
      },
      required: ['id', 'subjectName'],
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Case not found',
    type: ErrorResponseVM,
  })
  @ApiParam({ name: 'id', description: 'Case ID', type: String })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<ICaseMutationResult> {
    return this.casesService.remove(id);
  }
}
