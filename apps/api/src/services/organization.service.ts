import { PrismaClient, OrgRole } from "@prisma/client";
import { CreateOrganizationDto } from "@issue-tracker/types";

const prisma = new PrismaClient();

export class OrganizationService {
  async createOrganization(userId: string, data: CreateOrganizationDto) {
    // Verificar que el slug no esté en uso
    const existing = await prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new Error("El slug de la organización ya está en uso");
    }

    // Crear organización con el usuario como owner y admin
    const organization = await prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: OrgRole.ADMIN,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Actualizar currentOrgId del usuario
    await prisma.user.update({
      where: { id: userId },
      data: { currentOrgId: organization.id },
    });

    return organization;
  }

  async getUserOrganizations(userId: string) {
    const userOrgs = await prisma.userOrganization.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return userOrgs.map((uo) => ({
      ...uo.organization,
      userRole: uo.role,
      memberCount: uo.organization._count.members,
    }));
  }

  async getOrganizationById(orgId: string, userId: string) {
    // Verificar que el usuario sea miembro
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!membership) {
      throw new Error("No tienes acceso a esta organización");
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!organization) {
      throw new Error("Organización no encontrada");
    }

    return {
      ...organization,
      userRole: membership.role,
    };
  }

  async getOrganizationMembers(orgId: string, userId: string) {
    // Verificar que el usuario sea miembro
    await this.verifyMembership(userId, orgId);

    const members = await prisma.userOrganization.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async addMember(
    orgId: string,
    userId: string,
    newMemberEmail: string,
    role: OrgRole = OrgRole.MEMBER
  ) {
    // Verificar que el usuario actual sea admin
    await this.verifyAdmin(userId, orgId);

    // Buscar el usuario por email
    const newMember = await prisma.user.findUnique({
      where: { email: newMemberEmail },
    });

    if (!newMember) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar que no sea ya miembro
    const existing = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId: newMember.id,
          orgId,
        },
      },
    });

    if (existing) {
      throw new Error("El usuario ya es miembro de la organización");
    }

    // Agregar como miembro
    const membership = await prisma.userOrganization.create({
      data: {
        userId: newMember.id,
        orgId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return membership;
  }

  async removeMember(orgId: string, userId: string, memberIdToRemove: string) {
    // Verificar que el usuario actual sea admin
    await this.verifyAdmin(userId, orgId);

    // Verificar que no sea el owner
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (org?.ownerId === memberIdToRemove) {
      throw new Error("No se puede remover al dueño de la organización");
    }

    // Remover la membresía
    await prisma.userOrganization.delete({
      where: {
        userId_orgId: {
          userId: memberIdToRemove,
          orgId,
        },
      },
    });

    return { message: "Miembro removido exitosamente" };
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    memberIdToUpdate: string,
    newRole: OrgRole
  ) {
    // Verificar que el usuario actual sea admin
    await this.verifyAdmin(userId, orgId);

    // Verificar que no sea el owner
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (org?.ownerId === memberIdToUpdate) {
      throw new Error(
        "No se puede cambiar el rol del dueño de la organización"
      );
    }

    // Actualizar el rol
    const updated = await prisma.userOrganization.update({
      where: {
        userId_orgId: {
          userId: memberIdToUpdate,
          orgId,
        },
      },
      data: {
        role: newRole,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updated;
  }

  async switchOrganization(userId: string, orgId: string) {
    // Verificar que el usuario sea miembro
    await this.verifyMembership(userId, orgId);

    // Actualizar currentOrgId
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currentOrgId: orgId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        currentOrgId: true,
      },
    });

    return user;
  }

  // Métodos de verificación
  async verifyMembership(userId: string, orgId: string) {
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    if (!membership) {
      throw new Error("No eres miembro de esta organización");
    }

    return membership;
  }

  async verifyAdmin(userId: string, orgId: string) {
    const membership = await this.verifyMembership(userId, orgId);

    if (membership.role !== OrgRole.ADMIN) {
      throw new Error("Se requieren permisos de administrador");
    }

    return membership;
  }

  async getUserRole(userId: string, orgId: string): Promise<OrgRole | null> {
    const membership = await prisma.userOrganization.findUnique({
      where: {
        userId_orgId: {
          userId,
          orgId,
        },
      },
    });

    return membership?.role || null;
  }
}

export default new OrganizationService();
