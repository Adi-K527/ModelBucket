FROM alpine:latest

RUN pip install awscli

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_DEFAULT_REGION
ARG S3_BUCKET
ARG S3_KEY_REQ

RUN aws s3 cp s3://${S3_BUCKET}/${S3_KEY_REQ} requirements.txt

RUN yum -y install libgomp

RUN pip install -r requirements.txt 

COPY src/ .

CMD [ "python", "run.py" ]