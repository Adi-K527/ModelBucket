FROM python:3.8-slim

RUN apt-get update && apt-get upgrade -y && apt-get install -y awscli && rm -rf /var/lib/apt/lists/*

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
ARG S3_BUCKET
ARG FILENAME
ARG SERVICE

RUN aws s3 cp s3://${S3_BUCKET}/${FILENAME} requirements.txt
RUN pip install -r requirements.txt 

COPY src/ /app/
WORKDIR /app

ENV MY_AWS_ACCESS_THING=${AWS_ACCESS_KEY_ID} AWS_SECRET_ACCESS=${AWS_SECRET_ACCESS_KEY} AWS_BUCKET=${S3_BUCKET} MODEL_NAME=${FILENAME}

CMD python run_${SERVICE}.py