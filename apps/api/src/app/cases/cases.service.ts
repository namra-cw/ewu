import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CaseRepository } from './cases.repository';
import { ICaseMutationResult } from './interfaces/case.interface';
import { CreateCaseDTO } from './dtos/create-case.dto';
import { DragCaseDTO } from './dtos/drag-case.dto';
import { UpdateCaseDTO } from './dtos/update-case.dto';

const CASE_NOT_FOUND = 'Case not found';

@Injectable()
export class CasesService {
  constructor(private readonly caseRepository: CaseRepository) {}

  async getAllCasesByAllStages(): Promise<
    { stageId: number | null; stageTitle: string | null; cases: ICaseMutationResult[] }[]
  > {
    return this.caseRepository.getAllCasesByAllStages();
  }

  async create(dto: CreateCaseDTO): Promise<ICaseMutationResult> {
    return this.caseRepository.create(dto);
  }

  async dragCase(dto: DragCaseDTO): Promise<ICaseMutationResult> {
    const existing = await this.caseRepository.findById(dto.caseId);
    if (!existing) {
      throw new NotFoundException(CASE_NOT_FOUND);
    }

    if (existing.stageId !== dto.currentStageId) {
      throw new BadRequestException('Current stage does not match the case stage');
    }

    const stageExists = await this.caseRepository.stageExists(dto.newStageId);
    if (!stageExists) {
      throw new NotFoundException('Stage not found');
    }

    return this.caseRepository.moveCaseToStage(dto.caseId, dto.newStageId);
  }

  async update(id: string, dto: UpdateCaseDTO): Promise<ICaseMutationResult> {
    const existing = await this.caseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(CASE_NOT_FOUND);
    }

    return this.caseRepository.update(id, dto);
  }

  async remove(id: string): Promise<ICaseMutationResult> {
    const existing = await this.caseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException(CASE_NOT_FOUND);
    }

    await this.caseRepository.delete(id);
    return existing;
  }
}
