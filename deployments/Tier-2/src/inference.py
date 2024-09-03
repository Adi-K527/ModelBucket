import os
import json
import boto3
import joblib
from pydantic import BaseModel
from typing import Any
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import numpy as np

app = FastAPI()

class BatchData(BaseModel):
    data: Any


@app.get("/predict", response_class=HTMLResponse)
def status():
    html_content = """
    <html>
        <head>
            <title>Retrain Model Status</title>
        </head>
        <body>
            <h1>Status: OK</h1>
            <p>To inference using the model, send a POST request to <strong>/predict</strong> with the following parameters:</p>
            <ul>
                <li><strong>data</strong>: Specify the data you want to inference on in array form</li>
            </ul>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


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