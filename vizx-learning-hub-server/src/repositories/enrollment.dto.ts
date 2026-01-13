export interface CreateEnrollmentDto {
  learningPathId: string;
}

export interface UpdateEnrollmentDto {
  status?: string;
  progress?: number;
  lastAccessedAt?: Date;
  dueDate?: Date;
}

export interface QueryEnrollmentDto {
  status?: string;
  learningPathId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includePath?: boolean;
  includeProgress?: boolean;
}