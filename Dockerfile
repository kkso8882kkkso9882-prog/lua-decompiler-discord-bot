FROM node:20-bookworm-slim

# Install system dependencies including Python 3 and LuaJIT
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    luajit \
    lua5.1 \
    liblua5.1-0 \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package specifications
COPY package*.json ./
RUN npm install --production --no-audit

# Copy application source code and engines
COPY . .

# Set environment
ENV NODE_ENV=production
ENV PYTHONUNBUFFERED=1

CMD ["npm", "start"]
