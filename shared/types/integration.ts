export type SyncTrigger = 'manual' | 'scheduled' | 'webhook';
export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'partial';

export interface SyncJobError {
  row?: number;
  field?: string;
  message: string;
}

export interface SyncJob {
  id: string;
  provider: string;
  trigger: SyncTrigger;
  status: JobStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: SyncJobError[];
  initiatedBy?: string | null;
}

export interface FieldMapping {
  [erpNextField: string]: string;
}

export interface IntegrationConfig {
  id: string;
  provider: string;
  baseUrl: string;
  apiKey: string;
  fieldMapping: FieldMapping;
  syncSchedule?: string | null;
  isActive: boolean;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportPreviewRow {
  row: number;
  nameEn?: string;
  email?: string;
  valid: boolean;
  errors?: string[];
  [key: string]: unknown;
}

export interface ImportPreview {
  jobId: string;
  preview: ImportPreviewRow[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}
