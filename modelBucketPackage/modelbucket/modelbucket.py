import requests
import boto3
import os
import uuid
import time

s3_client     = boto3.client("s3",     aws_access_key_id=os.getenv('AWS_ACCESS_KEY'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))
lambda_client = boto3.client("lambda", aws_access_key_id=os.getenv('AWS_ACCESS_KEY'), aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'))

class Client():
    def __init__(self, name, token):
        self.name = name
        self.token = token
    
    def deploy(self, model_path, dependencies_path, proj_id, model_id):
        id = uuid.uuid4()

        response = requests.put("http://localhost:3000/api/model/update/", 
                        data={
                            "secretAccessToken": self.token,
                            "project_id": proj_id, 
                            "model_id": model_id,
                            "state": "PENDING"
                        }
        )

        if not response.status_code == 200:
            return

        with open(model_path, "rb") as f:
            s3_client.upload_fileobj(f, "mb-bucket-5125", "models/" + str(id) + ".joblib")
        with open(dependencies_path, "rb") as f:
            s3_client.upload_fileobj(f, "mb-bucket-5125", "dependencies/" + str(id))
        
        response = requests.post("http://localhost:3000/api/model/deploy/", data={"secretAccessToken": self.token, "id": id})

        while True:
            try:
                function_url = lambda_client.get_function_url_config(FunctionName=str(id))['FunctionUrl']
                break
            except:
                time.sleep(10)

        requests.put("http://localhost:3000/api/model/update/", 
                        data={
                            "secretAccessToken": self.token,
                            "project_id": proj_id, 
                            "model_id": model_id,
                            "state": "ACTIVE",
                            "model_url": function_url
                        }
        )

