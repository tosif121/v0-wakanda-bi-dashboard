# 🚀 Kestra on Render - Production Ready
FROM kestra/kestra:latest

# Set environment variables for Render
ENV KESTRA_SERVER_PORT=10000
ENV JAVA_OPTS="-Xmx512m -Xms256m"
# Security credentials must be set via environment variables following Kestra patterns:
# KESTRA_SECURITY_BASIC_USERNAME, KESTRA_SECURITY_BASIC_PASSWORD, KESTRA_DATASOURCES_POSTGRES_PASSWORD

# Create persistent storage directories
RUN mkdir -p /app/storage /app/flows /app/plugins

# Copy configuration files
COPY kestra-config.yml /app/kestra-config.yml
COPY flows/ /app/flows/

# Set proper permissions for storage
RUN chmod -R 755 /app/storage

# Set working directory
WORKDIR /app

# Expose port for Render
EXPOSE $KESTRA_SERVER_PORT

# Health check for Render
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:$KESTRA_SERVER_PORT/health || exit 1

# Start Kestra server with port binding
CMD ["sh", "-c", "server local --config /app/kestra-config.yml --server.port=${KESTRA_SERVER_PORT}"]