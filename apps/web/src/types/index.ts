// Re-export shared types from packages
export type {
  User,
  Organization,
  Issue,
  Comment,
  Invitation,
  UpdateCommentDto,
  OrganizationMember,
  IssueHistoryEntry,
  OrgRole,
  InvitationStatus,
  IssueStatus,
  IssuePriority,
} from "@issue-tracker/types";

// Frontend-specific types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface CreateOrganizationData {
  name: string;
  slug: string;
  [key: string]: unknown;
}

export interface CreateInvitationData {
  email: string;
  role?: "ADMIN" | "MEMBER";
  [key: string]: unknown;
}

export interface CreateIssueData {
  title: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  tags?: string[];
  dueDate?: string;
  [key: string]: unknown;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  tags?: string[];
  dueDate?: string;
  position?: number;
  [key: string]: unknown;
}

export interface IssueFilters {
  priority?: "LOW" | "MEDIUM" | "HIGH";
  assigneeId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface CreateCommentData {
  content: string;
  [key: string]: unknown;
}

export interface UpdateCommentData {
  content: string;
  [key: string]: unknown;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
