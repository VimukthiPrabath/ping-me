
FROM python:3.10-slim

WORKDIR /app

RUN pip install redis requests python-dotenv

COPY . .

CMD ["python", "main.py"]