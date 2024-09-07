# Credit: Adapted from https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/
# pull official base image
FROM python:3.11.4-slim-buster

# set work directory
WORKDIR /app

# set environment variables
ENV PYTHONDONTWRITEB--YTECODE 1
ENV PYTHONUNBUFFERED 1

# # install PIP
# sudo apt install python3-pip
# sudo ln -s /usr/bin/pip3 /usr/bin/pip

RUN apt-get update && apt-get install -y \
        default-libmysqlclient-dev \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

# install dependencies
# RUN pip install --upgrade pip
RUN sudo apt install python3.12-venv \ 
        && python3 -m venv final-env
source final-env/bin/activate
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy project
COPY . .

# Run
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["daphne", "-p", "8000", "backend.asgi:application"]