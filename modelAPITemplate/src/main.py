# import json
# import boto3
# import joblib
# import os
from mangum import Mangum
from fastapi import FastAPI
# from pydantic import BaseModel
# from typing import Any
# import numpy as np

app = FastAPI()

# class BatchData(BaseModel):
#     data: Any
    

@app.get("/")
def status():
    return {"status": "ok"}


# @app.post("/predict")
# def predict(request: BatchData):

#     def np_encoder(object):
#         if isinstance(object, np.generic):
#             return object.item()
        
#     bucket = boto3.resource('s3', 
#                             aws_access_key_id     = os.getenv('MY_AWS_ACCESS_THING'), 
#                             aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS' )).Bucket(os.getenv('AWS_BUCKET'))
    
#     try:
#         model_name = os.getenv("MODEL_NAME")
#         bucket.download_file("models/" + model_name + ".joblib", "/tmp/model.joblib")

#         model = joblib.load('/tmp/model.joblib')
#         prediction = model.predict([request.data])

#     except Exception as e:
#         return {
#             "statusCode": 400,
#             "error": str(type(e)),
#             "body": str(e)
#         }

#     return {
#         'statusCode': 200,
#         'body': json.dumps({"prediction": prediction}, default=np_encoder)
#     }

handler = Mangum(app)