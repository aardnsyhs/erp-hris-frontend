import { Position } from './position';

export type MovementType =
  | 'HIRE'
  | 'PROMOTION'
  | 'TRANSFER'
  | 'DEMOTION'
  | 'REORGANIZATION'
  | 'TERMINATION'
  | 'REACTIVATION';

export interface EmployeeMovementHistory {
  id: string;
  employeeId: string;
  movementType: MovementType;
  fromPositionId: string | null;
  fromPosition?: Position | null;
  toPositionId: string | null;
  toPosition?: Position | null;
  fromDepartmentId: string | null;
  fromDepartment?: {
    id: string;
    code: string;
    name: string;
  } | null;
  toDepartmentId: string | null;
  toDepartment?: {
    id: string;
    code: string;
    name: string;
  } | null;
  effectiveDate: string;
  reason: string | null;
  performedById: string;
  performedBy?: {
    id: string;
    email: string;
    role: string;
  } | null;
  createdAt: string;
}
