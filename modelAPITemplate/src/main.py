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
    bucket = boto3.resource('s3', 
                            aws_access_key_id     = os.getenv('MY_AWS_ACCESS_THING'), 
                            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS' )).Bucket(os.getenv('AWS_BUCKET'))
    
    try:
        model_name = os.getenv("MODEL_NAME")
        bucket.download_file(model_name, model_name)
        model = joblib.load('/tmp/' + model_name)
    except Exception as e:
        return {
            "statusCode": 400,
            "error": str(type(e)),
            "body": str(e)
        }

    
    return {
        'statusCode': 200,
        'body': json.dumps({"model": model})
    }

handler = Mangum(app)