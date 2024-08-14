import requests

class Client():
    def __init__(self, name, token):
        self.name = name
        self.token = token
    
    def deploy(self, model_path, dependencies_path, proj_name, model_name):
        url = "https://mb-cloudrun-backend-6816-7qerhjlmja-uc.a.run.app/api/model/deploy"

        data = {
            "secretAccessToken": self.token, 
            "proj_name": proj_name,
            "model_name": model_name,
        }

        files = {
            "model": open(model_path, "rb"),
            "dependencies": open(dependencies_path, "rb")
        }

        response = requests.post(url=url, data=data, files=files)
        return response.text

