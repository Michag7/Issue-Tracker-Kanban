import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import { createIssueSchema, updateIssueSchema } from "../schemas/issue.schema";
import * as issueService from "../services/issue.service";
import { AppError } from "../middlewares/errorHandler";
import { IssueStatus, IssuePriority } from "@prisma/client";

/**
 * Crear issue para una organización específica (usa orgId de params, NO currentOrgId)
 */
export const createIssueForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId } = req.params;
    const validatedData = createIssueSchema.parse(req.body);

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const issue = await issueService.createIssue({
      ...validatedData,
      reporterId: req.user!.id,
      orgId,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

/**
 * Obtener issue por ID (usa orgId de params)
 */
export const getIssueByIdForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, issueId } = req.params;

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const issue = await issueService.getIssueById(issueId, orgId);

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar issue (usa orgId de params)
 */
export const updateIssueForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, issueId } = req.params;
    const validatedData = updateIssueSchema.parse(req.body);

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const issue = await issueService.updateIssue(
      issueId,
      validatedData,
      orgId,
      req.user!.id
    );

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

/**
 * Eliminar issue (usa orgId de params)
 */
export const deleteIssueForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, issueId } = req.params;

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    await issueService.deleteIssue(issueId, orgId);

    res.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de issue (usa orgId de params)
 */
export const getIssueHistoryForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, issueId } = req.params;

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const history = await issueService.getIssueHistory(issueId, orgId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getIssues = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const statusParam = req.query.status as string | undefined;
    const priorityParam = req.query.priority as string | undefined;
    const assigneeId = req.query.assigneeId as string | undefined;
    const search = req.query.search as string | undefined;
    const dueDateFrom = req.query.dueDateFrom as string | undefined;
    const dueDateTo = req.query.dueDateTo as string | undefined;

    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const result = await issueService.getIssues(orgId, {
      page,
      pageSize,
      status: statusParam as IssueStatus | undefined,
      priority: priorityParam as IssuePriority | undefined,
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

export const getIssueById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const issue = await issueService.getIssueById(id, orgId);

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = createIssueSchema.parse(req.body);
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const issue = await issueService.createIssue({
      ...validatedData,
      reporterId: req.user!.id,
      orgId,
    });

    res.status(201).json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

export const updateIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const validatedData = updateIssueSchema.parse(req.body);
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const issue = await issueService.updateIssue(
      id,
      validatedData,
      orgId,
      req.user!.id
    );

    res.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

export const deleteIssue = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    await issueService.deleteIssue(id, orgId);

    res.json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getIssueHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const history = await issueService.getIssueHistory(id, orgId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
