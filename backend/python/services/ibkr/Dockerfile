FROM python:3.12-slim
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*

COPY services/ibkr/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ibkr ./services/ibkr

EXPOSE 8093
CMD ["uvicorn", "services.ibkr.main:app", "--host", "0.0.0.0", "--port", "8093"]
