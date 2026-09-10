FROM node:20-slim

WORKDIR /app

# Install build tools for native SQLite compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package descriptors
COPY package*.json ./
COPY services/backend/package*.json ./services/backend/
COPY shared ./shared

# Install dependencies
RUN npm install --workspace=services/backend

# Copy source
COPY services/backend ./services/backend

WORKDIR /app/services/backend

# Ensure data directory exists
RUN mkdir -p data

EXPOSE 5050

CMD ["npx", "tsx", "src/server.ts"]
