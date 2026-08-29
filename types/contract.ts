export type ContractType =
  | 'PERMANENT'
  | 'CONTRACT'
  | 'PROBATION'
  | 'INTERNSHIP';

export type ContractStatus = 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'RENEWED';

export interface EmploymentContract {
  id: string;
  employeeId: string;
  contractType: ContractType;
  contractNumber: string;
  startDate: string;
  endDate: string | null;
  status: ContractStatus;
  renewalReminderDate: string | null;
  notes: string | null;
  documentId: string | null;
  document?: {
    id: string;
    title: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContractInput {
  contractType: ContractType;
  contractNumber: string;
  startDate: string;
  endDate?: string;
  status?: ContractStatus;
  renewalReminderDate?: string;
  notes?: string;
  documentId?: string;
}

export interface UpdateContractStatusInput {
  status: ContractStatus;
  notes?: string;
}
