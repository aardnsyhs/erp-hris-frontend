export type DocumentType =
  | 'KTP'
  | 'NPWP'
  | 'BPJS_KES'
  | 'BPJS_TK'
  | 'IJAZAH'
  | 'SERTIFIKAT'
  | 'KONTRAK'
  | 'LAINNYA';

export type ScanStatus = 'PENDING' | 'CLEAN' | 'QUARANTINED';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  documentType: DocumentType;
  title: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  scanStatus: ScanStatus;
  expiryDate: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDocumentQueryParams {
  page?: number;
  limit?: number;
  documentType?: DocumentType;
}

export interface EmployeeDocumentListResponse {
  data: EmployeeDocument[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
