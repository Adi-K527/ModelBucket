import json
import boto3
import joblib
import os
from mangum import Mangum
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def status():
    return {"status": "ok"}

@app.post("/predict")
def predict():
    print("----------------------------REQUEST STARTED----------------------------")
    bucket = boto3.resource('s3', 
                            aws_access_key_id     = os.getenv('MY_AWS_ACCESS_THING'), 
                            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS' )).Bucket(os.getenv('AWS_BUCKET'))
    
    print("----------------------------INSTANTIATED BUCKET----------------------------")

    try:
        model_name = os.getenv("MODEL_NAME")

        print("----------------------------GOT MODEL----------------------------")

        bucket.download_file("models/" + model_name, "/tmp/model.joblib")

        print("----------------------------DOWNLOADED MODEL----------------------------")

        model = joblib.load('/tmp/model.joblib')

        print("----------------------------LOADED MODEL----------------------------")
    except Exception as e:
        print("----------------------------ERROR----------------------------")
        return {
            "statusCode": 400,
            "error": str(type(e)),
            "body": str(e)
        }

    print("----------------------------DONE----------------------------")
    return {
        'statusCode': 200,
        'body': "done"
    }

handler = Mangum(app)