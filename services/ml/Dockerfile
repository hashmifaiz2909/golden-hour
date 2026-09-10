FROM python:3.11-slim

WORKDIR /app

COPY services/ml/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY services/ml/ ./

EXPOSE 5001

CMD ["python3", "app.py"]
