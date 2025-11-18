import { z } from "zod";
import { IssueStatus, IssuePriority } from "@issue-tracker/types";

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  status: z.nativeEnum(IssueStatus).optional().default(IssueStatus.TODO),
  priority: z
    .nativeEnum(IssuePriority)
    .optional()
    .default(IssuePriority.MEDIUM),
  assigneeId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().optional(),
  position: z.number().optional(),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(IssueStatus).optional(),
  priority: z.nativeEnum(IssuePriority).optional(),
  assigneeId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  dueDate: z.string().datetime().optional(),
  position: z.number().optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;
export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
