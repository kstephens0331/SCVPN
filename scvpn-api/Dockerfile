# Dockerfile for SACVPN API
# Forces Railway to deploy with sshpass and latest code

FROM node:20-slim

# Install system dependencies
# - sshpass: For SSH password authentication to VPN nodes
# - openssh-client: For SSH connections
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    sshpass \
    openssh-client && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Railway will override this)
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
