# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# Use npm install to avoid lockfile requirement in fresh repo
RUN npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
COPY sequelize.config.cjs ./
COPY .sequelizerc ./
COPY migrations_cjs ./migrations_cjs
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache netcat-openbsd
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/sequelize.config.cjs ./sequelize.config.cjs
COPY --from=build /app/.sequelizerc ./.sequelizerc
COPY --from=build /app/migrations_cjs ./migrations_cjs
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 8000
CMD ["node", "dist/server.js"]
