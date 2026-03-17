FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt requirements-dev.txt pyproject.toml /app/
RUN pip install --no-cache-dir -U pip &&                 pip install --no-cache-dir -r requirements.txt

COPY src /app/src
COPY artifacts /app/artifacts
ENV PYTHONPATH=/app/src

EXPOSE 8001
CMD ["uvicorn", "hr_ai_layer.serving.app:app", "--host", "0.0.0.0", "--port", "8001"]
