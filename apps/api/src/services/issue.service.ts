import prisma from "../db/prisma";
import { CreateIssueInput, UpdateIssueInput } from "../schemas/issue.schema";
import { AppError } from "../middlewares/errorHandler";
import { PAGINATION } from "@issue-tracker/config";
import { IssueStatus, IssuePriority } from "@prisma/client";

interface GetIssuesOptions {
  page: number;
  pageSize: number;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

/**
 * Crea un registro en IssueHistory para trackear cambios
 */
const createHistoryEntry = async (
  issueId: string,
  actorId: string,
  fieldChanged: string,
  oldValue: string | number | Date | null | undefined,
  newValue: string | number | Date | null | undefined
) => {
  await prisma.issueHistory.create({
    data: {
      issueId,
      actorId,
      fieldChanged,
      oldValue: oldValue ? String(oldValue) : null,
      newValue: newValue ? String(newValue) : null,
    },
  });
};

export const getIssues = async (orgId: string, options: GetIssuesOptions) => {
  const {
    page,
    pageSize,
    status,
    priority,
    assigneeId,
    search,
    dueDateFrom,
    dueDateTo,
  } = options;
  const skip = (page - 1) * pageSize;
  const take = Math.min(pageSize, PAGINATION.MAX_PAGE_SIZE);

  interface IssueWhereClause {
    orgId: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeId?: string | null;
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      description?: { contains: string; mode: "insensitive" };
    }>;
    dueDate?: {
      gte?: Date;
      lte?: Date;
    };
  }

  const where: IssueWhereClause = {
    orgId,
  };

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (assigneeId) {
    if (assigneeId === "unassigned") {
      where.assigneeId = null;
    } else {
      where.assigneeId = assigneeId;
    }
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (dueDateFrom || dueDateTo) {
    where.dueDate = {};
    if (dueDateFrom) {
      where.dueDate.gte = new Date(dueDateFrom);
    }
    if (dueDateTo) {
      where.dueDate.lte = new Date(dueDateTo);
    }
  }

  const [issues, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      skip,
      take,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { position: "asc" }, { createdAt: "desc" }],
    }),
    prisma.issue.count({ where }),
  ]);

  return {
    data: issues,
    total,
    page,
    pageSize: take,
    totalPages: Math.ceil(total / take),
  };
};

export const getIssueById = async (id: string, orgId: string) => {
  const issue = await prisma.issue.findFirst({
    where: { id, orgId },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      comments: {
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
      },
    },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  return issue;
};

export const createIssue = async (
  data: CreateIssueInput & { reporterId: string; orgId: string }
) => {
  // Validar que el assignee pertenece a la org si está presente
  if (data.assigneeId) {
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId: data.assigneeId,
          orgId: data.orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        "El usuario asignado no pertenece a la organización",
        400
      );
    }
  }

  // Obtener la última posición en el status correspondiente
  const lastIssue = await prisma.issue.findFirst({
    where: {
      orgId: data.orgId,
      status: data.status || "TODO",
    },
    orderBy: { position: "desc" },
  });

  const position = data.position ?? (lastIssue ? lastIssue.position + 1 : 0);

  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      tags: data.tags || [],
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      position,
      reporterId: data.reporterId,
      assigneeId: data.assigneeId,
      orgId: data.orgId,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Crear registro de historial para la creación
  await createHistoryEntry(
    issue.id,
    data.reporterId,
    "created",
    null,
    "Issue created"
  );

  return issue;
};

export const updateIssue = async (
  id: string,
  data: UpdateIssueInput,
  orgId: string,
  userId: string
) => {
  const existingIssue = await prisma.issue.findFirst({
    where: { id, orgId },
  });

  if (!existingIssue) {
    throw new AppError("Issue not found", 404);
  }

  // Validar que el nuevo assignee pertenece a la org si está presente
  if (data.assigneeId) {
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId: data.assigneeId,
          orgId: orgId,
        },
      },
    });

    if (!membership) {
      throw new AppError(
        "El usuario asignado no pertenece a la organización",
        400
      );
    }
  }

  // Recalcular positions si cambió status o position
  const positionChanged =
    data.position !== undefined && data.position !== existingIssue.position;
  const statusChanged = data.status && data.status !== existingIssue.status;

  if (positionChanged || statusChanged) {
    await prisma.$transaction(async (tx) => {
      const newStatus = data.status || existingIssue.status;
      const newPosition = data.position ?? existingIssue.position;

      // Si cambió de status, reordenar columna origen
      if (statusChanged) {
        const oldColumnIssues = await tx.issue.findMany({
          where: {
            orgId,
            status: existingIssue.status,
            id: { not: id },
          },
          orderBy: { position: "asc" },
        });

        for (let i = 0; i < oldColumnIssues.length; i++) {
          await tx.issue.update({
            where: { id: oldColumnIssues[i].id },
            data: { position: i },
          });
        }
      }

      // Reordenar columna destino
      const targetColumnIssues = await tx.issue.findMany({
        where: {
          orgId,
          status: newStatus,
          id: { not: id },
        },
        orderBy: { position: "asc" },
      });

      // Insertar en nueva posición
      const clampedPosition = Math.min(newPosition, targetColumnIssues.length);

      for (let i = 0; i < targetColumnIssues.length; i++) {
        const newPos = i < clampedPosition ? i : i + 1;
        await tx.issue.update({
          where: { id: targetColumnIssues[i].id },
          data: { position: newPos },
        });
      }

      // Actualizar la issue movida
      await tx.issue.update({
        where: { id },
        data: {
          status: newStatus,
          position: clampedPosition,
        },
      });
    });
  }

  // Crear entradas de historial para cada campo que cambia
  const historyPromises: Promise<void>[] = [];

  if (data.title && data.title !== existingIssue.title) {
    historyPromises.push(
      createHistoryEntry(id, userId, "title", existingIssue.title, data.title)
    );
  }

  if (
    data.description !== undefined &&
    data.description !== existingIssue.description
  ) {
    historyPromises.push(
      createHistoryEntry(
        id,
        userId,
        "description",
        existingIssue.description,
        data.description
      )
    );
  }

  if (data.status && data.status !== existingIssue.status) {
    historyPromises.push(
      createHistoryEntry(
        id,
        userId,
        "status",
        existingIssue.status,
        data.status
      )
    );
  }

  if (data.priority && data.priority !== existingIssue.priority) {
    historyPromises.push(
      createHistoryEntry(
        id,
        userId,
        "priority",
        existingIssue.priority,
        data.priority
      )
    );
  }

  if (
    data.assigneeId !== undefined &&
    data.assigneeId !== existingIssue.assigneeId
  ) {
    historyPromises.push(
      createHistoryEntry(
        id,
        userId,
        "assigneeId",
        existingIssue.assigneeId,
        data.assigneeId
      )
    );
  }

  if (data.dueDate) {
    const newDueDate = new Date(data.dueDate);
    const oldDueDate = existingIssue.dueDate;
    if (!oldDueDate || newDueDate.getTime() !== oldDueDate.getTime()) {
      historyPromises.push(
        createHistoryEntry(
          id,
          userId,
          "dueDate",
          oldDueDate?.toISOString(),
          newDueDate.toISOString()
        )
      );
    }
  }

  // Crear todos los registros de historial
  await Promise.all(historyPromises);

  const issue = await prisma.issue.update({
    where: { id },
    data: {
      title: data.title,
      description:
        data.description !== undefined ? data.description : undefined,
      status: data.status,
      priority: data.priority,
      assigneeId: data.assigneeId !== undefined ? data.assigneeId : undefined,
      tags: data.tags,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      position: data.position,
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  return issue;
};

export const deleteIssue = async (id: string, orgId: string) => {
  const existingIssue = await prisma.issue.findFirst({
    where: { id, orgId },
  });

  if (!existingIssue) {
    throw new AppError("Issue not found", 404);
  }

  await prisma.issue.delete({ where: { id } });
};

/**
 * Obtiene el historial de cambios de una issue
 */
export const getIssueHistory = async (issueId: string, orgId: string) => {
  // Verificar que la issue pertenece a la org
  const issue = await prisma.issue.findFirst({
    where: { id: issueId, orgId },
  });

  if (!issue) {
    throw new AppError("Issue not found", 404);
  }

  const history = await prisma.issueHistory.findMany({
    where: { issueId },
    include: {
      actor: {
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

  return history;
};

/**
 * Verifica que un usuario es miembro de una organización
 */
export const verifyOrgMembership = async (userId: string, orgId: string) => {
  const membership = await prisma.userOrganization.findUnique({
    where: {
      userId_orgId: {
        userId,
        orgId,
      },
    },
  });

  return membership;
};
