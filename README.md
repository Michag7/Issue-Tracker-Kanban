# Issue Tracker Kanban - Challenge Altis

Sistema completo de gestión de issues estilo Kanban con autenticación multi-tenant, drag & drop, y tracking de actividad.

https://github.com/user-attachments/assets/fe7c48a6-987b-457b-8ab6-b34042a14519

## ��� Stack Tecnológico

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** + shadcn/ui
- **TanStack Query** v5
- **dnd-kit** para drag & drop
- **react-markdown** para renderizado markdown
- **i18n** (español/inglés)

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **Zod** validación
- **bcryptjs** hashing
- **JWT** autenticación
- **express-rate-limit** protección

### Infraestructura
- **Docker Compose** PostgreSQL
- **Monorepo** pnpm workspaces
- **Swagger** documentación API

---

## ��� Instalación

### Prerrequisitos
- Node.js >= 18
- pnpm >= 8
- Docker y Docker Compose

### Pasos

```bash
# 1. Instalar dependencias
pnpm install

# 2. Construir paquetes
pnpm --filter @issue-tracker/types build
pnpm --filter @issue-tracker/config build

# 3. Levantar PostgreSQL
docker-compose up -d

# 4. Configurar .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
# Editar si es necesario (valores por defecto funcionan)

# 5. Migraciones
pnpm --filter api prisma:generate
pnpm --filter api prisma:migrate

# 6. Seed (datos de prueba)
pnpm --filter api seed

# 7. Iniciar
pnpm dev
```

### Variables de Entorno

**apps/api/.env**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/issuetracker"
PORT=4000
JWT_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**apps/web/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## ��� URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Swagger: http://localhost:4000/docs
- PostgreSQL: localhost:5432

---

## ��� Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@acme.com | password123 |
| Member | member1@acme.com | password123 |
| Member | member2@acme.com | password123 |

**Organización**: Acme Inc. (acme-inc)

---

## ��� API Endpoints

### Autenticación

**POST /auth/register**
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

**POST /auth/login**
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@acme.com",
    "password": "password123"
  }'
```

### Issues

**GET /issues/organization/:orgId**
```bash
curl -X GET 'http://localhost:4000/issues/organization/ORG_ID?page=1&status=TODO' \
  -H "Authorization: Bearer YOUR_JWT"
```

**POST /issues/organization/:orgId**
```bash
curl -X POST http://localhost:4000/issues/organization/ORG_ID \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Issue",
    "description": "# Description\n\nMarkdown supported",
    "priority": "HIGH"
  }'
```

**PUT /issues/organization/:orgId/:issueId**
```bash
curl -X PUT http://localhost:4000/issues/organization/ORG_ID/ISSUE_ID \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE", "position": 0}'
```

**DELETE /issues/organization/:orgId/:issueId**
```bash
curl -X DELETE http://localhost:4000/issues/organization/ORG_ID/ISSUE_ID \
  -H "Authorization: Bearer YOUR_JWT"
```

### Comentarios

**GET /issues/organization/:orgId/:issueId/comments**
**POST /issues/organization/:orgId/:issueId/comments**
**PUT /issues/organization/:orgId/comments/:commentId**
**DELETE /issues/organization/:orgId/comments/:commentId**

Ver Swagger para detalles completos: http://localhost:4000/docs

---

## ✅ Verificación de Requisitos

### OBLIGATORIOS ✓

**Autenticación**:
- ✅ Registro email + password
- ✅ Login con JWT
- ✅ JWT en Bearer token
- ✅ Bcrypt hashing (10 rounds)
- ✅ Rate limiting (5/15min)
- ✅ Refresh tokens

**CRUD Issues**:
- ✅ title (requerido)
- ✅ description (markdown)
- ✅ status (default TODO)
- ✅ priority (default MEDIUM)
- ✅ assignee
- ✅ tags (array)
- ✅ timestamps

**Listado + Filtros**:
- ✅ Paginación server-side
- ✅ Filtros: status, priority, assignee
- ✅ Búsqueda por texto
- ✅ Orden por updated_at desc

**Kanban Board**:
- ✅ 3 columnas (TODO, IN_PROGRESS, DONE)
- ✅ Drag & drop (dnd-kit)
- ✅ Actualización a servidor
- ✅ Vista detalle modal
- ✅ Markdown renderizado
- ✅ Activity tracking

**Comentarios**:
- ✅ CRUD completo
- ✅ Solo autor edita/elimina
- ✅ Timestamps

**Frontend**:
- ✅ Next.js 14 + TypeScript
- ✅ React Query
- ✅ Login/Register pages
- ✅ Listado con filtros
- ✅ Kanban funcional
- ✅ Modal detalle

**Backend**:
- ✅ Node + TypeScript
- ✅ Express
- ✅ Prisma ORM
- ✅ Migraciones
- ✅ Error handling {error, message}
- ✅ CORS
- ✅ Validación Zod

**Seeds**:
- ✅ 1 org (Acme)
- ✅ 3 usuarios
- ✅ 30 issues
- ✅ Comentarios

**Entregables**:
- ✅ Monorepo /api /web
- ✅ README instrucciones
- ✅ Credenciales prueba
- ✅ Decisiones técnicas
- ✅ Ejemplos curl
- ✅ Migraciones
- ✅ Scripts dev/build/seed

### EXTRAS ✓

- ✅ Roles (ADMIN/MEMBER)
- ✅ Historial eventos (IssueHistory)
- ✅ Multi-tenant (Organizations)
- ✅ Invitaciones
- ✅ Docker Compose
- ✅ Swagger docs

### EXTRAS ✗

- ❌ Adjuntos/uploads
- ❌ Realtime WebSocket/SSE
- ❌ Testing (unit/integration)
- ❌ CI/CD pipeline

---

## ���️ Decisiones Técnicas

### Arquitectura
1. **Monorepo**: Código compartido, separación clara
2. **Multi-tenant**: Escalabilidad desde día 1
3. **Position-based ordering**: Control preciso drag & drop

### Frontend
1. **App Router**: Server Components, mejor performance
2. **TanStack Query**: Cache, optimistic updates
3. **dnd-kit**: Moderna, accesible
4. **shadcn/ui**: Control total componentes
5. **i18n custom**: Rápido, sin reestructuración

### Backend
1. **Prisma**: Type-safety, migraciones
2. **Zod**: Schemas + types inferidos
3. **Transactions**: Reordering atómico
4. **IssueHistory**: Auditoria dedicada

### Seguridad
1. **bcryptjs**: 10 rounds
2. **Rate limit**: Anti brute-force
3. **JWT refresh**: Access 1h, refresh 7d
4. **Membresía**: Validación por endpoint

---

## ⚖️ Tradeoffs

**Position vs Time ordering**:
- ✅ Control preciso
- ❌ Complejidad recalculo

**Multi-tenant desde inicio**:
- ✅ Escalable
- ❌ Mayor complejidad

**Custom i18n vs next-intl**:
- ✅ Rápido
- ❌ Menos features, reload necesario

---

## ��� Scripts

```bash
pnpm dev                    # Todo
pnpm --filter api dev       # Backend
pnpm --filter web dev       # Frontend
pnpm build                  # Build
pnpm --filter api seed      # Seed
pnpm --filter api prisma:studio  # DB viewer
```

---

## ��� Docker

```bash
docker-compose up -d        # Levantar
docker-compose logs -f      # Logs
docker-compose down         # Parar
docker-compose down -v      # Parar + limpiar
```

---

## ��� Datos Seed

- 1 org (Acme Inc.)
- 3 usuarios (admin, 2 members)
- 30 issues variados
- ~40 comentarios

---

## ��� Troubleshooting

**Puerto ocupado**:
```bash
npx kill-port 3000
npx kill-port 4000
```

**DB error**:
```bash
docker-compose down -v
docker-compose up -d
# Esperar 10s
pnpm --filter api prisma:migrate
```

**Prisma client**:
```bash
pnpm --filter api prisma:generate
```

---

## ��� Estructura Proyecto

```
/
├── apps/
│   ├── api/              # Backend
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── routes/
│   │   │   ├── middlewares/
│   │   │   └── schemas/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       ├── seed.ts
│   │       └── migrations/
│   └── web/              # Frontend
│       └── src/
│           ├── app/
│           ├── components/
│           ├── hooks/
│           └── lib/
├── packages/
│   ├── types/
│   └── config/
└── docker-compose.yml
```

---

**Documentación completa en Swagger**: http://localhost:4000/docs
