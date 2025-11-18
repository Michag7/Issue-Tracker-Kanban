FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY package.json pnpm-workspace.yaml ./

# Copy package.json files for all workspaces
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/web ./apps/web

# Build shared packages
WORKDIR /app/packages/types
RUN pnpm build

WORKDIR /app

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "dev"]
