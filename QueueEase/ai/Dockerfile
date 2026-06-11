# ── Build stage ───────────────────────────────────────────────────────────────
FROM python:3.15-rc-alpine3.22 AS builder

WORKDIR /build

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.15-rc-alpine3.22

LABEL maintainer="QueueEase Team <group24@sjp.ac.lk>"
LABEL description="QueueEase ML API — waiting-time prediction service"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    API_PORT=8000

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy source
COPY . .

# Create directories for artefacts and logs
RUN mkdir -p artifacts logs data

# Train model during image build (generates artifacts/)
RUN python train_model.py

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "ml_api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
