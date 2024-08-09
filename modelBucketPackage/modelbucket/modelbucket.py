import requests
import boto3
import os
import uuid


s3_client = boto3.client("s3", aws_access_key_id=os.getenv('AWS_ACCESS_KEY'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))


class Client():
    def __init__(self, name, token):
        self.name = name
        self.token = token
    
    def deploy(self, model_path, dependencies_path, obj_name):
        id = uuid.uuid4()

        with open(model_path, "rb") as f:
            s3_client.upload_fileobj(f, "mb-bucket-5125", "models/" + obj_name + "-" + str(id))
        with open(dependencies_path, "rb") as f:
            s3_client.upload_fileobj(f, "mb-bucket-5125", "dependencies/" + obj_name + "-" + str(id))
        
        requests.post("http://localhost:3000/api/deployment/", data={"id": id})

        
        
