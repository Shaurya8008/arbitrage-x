# Stage 1: Build C++ Engine
FROM ubuntu:22.04 AS cpp-builder
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
RUN mkdir -p build && cd build && cmake .. && make

# Stage 2: Build Node.js & Frontend
FROM node:20-slim AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Copy compiled C++ from Stage 1
COPY --from=cpp-builder /app/build/NetworkRoutingAnalyzer ./build/
# Build Frontend
RUN cd frontend && npm install && npm run build

# Stage 3: Final Runner
FROM node:20-slim
WORKDIR /app

# Install system dependencies for C++ engine if any (libc6 is default)
# and clean up
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=node-builder /app/package*.json ./
RUN npm install --production
COPY --from=node-builder /app/src ./src
COPY --from=node-builder /app/build ./build
COPY --from=node-builder /app/frontend/dist ./frontend/dist
COPY --from=node-builder /app/src/db ./src/db

# Expose API Port
EXPOSE 3001

# Start the server
CMD ["npx", "tsx", "src/server.js"]
