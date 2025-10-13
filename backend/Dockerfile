# Use Python 3.11 slim image for better security and smaller size
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OpenCV, Tesseract, PDF processing, and health checks
# Use --no-install-recommends for a smaller image
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-eng \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    poppler-utils \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
# This assumes your build context is the root of your repo
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy only the backend application code, not the whole repository
COPY backend/. .

# Create uploads directory
RUN mkdir -p /app/uploads

# Create non-root user for security and transfer ownership
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose port (good practice for documentation)
EXPOSE 8000

# Health check using curl (more lightweight than a Python script)
# Increased start-period to give the app more time to boot
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start the application (Railway sets the PORT env var)
# Using exec allows the app to properly receive signals like SIGTERM for graceful shutdowns
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

