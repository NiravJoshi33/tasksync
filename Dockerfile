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

# Install pnpm
RUN npm install -g pnpm

# Copy all source files, package.json, and lockfile
# This ensures that prepare scripts in package.json (like svelte-kit sync) have full context
COPY . .

# Install dependencies (this will also run any "prepare" script like "svelte-kit sync")
RUN pnpm install --frozen-lockfile

# Build the application
# Ensure your svelte.config.js is configured to output a standalone Node server (e.g., using adapter-node)
# The output should be in a directory named "build" in the WORKDIR (/app/build)
RUN pnpm build

# List contents of /app to debug build output
RUN echo "Listing contents of /app after build:" && ls -la /app
RUN echo "Listing contents of /app/.svelte-kit/output after build (if it exists):" && ls -la /app/.svelte-kit/output || echo "/app/.svelte-kit/output not found"

# Stage 2: Run the application
FROM node:18-alpine

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV production

# Copy built app from builder stage
# This expects the build output to be in /app/build in the builder stage
COPY --from=builder /app/build ./

# Copy node_modules from builder stage to ensure all production dependencies are available
COPY --from=builder /app/node_modules ./node_modules

# Create a package.json with "type": "module" to ensure Node.js runs .js files as ES modules.
# This is crucial if the copied build output doesn't include one or if it needs to be overridden.
RUN echo '{ "type": "module" }' > package.json

# Expose the port the app runs on
EXPOSE 5173

# Command to run the application
# This assumes your build output (e.g., from adapter-node) has an index.js in its root
CMD ["node", "index.js"]

# Healthcheck (optional, but good practice)
# Adjust the port and path if your app's health endpoint is different
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
#  CMD curl -f http://localhost:5173/health || exit 1 