import os
import json
import boto3
import joblib
from pydantic import BaseModel
from typing import Any
import numpy as np
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from sklearn.metrics import mean_squared_error, r2_score, precision_score, recall_score, accuracy_score, f1_score

app = FastAPI()

class BatchData(BaseModel):
    model_type: str
    model_lib:  str


@app.get("/retrain", response_class=HTMLResponse)
def status():
    html_content = """
    <html>
        <head>
            <title>Retrain Model Status</title>
        </head>
        <body>
            <h1>Status: OK</h1>
            <p>To retrain the model, send a POST request to <strong>/retrain</strong> with the following parameters:</p>
            <ul>
                <li><strong>model_type</strong>: Specify the type of model you want to retrain.</li>
                <li><strong>model_lib</strong>: Specify the library used for the model.</li>
            </ul>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)


@app.post("/retrain")
def predict(request: BatchData):

    bucket = boto3.resource('s3', 
                            aws_access_key_id=os.getenv('MY_AWS_ACCESS_THING'), 
                            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS')).Bucket(os.getenv('AWS_BUCKET'))

    try:
        model_name = os.getenv("MODEL_NAME")
        if not os.path.exists("/vol/model.joblib"):
            bucket.download_file("models/" + model_name + ".joblib", "/vol/model.joblib")

        if not os.path.exists("/vol/X_eval.csv"):
            bucket.download_file("eval-data/" + model_name + "-x-eval", "/vol/X_eval.csv")
            bucket.download_file("eval-data/" + model_name + "-y-eval", "/vol/Y_eval.csv")

        bucket.download_file("train-data/" + model_name + "-x-train", "X_train.csv")
        bucket.download_file("train-data/" + model_name + "-y-train", "Y_train.csv")

        preprocessor = None
        if len([i for i in bucket.objects.filter(Prefix='preprocessors/' + model_name + "-preprocessor")]) == 1:
            if not os.path.exists("/vol/preprocessor.joblib"):
                bucket.download_file("preprocessors/" + model_name + "-preprocessor", "/vol/preprocessor.joblib")
            preprocessor = joblib.load('/vol/preprocessor.joblib')

        x_train = np.genfromtxt('X_train.csv', delimiter=',').reshape((-1, 1))
        y_train = np.genfromtxt('Y_train.csv', delimiter=',')
        x_eval  = np.genfromtxt('/vol/X_eval.csv',  delimiter=',').reshape((-1, 1))
        y_eval  = np.genfromtxt('/vol/Y_eval.csv',  delimiter=',')

        if preprocessor:
            x_train = preprocessor.transform(x_train)
            x_eval = preprocessor.transform(x_eval)

        model = joblib.load('/vol/model.joblib')
        model.fit(x_train, np.array(y_train))

        bucket.upload_file("/vol/model.joblib", "models/" + model_name +".joblib")
        os.remove("/vol/model.joblib")

        bucket.download_file("models/" + model_name + ".joblib", "/vol/model.joblib")
        model = joblib.load('/vol/model.joblib')

        pred   = model.predict(x_eval)
        y_true = np.array(y_eval)
        
        metrics = {}
        if request.model_type == "Regression":
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