export interface WorkSchedule {
  id: string;
  startTime: string; // e.g. "09:00"
  lateToleranceMinutes: number;
  standardWorkMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateWorkScheduleDto {
  startTime?: string;
  lateToleranceMinutes?: number;
  standardWorkMinutes?: number;
}
