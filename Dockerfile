# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Declare build arguments for environment variables needed at build time
ARG GOOGLE_SHEET_ID
ARG GOOGLE_SHEET_NAME
ARG GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON
ARG SLACK_BOT_TOKEN
ARG SLACK_CHANNEL_ID

# Set these ARGs as ENV variables so SvelteKit build can access them
ENV GOOGLE_SHEET_ID=$GOOGLE_SHEET_ID
ENV GOOGLE_SHEET_NAME=$GOOGLE_SHEET_NAME
ENV GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON=$GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON
ENV SLACK_BOT_TOKEN=$SLACK_BOT_TOKEN
ENV SLACK_CHANNEL_ID=$SLACK_CHANNEL_ID

RUN npm install -g pnpm

# Copy all source files, package.json, and lockfile
# This ensures that prepare scripts in package.json (like svelte-kit sync) have full context
COPY . .

RUN pnpm install --frozen-lockfile

# Ensure your svelte.config.js is configured to output a standalone Node server (e.g., using adapter-node)
# The output should be in a directory named "build" in the WORKDIR (/app/build)
RUN pnpm build

# List contents of /app to debug build output
RUN echo "Listing contents of /app after build:" && ls -la /app
RUN echo "Listing contents of /app/.svelte-kit/output after build (if it exists):" && ls -la /app/.svelte-kit/output || echo "/app/.svelte-kit/output not found"

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/build ./

COPY --from=builder /app/node_modules ./node_modules

# Create a package.json with "type": "module" to ensure Node.js runs .js files as ES modules.
# This is crucial if the copied build output doesn't include one or if it needs to be overridden.
RUN echo '{ "type": "module" }' > package.json

# Expose the port the app runs on
EXPOSE 5173

# This assumes your build output (e.g., from adapter-node) has an index.js in its root
CMD ["node", "index.js"]
