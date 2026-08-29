export interface EmergencyContact {
  id: string;
  employeeId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyContactInput {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary?: boolean;
}

export interface UpdateEmergencyContactInput {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  isPrimary?: boolean;
}
