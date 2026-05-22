import {
  CaseSource,
  Priority,
  Stages,
  UserStatus,
  UserType,
} from '../../../../../../../ewu_task/libs/database/src/lib/generated/prisma/client';

export interface ICaseAssignee {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  type: UserType;
  status: UserStatus;
}

export interface ICaseStage {
  id: number;
  stageTitle: string;
}

export interface IGroupedCasesByStage {
  stageId: number | null;
  stageTitle: string | null;
  cases: ICaseMutationResult[];
}

export interface ICreateCaseRequest {
  subjectName: string;
  age?: number | null;
  incidentType: string;
  incidentDate: Date;
  caseSummary: string | null;
  address911?: string | null;
  callTime911?: string | null;
  state: string;
  city: string;
  zip: string | null;
  arrestDate?: Date | null;
  assigneeIds: number[];
  stageId?: number | null;
  dueDate?: Date | null;
  casePriority: string | null;
  caseSource: CaseSource;
  priority: Priority;
}

export interface IUpdateCaseRequest {
  subjectName?: string;
  age?: number | null;
  incidentType?: string;
  incidentDate?: Date;
  caseSummary?: string | null;
  address911?: string | null;
  callTime911?: string | null;
  state?: string;
  city?: string;
  zip?: string | null;
  arrestDate?: Date | null;
  assigneeIds?: number[];
  stageId?: number | null;
  dueDate?: Date | null;
  casePriority?: string | null;
  caseSource?: CaseSource;
  priority?: Priority;
}

export interface ICaseMutationResult {
  id: string;
  subjectName: string;
  age: number | null;
  incidentType: string;
  incidentDate: Date;
  caseSummary: string | null;
  address911: string | null;
  callTime911: string | null;
  state: string;
  city: string;
  zip: string | null;
  arrestDate: Date | null;
  assignee: ICaseAssignee[];
  stageId: number | null;
  stage: Stages | null;
  dueDate: Date | null;
  casePriority: string | null;
  caseSource: CaseSource;
  priority: Priority;
}
