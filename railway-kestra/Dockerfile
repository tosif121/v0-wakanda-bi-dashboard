# 🚀 Kestra on Railway - Production Ready
FROM kestra/kestra:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set environment variables for Railway
ENV KESTRA_CONFIGURATION_PATH=/app/kestra-config.yml
ENV KESTRA_PLUGINS_PATH=/app/plugins
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENV PORT=8080

# Create necessary directories
RUN mkdir -p /app/plugins /app/flows /app/storage

# Copy configuration
COPY kestra-config.yml /app/kestra-config.yml
COPY flows/ /app/flows/

# Set working directory
WORKDIR /app

# Expose port (Railway will map this automatically)
EXPOSE $PORT

# Health check for Railway
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || curl -f http://localhost:$PORT/ || exit 1

# Start Kestra server with proper port binding
CMD ["sh", "-c", "server local --config /app/kestra-config.yml --server.port=${PORT:-8080}"]