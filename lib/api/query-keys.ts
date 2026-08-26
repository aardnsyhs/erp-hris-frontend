export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  departments: {
    all: ['departments'] as const,
    list: (params?: Record<string, unknown>) => ['departments', 'list', params] as const,
    detail: (id: string) => ['departments', 'detail', id] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (params?: Record<string, unknown>) => ['employees', 'list', params] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
  },
  attendances: {
    all: ['attendances'] as const,
    list: (params?: Record<string, unknown>) => ['attendances', 'list', params] as const,
  },
  leaveRequests: {
    all: ['leave-requests'] as const,
    list: (params?: Record<string, unknown>) => ['leave-requests', 'list', params] as const,
    detail: (id: string) => ['leave-requests', 'detail', id] as const,
  },
  payrolls: {
    all: ['payrolls'] as const,
    list: (params?: Record<string, unknown>) => ['payrolls', 'list', params] as const,
    detail: (id: string) => ['payrolls', 'detail', id] as const,
  },
};
