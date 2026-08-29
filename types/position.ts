export interface Position {
  id: string;
  code: string;
  title: string;
  description: string | null;
  level: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionInput {
  code: string;
  title: string;
  description?: string;
  level: number;
  isActive?: boolean;
}

export interface UpdatePositionInput {
  code?: string;
  title?: string;
  description?: string;
  level?: number;
  isActive?: boolean;
}

export interface PositionQuery {
  search?: string;
  isActive?: boolean;
}
