Running Dockerfile.dev

# 1) Build the image from your Dockerfile.dev
docker build -f apps/frontend/Dockerfile.dev -t frontend-dev .

# 2) Run the container with volume mounting for hot reload
docker run -it --rm \
  -p 5173:5173 \
  -v "$(pwd)":/app \
  frontend-dev
