import { PrismaClient, InvitationStatus, OrgRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { CreateInvitationDto } from "@issue-tracker/types";

const prisma = new PrismaClient();

export class InvitationService {
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  async createInvitation(
    orgId: string,
    invitedById: string,
    data: CreateInvitationDto
  ) {
    // Verificar que el invitador sea admin
    const inviterMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId: invitedById,
          orgId,
        },
      },
    });

    if (!inviterMembership || inviterMembership.role !== OrgRole.ADMIN) {
      throw new Error("Se requieren permisos de administrador para invitar");
    }

    // Verificar que el email no sea ya miembro de ESTA organización específica
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      // Verificar membresía solo en la organización a la que se está invitando (orgId del parámetro)
      const existingMembership = await prisma.userOrganization.findUnique({
        where: {
          userId_orgId: {
            userId: existingUser.id,
            orgId: orgId, // Usa el orgId del parámetro, no currentOrgId
          },
        },
      });

      if (existingMembership) {
        throw new Error("Este usuario ya es miembro de esta organización");
      }
    }

    // Verificar si ya existe una invitación pendiente
    const pendingInvitation = await prisma.invitation.findFirst({
      where: {
        orgId,
        email: data.email,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (pendingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este email");
    }

    // Crear la invitación (válida por 7 días)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        orgId,
        email: data.email,
        invitedById,
        token: this.generateToken(),
        status: InvitationStatus.PENDING,
        expiresAt,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // TODO: Enviar email con el link de invitación
    // El link sería: `${frontendUrl}/invitations/accept?token=${invitation.token}`

    return invitation;
  }

  async getInvitationByToken(token: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(
        `Esta invitación ya ha sido ${invitation.status.toLowerCase()}`
      );
    }

    if (invitation.expiresAt < new Date()) {
      // Marcar como expirada
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new Error("Esta invitación ha expirado");
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);

    // Verificar que el email del usuario coincida
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // Verificar que no sea ya miembro
    const existingMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: invitation.orgId,
        },
      },
    });

    if (existingMembership) {
      throw new Error("Ya eres miembro de esta organización");
    }

    // Crear la membresía y actualizar la invitación
    const [membership] = await prisma.$transaction([
      prisma.userOrganization.create({
        data: {
          userId,
          orgId: invitation.orgId,
          role: OrgRole.MEMBER,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      }),
    ]);

    // Si el usuario no tiene organización actual, establecer esta
    if (!user.currentOrgId) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentOrgId: invitation.orgId },
      });
    }

    return membership;
  }

  async rejectInvitation(token: string, userId: string) {
    const invitation = await this.getInvitationByToken(token);

    // Verificar que el email del usuario coincida
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // Actualizar el estado
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.REJECTED },
    });

    return { message: "Invitación rechazada" };
  }

  async acceptInvitationById(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(
        `Esta invitación ya ha sido ${invitation.status.toLowerCase()}`
      );
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new Error("Esta invitación ha expirado");
    }

    // Verificar que el email del usuario coincida
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // Verificar que no sea ya miembro
    const existingMembership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: invitation.orgId,
        },
      },
    });

    if (existingMembership) {
      throw new Error("Ya eres miembro de esta organización");
    }

    // Crear la membresía y actualizar la invitación
    const [membership] = await prisma.$transaction([
      prisma.userOrganization.create({
        data: {
          userId,
          orgId: invitation.orgId,
          role: OrgRole.MEMBER,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.ACCEPTED },
      }),
    ]);

    // Si el usuario no tiene organización actual, establecer esta
    if (!user.currentOrgId) {
      await prisma.user.update({
        where: { id: userId },
        data: { currentOrgId: invitation.orgId },
      });
    }

    return membership;
  }

  async rejectInvitationById(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(
        `Esta invitación ya ha sido ${invitation.status.toLowerCase()}`
      );
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new Error("Esta invitación ha expirado");
    }

    // Verificar que el email del usuario coincida
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // Actualizar el estado
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.REJECTED },
    });

    return { message: "Invitación rechazada" };
  }

  async getOrganizationInvitations(orgId: string, userId: string) {
    // Verificar que el usuario sea admin
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!membership || membership.role !== OrgRole.ADMIN) {
      throw new Error("Se requieren permisos de administrador");
    }

    const invitations = await prisma.invitation.findMany({
      where: { orgId },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  }

  async getUserPendingInvitations(email: string) {
    const invitations = await prisma.invitation.findMany({
      where: {
        email,
        status: InvitationStatus.PENDING,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invitations;
  }

  async cancelInvitation(invitationId: string, userId: string) {
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    // Verificar que el usuario sea admin de la org o el que creó la invitación
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId: invitation.orgId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== OrgRole.ADMIN && invitation.invitedById !== userId)
    ) {
      throw new Error("No tienes permisos para cancelar esta invitación");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.EXPIRED },
    });

    return { message: "Invitación cancelada" };
  }
}

export default new InvitationService();
