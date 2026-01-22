# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./

# Create non-root user
RUN adduser -S reactuser -u 1001

# Change ownership
RUN chown -R reactuser /app
USER reactuser

# Expose port
EXPOSE 5173

# Start the application
CMD ["serve", "-s", "dist", "-l", "5173"]
