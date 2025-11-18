import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Limpiar datos existentes
  await prisma.issueHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // 3 usuarios: admin, member1, member2
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@acme.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: "member1@acme.com",
      password: hashedPassword,
      name: "Member One",
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: "member2@acme.com",
      password: hashedPassword,
      name: "Member Two",
    },
  });

  // 1 organización: Acme Inc.
  const org = await prisma.organization.create({
    data: {
      name: "Acme Inc.",
      slug: "acme-inc",
      ownerId: admin.id,
    },
  });

  // Crear membresías
  await prisma.userOrganization.createMany({
    data: [
      { userId: admin.id, orgId: org.id, role: "ADMIN" },
      { userId: member1.id, orgId: org.id, role: "MEMBER" },
      { userId: member2.id, orgId: org.id, role: "MEMBER" },
    ],
  });

  // 30 issues variados
  const priorities = ["LOW", "MEDIUM", "HIGH"] as const;
  const statuses = ["TODO", "IN_PROGRESS", "DONE"] as const;
  const users = [admin, member1, member2];

  const issueTemplates = [
    {
      title: "Setup project infrastructure",
      description: "Configure CI/CD pipeline and deployment",
    },
    {
      title: "Implement authentication system",
      description:
        "# Auth System\n\n- JWT tokens\n- OAuth2 providers\n- Session management",
    },
    {
      title: "Design database schema",
      description: "Create ERD and migration files",
    },
    {
      title: "Build user dashboard",
      description: "Dashboard with analytics and charts",
    },
    {
      title: "Add email notifications",
      description: "Send emails for important events",
    },
    {
      title: "Fix login bug",
      description:
        "## Bug Report\n\nUsers cannot login with special characters in password",
    },
    {
      title: "Optimize database queries",
      description: "Add indexes and optimize N+1 queries",
    },
    { title: "Update dependencies", description: "Upgrade to latest versions" },
    {
      title: "Write API documentation",
      description: "# API Docs\n\nDocument all endpoints with examples",
    },
    {
      title: "Implement file upload",
      description: "Support for images and PDFs",
    },
    {
      title: "Add search functionality",
      description: "Full-text search with filters",
    },
    {
      title: "Create admin panel",
      description: "Admin dashboard for user management",
    },
    {
      title: "Setup monitoring",
      description: "Add logging and error tracking",
    },
    {
      title: "Implement caching",
      description: "Redis cache for API responses",
    },
    { title: "Add rate limiting", description: "Prevent API abuse" },
    {
      title: "Fix mobile responsiveness",
      description: "UI breaks on small screens",
    },
    { title: "Implement dark mode", description: "Add theme switcher" },
    {
      title: "Setup staging environment",
      description: "Deploy to staging server",
    },
    { title: "Add unit tests", description: "Increase test coverage to 80%" },
    { title: "Refactor legacy code", description: "Clean up old modules" },
    {
      title: "Implement WebSocket support",
      description: "Real-time updates for notifications",
    },
    { title: "Add export feature", description: "Export data to CSV/Excel" },
    {
      title: "Fix security vulnerabilities",
      description:
        "## Security Issues\n\n- XSS prevention\n- CSRF tokens\n- Input sanitization",
    },
    { title: "Optimize bundle size", description: "Reduce JavaScript bundle" },
    {
      title: "Add internationalization",
      description: "Support for multiple languages",
    },
    { title: "Implement analytics", description: "Track user behavior" },
    { title: "Setup backup system", description: "Automated database backups" },
    {
      title: "Add payment integration",
      description: "Stripe/PayPal integration",
    },
    {
      title: "Fix performance issues",
      description: "Page load time > 3 seconds",
    },
    {
      title: "Create onboarding flow",
      description: "Guide new users through features",
    },
  ];

  const createdIssues = [];

  for (let i = 0; i < 30; i++) {
    const template = issueTemplates[i];
    const status = statuses[i % statuses.length];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const reporter = users[Math.floor(Math.random() * users.length)];
    const assignee =
      Math.random() > 0.3
        ? users[Math.floor(Math.random() * users.length)]
        : null;

    const tags = [];
    if (i % 3 === 0) tags.push("backend");
    if (i % 4 === 0) tags.push("frontend");
    if (i % 5 === 0) tags.push("bug");
    if (i % 6 === 0) tags.push("feature");

    const issue = await prisma.issue.create({
      data: {
        title: template.title,
        description: template.description,
        status,
        priority,
        tags,
        position: Math.floor(i / statuses.length),
        reporterId: reporter.id,
        assigneeId: assignee?.id,
        orgId: org.id,
        dueDate:
          Math.random() > 0.5
            ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000)
            : null,
      },
    });

    createdIssues.push(issue);

    // Crear entrada de historial de creación
    await prisma.issueHistory.create({
      data: {
        issueId: issue.id,
        actorId: reporter.id,
        fieldChanged: "created",
        oldValue: null,
        newValue: "Issue created",
      },
    });
  }

  // Comentarios incluidos (3-5 por issue para ~10 issues)
  for (let i = 0; i < 10; i++) {
    const issue = createdIssues[i * 3];
    const numComments = 3 + Math.floor(Math.random() * 3);

    for (let j = 0; j < numComments; j++) {
      const author = users[Math.floor(Math.random() * users.length)];
      await prisma.comment.create({
        data: {
          content: `This is comment ${j + 1} on ${issue.title}. ${
            j === 0
              ? "I think we should prioritize this."
              : j === 1
              ? "Agreed, let me work on this."
              : j === 2
              ? "Update: Making good progress!"
              : j === 3
              ? "This is blocked by another issue."
              : "Almost done, just need code review."
          }`,
          issueId: issue.id,
          authorId: author.id,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
  console.log("\n📝 Test credentials:");
  console.log("   Admin:   admin@acme.com / password123");
  console.log("   Member1: member1@acme.com / password123");
  console.log("   Member2: member2@acme.com / password123");
  console.log(`\n🏢 Organization: ${org.name} (${org.slug})`);
  console.log(`📋 Created ${createdIssues.length} issues`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
