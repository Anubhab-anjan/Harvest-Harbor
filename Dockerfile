FROM python:3.10-slim

WORKDIR /app

# Install build tools if needed for scikit-learn / numpy
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt gunicorn

# Copy backend application files
COPY backend ./backend

EXPOSE 5000

ENV PORT=5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "3", "--cwd", "backend", "app:app"]
