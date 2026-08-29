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
  contracts: {
    all: ['contracts'] as const,
    list: (employeeId: string) => ['contracts', 'list', employeeId] as const,
    detail: (employeeId: string, id: string) =>
      ['contracts', 'detail', employeeId, id] as const,
  },
  positions: {
    all: ['positions'] as const,
    list: (params?: unknown) => ['positions', 'list', params] as const,
    detail: (id: string) => ['positions', 'detail', id] as const,
  },
  positionAssignments: {
    all: ['position-assignments'] as const,
    list: (employeeId: string) =>
      ['position-assignments', 'list', employeeId] as const,
    current: (employeeId: string) =>
      ['position-assignments', 'current', employeeId] as const,
  },
  reportingLines: {
    all: ['reporting-lines'] as const,
    list: (employeeId: string) =>
      ['reporting-lines', 'list', employeeId] as const,
    current: (employeeId: string) =>
      ['reporting-lines', 'current', employeeId] as const,
  },
  movementHistories: {
    all: ['movement-histories'] as const,
    list: (employeeId: string) =>
      ['movement-histories', 'list', employeeId] as const,
  },
};

