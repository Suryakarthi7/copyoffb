FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy backend package files first for efficient caching
COPY backend/package*.json ./backend/

# Install production dependencies
RUN cd backend && npm install --omit=dev

# Copy entire project (both backend and frontend)
COPY . .

# Set working directory to backend where server.js lives
WORKDIR /app/backend

# Expose port 5000
EXPOSE 5000

# Start Express server (serves both API & Frontend static files)
CMD ["node", "server.js"]
