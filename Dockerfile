# Stage 1: Build Frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
# If no package-lock, it will just install based on package.json
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Production Backend
FROM python:3.11-slim

WORKDIR /app

# Prevent python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY src/ ./src/
COPY run.py .

# Copy built frontend from Stage 1 to the static folder expected by FastAPI
# main.py expects static files at src/infrastructure/api/static
COPY --from=frontend-builder /app/frontend/dist ./src/infrastructure/api/static

# Expose port
EXPOSE 8000

# Run
CMD ["python", "run.py"]
