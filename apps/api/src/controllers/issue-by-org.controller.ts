import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import * as issueService from "../services/issue.service";
import { AppError } from "../middlewares/errorHandler";
import { IssueStatus, IssuePriority } from "@prisma/client";

export const getIssuesByOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 1000; // High limit for Kanban
    const status = req.query.status as string | undefined;
    const priority = req.query.priority as string | undefined;
    const assigneeId = req.query.assigneeId as string | undefined;
    const search = req.query.search as string | undefined;
    const dueDateFrom = req.query.dueDateFrom as string | undefined;
    const dueDateTo = req.query.dueDateTo as string | undefined;

    if (!orgId) {
      throw new AppError("Organization ID is required", 400);
    }

    // Verificar que el usuario sea miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );
    if (!membership) {
      throw new AppError("You are not a member of this organization", 403);
    }

    const result = await issueService.getIssues(orgId, {
      page,
      pageSize,
      status: status as IssueStatus | undefined,
      priority: priority as IssuePriority | undefined,
      assigneeId,
      search,
      dueDateFrom,
      dueDateTo,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
