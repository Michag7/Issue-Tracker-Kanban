import { Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../schemas/comment.schema";
import * as commentService from "../services/comment.service";
import * as issueService from "../services/issue.service";
import { AppError } from "../middlewares/errorHandler";

export const getComments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { issueId } = req.params;
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const comments = await commentService.getCommentsByIssue(issueId, orgId);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { issueId } = req.params;
    const validatedData = createCommentSchema.parse(req.body);
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const comment = await commentService.createComment(
      issueId,
      req.user!.id,
      orgId,
      validatedData
    );

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

export const updateComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const validatedData = updateCommentSchema.parse(req.body);
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    const comment = await commentService.updateComment(
      commentId,
      req.user!.id,
      orgId,
      validatedData
    );

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    if (error instanceof Error) {
      next(new AppError(error.message, 400));
    } else {
      next(error);
    }
  }
};

export const deleteComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const orgId = req.user?.currentOrgId;

    if (!orgId) {
      throw new AppError("No organization selected", 400);
    }

    await commentService.deleteComment(commentId, req.user!.id, orgId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener comentarios de issue (usa orgId de params)
 */
export const getCommentsForOrganization = async (
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

    const comments = await commentService.getCommentsByIssue(issueId, orgId);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear comentario (usa orgId de params)
 */
export const createCommentForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, issueId } = req.params;
    const validatedData = createCommentSchema.parse(req.body);

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const comment = await commentService.createComment(
      issueId,
      req.user!.id,
      orgId,
      validatedData
    );

    res.status(201).json({
      success: true,
      data: comment,
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
 * Actualizar comentario (usa orgId de params)
 */
export const updateCommentForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, commentId } = req.params;
    const validatedData = updateCommentSchema.parse(req.body);

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    const comment = await commentService.updateComment(
      commentId,
      req.user!.id,
      orgId,
      validatedData
    );

    res.json({
      success: true,
      data: comment,
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
 * Eliminar comentario (usa orgId de params)
 */
export const deleteCommentForOrganization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orgId, commentId } = req.params;

    // Verificar que el usuario es miembro de la organización
    const membership = await issueService.verifyOrgMembership(
      req.user!.id,
      orgId
    );

    if (!membership) {
      throw new AppError("No eres miembro de esta organización", 403);
    }

    await commentService.deleteComment(commentId, req.user!.id, orgId);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
