FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy package.json files for all workspaces
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/api ./apps/api

# Build shared packages
WORKDIR /app/packages/types
RUN pnpm build

WORKDIR /app/packages/config
RUN pnpm build

# Generate Prisma Client
WORKDIR /app/apps/api
RUN pnpm prisma generate

WORKDIR /app

EXPOSE 4000

CMD ["pnpm", "--filter", "api", "dev"]
