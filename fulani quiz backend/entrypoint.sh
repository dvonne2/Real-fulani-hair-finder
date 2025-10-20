#!/bin/sh
set -e

# Wait for Postgres
until nc -z "$DB_HOST" "$DB_PORT"; do
  echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
  sleep 2
done

# Run migrations
npx sequelize db:migrate --config sequelize.config.cjs

# Start server
node dist/server.js
