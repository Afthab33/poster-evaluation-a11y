FROM python:3.10.12-slim

WORKDIR /app

# Install system dependencies and Python packages
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && pip install Pillow opencv-python-headless pytesseract numpy spacy \
    && pip install google-generativeai requests \
    && pip install huggingface-hub tqdm python-dotenv \
    && pip install torch torchvision \
    && pip install ultralytics \
    && pip install doclayout-yolo==0.0.3 \
    && pip install werkzeug==2.2.3 flask==2.0.1 flask-cors==3.0.10 gunicorn \
    && python -m spacy download en_core_web_sm \
    && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application
COPY . /app

# Create required directories
RUN mkdir -p utils/Input utils/Memory/Raw\ Components utils/Output utils/Output/Logos \
    utils/Output/Color_Contrast utils/Buffer utils/Buffer/components utils/Models

# Set environment variables
ENV PORT=5000

# Run with Gunicorn instead of Flask development server
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--timeout", "120", "app:app"]