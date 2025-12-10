# syntax=docker/dockerfile:1

FROM node:20-alpine3.18 AS base

# Accept build-time environment variables for Next.js (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_BACKEND_API
ARG NEXT_PUBLIC_BASE_API

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
ARG NEXT_PUBLIC_BACKEND_API
ARG NEXT_PUBLIC_BASE_API
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set NODE_ENV to production for build
ENV NODE_ENV production
# Inject build-time env vars for Next.js into the builder stage so they are embedded during `next build`.
ENV NEXT_PUBLIC_BACKEND_API=${NEXT_PUBLIC_BACKEND_API}
ENV NEXT_PUBLIC_BASE_API=${NEXT_PUBLIC_BASE_API}
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build the Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Install OpenSSL 1.1 for Prisma
RUN apk add --no-cache openssl1.1-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema first
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy full node_modules for Prisma and other dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy production environment file
COPY --chown=nextjs:nodejs .env.production ./.env.production

# Generate Prisma Client in the runner stage
RUN npx prisma generate

USER nextjs

EXPOSE 3010

ENV PORT 3010
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
