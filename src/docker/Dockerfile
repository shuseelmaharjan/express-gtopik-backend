# Build stage
FROM node:18-alpine AS builder

ENV TZ="Asia/Kathmandu"

WORKDIR /usr/src/app

# Copy package files for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

ENV TZ="Asia/Kathmandu"
ENV NODE_ENV=production

WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy any necessary static files (uploads, etc.)
COPY --chown=nodejs:nodejs src/uploads ./src/uploads

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["npm", "start"]