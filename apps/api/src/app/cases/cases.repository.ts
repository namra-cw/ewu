import { Injectable, NotFoundException } from '@nestjs/common';
import { buildPaginationArgs, type OffsetPaginationDTO } from '@mediastar/shared';
import { DatabaseService, Prisma } from '@mediastar/database';
import {
  ICaseMutationResult,
  ICreateCaseRequest,
  IGroupedCasesByStage,
  IUpdateCaseRequest,
} from './interfaces/case.interface';

const CASE_MUTATION_SELECT = {
  id: true,
  subjectName: true,
  age: true,
  incidentType: true,
  incidentDate: true,
  caseSummary: true,
  address911: true,
  callTime911: true,
  state: true,
  city: true,
  zip: true,
  arrestDate: true,

  assignee: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      type: true,
      status: true,
    },
  },

  stageId: true,

  stage: {
    select: {
      id: true,
      stageTitle: true,
    },
  },

  dueDate: true,
  casePriority: true,
  caseSource: true,
  priority: true,
} satisfies Prisma.CaseSelect;

const DEFAULT_STAGE_TITLE = 'New';

@Injectable()
export class CaseRepository {
  constructor(private readonly db: DatabaseService) {}

  public async findById(id: string): Promise<ICaseMutationResult | null> {
    return this.db.case.findUnique({
      where: { id },
      select: CASE_MUTATION_SELECT,
    }) as Promise<ICaseMutationResult | null>;
  }

  public async findMany(
    query: OffsetPaginationDTO & { stageId?: number },
  ): Promise<[ICaseMutationResult[], number]> {
    const { skip, take } = buildPaginationArgs(query);
    const where: Prisma.CaseWhereInput = {
      ...(query.stageId != null && { stageId: query.stageId }),
    };

    const [data, total] = await Promise.all([
      this.db.case.findMany({
        where,
        select: CASE_MUTATION_SELECT,
        skip,
        take,
        orderBy: { id: query.sort ?? 'desc' },
      }),
      this.db.case.count({ where }),
    ]);

    return [data as ICaseMutationResult[], total];
  }

  public async getAllCasesByAllStages(
    query: OffsetPaginationDTO & { caseLimit?: number },
  ): Promise<[IGroupedCasesByStage[], number]> {
    const { skip, take } = buildPaginationArgs(query);
    const caseLimit = query.caseLimit ?? take;

    const [stagesWithCases, total] = await Promise.all([
      this.db.stages.findMany({
        select: {
          id: true,
          stageTitle: true,
          case: {
            select: CASE_MUTATION_SELECT,
            take: caseLimit,
            orderBy: { id: query.sort ?? 'desc' },
          },
        },
        skip,
        take,
        orderBy: { id: query.sort ?? 'desc' },
      }),
      this.db.stages.count(),
    ]);

    return [
      stagesWithCases.map((stage) => ({
        stageId: stage.id,
        stageTitle: stage.stageTitle,
        cases: stage.case as ICaseMutationResult[],
      })),
      total,
    ];
  }

  public async stageExists(stageId: number): Promise<boolean> {
    const stage = await this.db.stages.findUnique({
      where: { id: stageId },
      select: { id: true },
    });

    return Boolean(stage);
  }

  public async moveCaseToStage(caseId: string, stageId: number): Promise<ICaseMutationResult> {
    return this.db.case.update({
      where: { id: caseId },
      data: { stageId },
      select: CASE_MUTATION_SELECT,
    }) as Promise<ICaseMutationResult>;
  }

  public async create(params: ICreateCaseRequest): Promise<ICaseMutationResult> {
    const assigneeIds = [...new Set(params.assigneeIds)];
    const assignees = await this.db.user.findMany({
      where: {
        id: {
          in: assigneeIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (assignees.length !== assigneeIds.length) {
      throw new NotFoundException('One or more assignees were not found');
    }

    const selectedStage =
      params.stageId != null
        ? await this.db.stages.findUnique({
            where: { id: params.stageId },
            select: { id: true },
          })
        : await this.db.stages.findFirst({
            where: { stageTitle: { equals: DEFAULT_STAGE_TITLE, mode: 'insensitive' } },
            select: { id: true },
          });

    const stage =
      selectedStage ??
      (await this.db.stages.create({
        data: { stageTitle: DEFAULT_STAGE_TITLE },
        select: { id: true },
      }));

    return this.db.case.create({
      data: {
        subjectName: params.subjectName,
        age: params.age,
        incidentType: params.incidentType,
        incidentDate: params.incidentDate,
        caseSummary: params.caseSummary,
        address911: params.address911,
        callTime911: params.callTime911,
        state: params.state,
        city: params.city,
        zip: params.zip,
        arrestDate: params.arrestDate,
        assignee: {
          connect: assigneeIds.map((id) => ({ id })),
        },
        stage: {
          connect: { id: stage.id },
        },
        dueDate: params.dueDate,
        casePriority: params.casePriority,
        caseSource: params.caseSource,
        priority: params.priority,
      },
      select: CASE_MUTATION_SELECT,
    }) as Promise<ICaseMutationResult>;
  }

  public async update(id: string, params: IUpdateCaseRequest): Promise<ICaseMutationResult> {
    let assigneeSet: Array<{ id: number }> | undefined;
    if (params.assigneeIds !== undefined) {
      const assigneeIds = [...new Set(params.assigneeIds)];
      const assignees = await this.db.user.findMany({
        where: {
          id: {
            in: assigneeIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (assignees.length !== assigneeIds.length) {
        throw new NotFoundException('One or more assignees were not found');
      }

      assigneeSet = assigneeIds.map((assigneeId) => ({ id: assigneeId }));
    }

    if (params.stageId !== undefined && params.stageId !== null) {
      const stage = await this.db.stages.findUnique({
        where: { id: params.stageId },
        select: { id: true },
      });

      if (!stage) {
        throw new NotFoundException('Stage not found');
      }
    }

    return this.db.case.update({
      where: { id },
      data: {
        ...(params.subjectName !== undefined && { subjectName: params.subjectName }),
        ...(params.age !== undefined && { age: params.age }),
        ...(params.incidentType !== undefined && { incidentType: params.incidentType }),
        ...(params.incidentDate !== undefined && { incidentDate: params.incidentDate }),
        ...(params.caseSummary !== undefined && { caseSummary: params.caseSummary }),
        ...(params.address911 !== undefined && { address911: params.address911 }),
        ...(params.callTime911 !== undefined && { callTime911: params.callTime911 }),
        ...(params.state !== undefined && { state: params.state }),
        ...(params.city !== undefined && { city: params.city }),
        ...(params.zip !== undefined && { zip: params.zip }),
        ...(params.arrestDate !== undefined && { arrestDate: params.arrestDate }),
        ...(params.dueDate !== undefined && { dueDate: params.dueDate }),
        ...(params.casePriority !== undefined && { casePriority: params.casePriority }),
        ...(params.caseSource !== undefined && { caseSource: params.caseSource }),
        ...(params.priority !== undefined && { priority: params.priority }),
        ...(assigneeSet !== undefined && { assignee: { set: assigneeSet } }),
        ...(params.stageId !== undefined &&
          (params.stageId === null
            ? { stage: { disconnect: true } }
            : { stage: { connect: { id: params.stageId } } })),
      },
      select: CASE_MUTATION_SELECT,
    }) as Promise<ICaseMutationResult>;
  }

  public async delete(id: string): Promise<ICaseMutationResult> {
    return this.db.case.delete({
      where: { id },
      select: CASE_MUTATION_SELECT,
    }) as Promise<ICaseMutationResult>;
  }
}
