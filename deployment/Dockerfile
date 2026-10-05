# --- Builder Stage ---
FROM node:22.12.0-alpine AS builder

WORKDIR /app

# Only copy dependency files first to leverage Docker cache.
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

COPY . .

RUN npm run build

# --- Execution Stage ---
FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3333
EXPOSE 3333

ENV NODE_OPTIONS="--max-old-space-size=2048"
CMD ["npm","run","start:prod"]