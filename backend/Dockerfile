# Use Node.js LTS version
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create non-root user
RUN adduser -S appuser -u 1001

# Change ownership to non-root user
RUN chown -R appuser /usr/src/app
USER appuser

# Expose port
EXPOSE 5004

# Start the application
CMD ["npm", "start", "--", "--host"]
