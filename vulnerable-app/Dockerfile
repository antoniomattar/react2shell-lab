# Dockerfile for CVE-2025-55182 Vulnerable Next.js Application
# WARNING: INTENTIONALLY VULNERABLE - FOR SECURITY RESEARCH ONLY

FROM node:20-alpine

LABEL maintainer="Security Lab"
LABEL description="Vulnerable Next.js app for CVE-2025-55182 research"
LABEL warning="INTENTIONALLY VULNERABLE - DO NOT DEPLOY TO PRODUCTION"

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install VULNERABLE versions
# next@16.0.6 and react@19.2.0 are affected by CVE-2025-55182
RUN npm install --legacy-peer-deps

# Copy application source
COPY next.config.mjs ./
COPY app ./app

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "start"]
