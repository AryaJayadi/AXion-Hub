# ============================================
# AXion Hub - Multi-stage Dockerfile (bun)
# ============================================

# --- Stage: base ---
FROM oven/bun:latest AS base
WORKDIR /app

# --- Stage: dev ---
# Development target with hot reload support
FROM base AS dev
COPY package.json bun.lock* ./
RUN bun install --no-verify
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]

# --- Stage: deps ---
# Production dependencies only
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production --no-verify

# --- Stage: builder ---
# Build the Next.js application
FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --no-verify
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# --- Stage: runner ---
# Production runtime (minimal image)
FROM oven/bun:slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone output from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
CMD ["bun", "server.js"]
