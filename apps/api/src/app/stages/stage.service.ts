import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { CreateStageDTO } from './dtos';
import type { IStageMutationResult } from './interfaces/stage.interface';
import { StageRepository } from './stage.repository';

const STAGE_NOT_FOUND = 'Stage not found';

@Injectable()
export class StageService {
	constructor(private readonly stageRepository: StageRepository) {}

	async create(dto: CreateStageDTO): Promise<IStageMutationResult> {
		const existing = await this.stageRepository.findByTitle(dto.stageTitle);
		if (existing) {
			throw new ConflictException(`Stage already exists`);
		}

		return this.stageRepository.create({ stageTitle: dto.stageTitle });
	}

	async remove(id: number): Promise<IStageMutationResult> {
		const stage = await this.stageRepository.findById(id);
		if (!stage) {
			throw new NotFoundException(STAGE_NOT_FOUND);
		}

		const assignedCases = await this.stageRepository.countCasesByStageId(id);
		if (assignedCases > 0) {
			throw new BadRequestException(
				`Cannot delete stage case(s) still assigned`,
			);
		}

		await this.stageRepository.delete(id);
		return stage;
	}
}
