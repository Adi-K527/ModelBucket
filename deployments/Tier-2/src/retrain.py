import os
import json
import boto3
import joblib
from pydantic import BaseModel
from typing import Any
import numpy as np
from fastapi import FastAPI
from sklearn.metrics import mean_squared_error, r2_score, precision_score, recall_score, accuracy_score, f1_score

app = FastAPI()

class BatchData(BaseModel):
    x: Any
    y: Any
    x_test: Any
    y_test: Any
    model_type: str
    model_lib:  str

@app.get("/retrain")
def status():
    return {"status": "retrain ok"}

@app.post("/retrain")
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
        
        x_data = np.array([request.x])
        if preprocessor:
            x_data = preprocessor.transform(x_data)

        model = joblib.load('/vol/model.joblib')
        model.fit(x_data, np.array([request.y]))

        bucket.upload_file("models/", "model.joblib")
        os.remove("/vol/model.joblib")

        bucket.download_file("models/" + model_name + ".joblib", "/vol/model.joblib")
        model = joblib.load('/vol/model.joblib')

        pred   = model.predict(request.x_test)
        y_true = np.array([request.y_test])
        
        metrics = {}
        if request.model_type == "Classification":
            metrics["mse"]      = mean_squared_error(pred, y_true)
            metrics["rmse"]     = np.sqrt(mean_squared_error(pred, y_true))
            metrics["r2_score"] = r2_score(pred, y_true)
        else:
            metrics["accuracy"]  = accuracy_score(pred, y_true)
            metrics["precision"] = precision_score(pred, y_true)
            metrics["recall"]    = recall_score(pred, y_true)
            metrics["f1_score"]  = f1_score(pred, y_true)
        

    except Exception as e:
        return {
            "statusCode": 400,
            "error": str(type(e)),
            "body": str(e)
        }

    return {
        'statusCode': 200,
        'body': json.dumps({"Metrics": metrics})
    }