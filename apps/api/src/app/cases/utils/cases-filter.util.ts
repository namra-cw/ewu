import { type CasesQueryDTO } from '../dtos';
import { buildCasesAssigneeFilter } from './cases-assignee-filter.util';
import { buildCasesCreatedAtFilter } from './cases-created-at-filter.util';
import { buildCasesPrTeamFilter } from './cases-pr-filter.util';
import { buildCasesPriorityFilter } from './cases-priority-filter.util';

import { Prisma } from '@mediastar/database';

export function buildCasesWhere(query: CasesQueryDTO): Prisma.CaseWhereInput {
	return {
		...(query.stageId != null && { stageId: query.stageId }),
		...(buildCasesCreatedAtFilter(query.createdAtFrom, query.createdAtTo) ?? {}),
		...(buildCasesPriorityFilter(query.priority) ?? {}),
		...(buildCasesAssigneeFilter(query.assigneeIds) ?? {}),
		...(buildCasesPrTeamFilter(query.caseSource) ?? {}),
	};
}
