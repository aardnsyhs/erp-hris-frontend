import { Position } from './position';

export type AssignmentType =
  | 'INITIAL'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'DEMOTION'
  | 'REORGANIZATION';

export interface EmployeePositionAssignment {
  id: string;
  employeeId: string;
  positionId: string;
  position?: Position | null;
  departmentId: string;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  assignmentType: AssignmentType;
  notes: string | null;
  assignedById: string;
  assignedBy?: {
    id: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionAssignmentInput {
  positionId: string;
  departmentId: string;
  effectiveFrom: string;
  assignmentType: AssignmentType;
  notes?: string;
}
