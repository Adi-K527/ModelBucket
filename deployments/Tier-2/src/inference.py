import os
import json
import boto3
import joblib
from pydantic import BaseModel
from typing import Any
from fastapi import FastAPI
import numpy as np

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
        if not os.path.exists("/vol/model.joblib"):
            bucket.download_file("models/" + model_name + ".joblib", "/vol/model.joblib")
        
        preprocessor = None
        if len([i for i in bucket.objects.filter(Prefix='preprocessors/' + model_name + "-preprocessor")]) == 1:
            if not os.path.exists("/vol/preprocessor.joblib"):
                bucket.download_file("preprocessors/" + model_name + "-preprocessor", "/vol/preprocessor.joblib")
            preprocessor = joblib.load('/vol/preprocessor.joblib')

        data = np.array(request.data)
        if preprocessor:
            data = preprocessor.transform(data)
        
        model = joblib.load('/vol/model.joblib')
        prediction = model.predict(data)

        thing = [item for item in os.listdir("/vol")]

    except Exception as e:
        return {
            "statusCode": 400,
            "error": str(type(e)),
            "body": str(e)
        }

    return {
        'statusCode': 200,
        'body': json.dumps({"prediction": list(prediction), "newthing": "im new", "thing": list(thing)})
    }