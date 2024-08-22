import os
import json
import boto3
import joblib
from pydantic import BaseModel
from typing import Any
from fastapi import FastAPI

app = FastAPI()

class BatchData(BaseModel):
    data: Any


@app.get("/predict")
def status():
    return {"status": "inference ok"}


@app.post("/predict")
def predict(request: BatchData):
    
    bucket = boto3.resource('s3', 
                            aws_access_key_id=os.getenv('MY_AWS_ACCESS_THING'), 
                            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS')).Bucket(os.getenv('AWS_BUCKET'))
    
    try:
        model_name = os.getenv("MODEL_NAME")
        bucket.download_file("models/" + model_name + ".joblib", "model.joblib")
        
        model = joblib.load('model.joblib')
        prediction = model.predict([request.data])

    except Exception as e:
        return {
            "statusCode": 400,
            "error": str(type(e)),
            "body": str(e)
        }

    return {
        'statusCode': 200,
        'body': json.dumps({"prediction": prediction})
    }