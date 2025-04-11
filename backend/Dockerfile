FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    tesseract-ocr \
    libtesseract-dev \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure pip is installed
RUN python -m ensurepip --upgrade \
    && python -m pip install --upgrade pip setuptools wheel

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install spaCy model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8080

# Expose the port the app runs on
EXPOSE ${PORT}

# Command to run the application
CMD gunicorn --bind 0.0.0.0:${PORT} app:app