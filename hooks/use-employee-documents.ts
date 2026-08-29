import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/axios';
import { queryKeys } from '@/lib/api/query-keys';
import {
  EmployeeDocument,
  EmployeeDocumentListResponse,
  EmployeeDocumentQueryParams,
} from '@/types/employee-document';

export function useEmployeeDocuments(
  employeeId: string,
  params?: EmployeeDocumentQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.employeeDocuments.list(employeeId, params),
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeDocumentListResponse>(
        `/employees/${employeeId}/documents`,
        {
          params: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 10,
            documentType: params?.documentType || undefined,
          },
        },
      );
      return data;
    },
    enabled: !!employeeId && enabled,
  });
}

export function useUploadEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post<EmployeeDocument>(
        `/employees/${employeeId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-documents', 'list', employeeId],
      });
    },
  });
}

export async function downloadEmployeeDocument(
  employeeId: string,
  documentId: string,
  fileName: string,
) {
  const response = await apiClient.get(
    `/employees/${employeeId}/documents/${documentId}/download`,
    {
      responseType: 'blob',
    },
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useDeleteEmployeeDocument(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete<{ message: string }>(
        `/employees/${employeeId}/documents/${id}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employee-documents', 'list', employeeId],
      });
    },
  });
}
