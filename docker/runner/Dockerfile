FROM python:3.11-alpine

# Create non-root user for running code
RUN adduser -D -s /bin/sh runner

# Create app directory
RUN mkdir -p /app && chown runner:runner /app

WORKDIR /app

# Switch to non-root user
USER runner

# Default command (overridden at runtime)
CMD ["python3", "--version"]
