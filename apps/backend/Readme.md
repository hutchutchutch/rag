For running the Dockerfile.dev

docker build -f Dockerfile.dev -t backend-dev .
docker run -it --rm \
  -p 3000:3000 \
  -v $(pwd):/app \
  backend-dev

