export interface UpdateModuleProgressDto {
  progress?: number;
  timeSpent?: number;
  status?: string;
  notes?: string;
  bookmarked?: boolean;
  quizScore?: number;
}

export interface MarkModuleCompleteDto {
  quizScore?: number;
  timeSpent?: number;
  notes?: string;
}

export interface QueryModuleProgressDto {
  status?: string;
  enrollmentId?: string;
  moduleId?: string;
  bookmarked?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeModule?: boolean;
}

export interface BulkUpdateProgressDto {
  moduleId: string;
  progress: number;
  timeSpent?: number;
  status?: string;
}

export interface ContentProgressDto {
  contentType: string;
  contentId?: string;
  progress: number;
  duration?: number;
  completed?: boolean;
}