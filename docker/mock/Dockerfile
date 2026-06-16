FROM python:3.11-alpine
COPY mock-server.py /app/mock-server.py
WORKDIR /app
EXPOSE 8080
EXPOSE 50051
CMD ["python", "mock-server.py", "8080"]
