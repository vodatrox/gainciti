FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements/ requirements/
RUN pip install --no-cache-dir -r requirements/dev.txt

# Copy backend (for Django models/ORM access)
COPY backend/ backend/

# Copy temporal worker code
COPY temporal/ temporal/

ENV PYTHONPATH=/app/backend:/app

CMD ["sh", "-c", "python -m temporal.schedule_workflows || true && python -m temporal.worker"]
