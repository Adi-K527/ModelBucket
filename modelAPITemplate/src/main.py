import json
import boto3
import joblib
import os


def lambda_handler(event, context):
    
    bucket = boto3.resource('s3', 
                            aws_access_key_id     = os.getenv('MY_AWS_ACCESS_THING'), 
                            aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS'  )).Bucket(os.getenv('AWS_BUCKET'))
    
    model_name = os.getenv("MODEL_NAME")
    bucket.download_file(model_name, model_name)
    model = joblib.load('/tmp/' + model_name)
    
    return {
        'statusCode': 200,
        'body': json.dumps({"model": model})
    }