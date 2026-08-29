export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  departments: {
    all: ['departments'] as const,
    list: (params?: unknown) => ['departments', 'list', params] as const,
    detail: (id: string) => ['departments', 'detail', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params?: unknown) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  attendances: {
    all: ['attendances'] as const,
    list: (params?: unknown) => ['attendances', 'list', params] as const,
  },
  workSchedule: {
    active: ['work-schedule', 'active'] as const,
  },
  leaveRequests: {
    all: ['leave-requests'] as const,
    list: (params?: unknown) => ['leave-requests', 'list', params] as const,
    detail: (id: string) => ['leave-requests', 'detail', id] as const,
  },
  payrolls: {
    all: ['payrolls'] as const,
    list: (params?: unknown) => ['payrolls', 'list', params] as const,
    detail: (id: string) => ['payrolls', 'detail', id] as const,
  },
  auditLogs: {
    all: ['audit-logs'] as const,
    list: (params?: unknown) => ['audit-logs', 'list', params] as const,
    detail: (id: string) => ['audit-logs', 'detail', id] as const,
  },
  emergencyContacts: {
    all: ['emergency-contacts'] as const,
    list: (employeeId: string) =>
      ['emergency-contacts', 'list', employeeId] as const,
  },
  employeeDocuments: {
    all: ['employee-documents'] as const,
    list: (employeeId: string, params?: unknown) =>
      ['employee-documents', 'list', employeeId, params] as const,
    detail: (employeeId: string, id: string) =>
      ['employee-documents', 'detail', employeeId, id] as const,
  },
};

