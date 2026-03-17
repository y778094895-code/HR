FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Installing all deps including devDependencies for build
# Using npm install instead of ci for better network resilience in this environment
# and increasing timeout
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    rm -rf node_modules package-lock.json && \
    npm install --no-audit

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/data ./data
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/api ./api
COPY --from=builder /app/services ./services
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/tests ./tests
COPY --from=builder /app/tsconfig.json ./
COPY package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/api/index.js"]
