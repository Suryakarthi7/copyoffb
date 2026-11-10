# ==========================================
# STAGE 1: Builder & Dependency Installer
# ==========================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# ==========================================
# STAGE 2: Lightweight Production Runner
# ==========================================
FROM node:18-alpine AS production

WORKDIR /app

# Ensure /app is owned by the unprivileged 'node' user
RUN chown -R node:node /app

# Switch to non-root user for security best practice
USER node

# Copy dependencies from builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
