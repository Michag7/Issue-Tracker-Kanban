export enum IssueStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum IssuePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum OrgRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  avatarUrl?: string | null;
  currentOrgId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  owner?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserOrganization {
  userId: string;
  orgId: string;
  role: OrgRole;
  joinedAt: Date;
  user?: User;
  organization?: Organization;
}

export interface Invitation {
  id: string;
  orgId: string;
  email: string;
  invitedById: string;
  status: InvitationStatus;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  organization?: Organization;
  invitedBy?: User;
}

export interface Issue {
  id: string;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  tags: string[];
  dueDate?: Date | null;
  reporterId: string;
  assigneeId?: string | null;
  orgId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  reporter?: User;
  assignee?: User | null;
  organization?: Organization;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  issueId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: User;
  issue?: Issue;
}

export interface RefreshToken {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
}

export interface CreateInvitationDto {
  email: string;
}

export interface AcceptInvitationDto {
  token: string;
}

export interface ChangeOrganizationDto {
  orgId: string;
}

export interface CreateIssueDto {
  title: string;
  description?: string;
  priority?: IssuePriority;
  tags?: string[];
  assigneeId?: string;
  dueDate?: Date;
}

export interface UpdateIssueDto {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  tags?: string[];
  dueDate?: Date;
}

export interface MoveIssueDto {
  status: IssueStatus;
}

export interface CreateCommentDto {
  content: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface OrganizationMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: OrgRole;
  joinedAt: Date;
}

export interface IssueHistoryEntry {
  id: string;
  issueId: string;
  actorId: string;
  fieldChanged: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  actor?: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
