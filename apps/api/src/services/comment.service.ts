import prisma from "../db/prisma";
import {
  CreateCommentInput,
  UpdateCommentInput,
} from "../schemas/comment.schema";
import { AppError } from "../middlewares/errorHandler";

export const getCommentsByIssue = async (issueId: string, orgId: string) => {
  // Verificar que la issue existe y pertenece a la org
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, orgId },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  const comments = await prisma.comment.findMany({
    where: { issueId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return comments;
};

export const createComment = async (
  issueId: string,
  authorId: string,
  orgId: string,
  data: CreateCommentInput
) => {
  // Verificar que la issue existe y pertenece a la org
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, orgId },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  const comment = await prisma.comment.create({
    data: {
      content: data.content,
      issueId,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return comment;
};

export const updateComment = async (
  commentId: string,
  authorId: string,
  orgId: string,
  data: UpdateCommentInput
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      issue: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  // Verificar que la issue pertenece a la org
  if (comment.issue.orgId !== orgId) {
    throw new AppError("Comment not found", 404);
  }

  // Verificar que el usuario es el autor del comentario
  if (comment.authorId !== authorId) {
    throw new AppError("You can only edit your own comments", 403);
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content: data.content },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return updatedComment;
};

export const deleteComment = async (
  commentId: string,
  authorId: string,
  orgId: string
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      issue: true,
    },
  });

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  // Verificar que la issue pertenece a la org
  if (comment.issue.orgId !== orgId) {
    throw new AppError("Comment not found", 404);
  }

  // Verificar que el usuario es el autor del comentario
  if (comment.authorId !== authorId) {
    throw new AppError("You can only delete your own comments", 403);
  }

  await prisma.comment.delete({ where: { id: commentId } });
};
