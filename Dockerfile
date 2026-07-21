# Multi-stage build for Raspberry Pi (ARM64)
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install dependencies for sharp (image processing)
RUN apk add --no-cache libc6-compat vips-dev build-base
WORKDIR /app

# Copy package files
COPY app/package.json app/package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY app/ .

# Next.js collects anonymous telemetry data about general usage.
# Disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install runtime dependencies for sharp
RUN apk add --no-cache vips

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Create directories for JSON storage and uploads
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV ADMIN_PASSWORD ${ADMIN_PASSWORD}
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
