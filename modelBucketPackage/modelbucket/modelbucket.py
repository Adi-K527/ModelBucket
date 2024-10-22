import requests
import json

class Client():
    def __init__(self, name, token):
        self.name = name
        self.token = token
    

    def deploy(self, model_path, dependencies_path, proj_name, model_name):
        url = "https://mb-cloudrun-backend-6816-1054895724513.us-central1.run.app/api/model/deploy"

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
    

    def upload_preprocessor(self, preprocessor_path, proj_name, model_name):
        url = "https://mb-cloudrun-backend-6816-1054895724513.us-central1.run.app/api/model/preprocessor"

        data = {
            "secretAccessToken": self.token, 
            "proj_name": proj_name,
            "model_name": model_name,
        }

        files = {
            "preprocessor": open(preprocessor_path, "rb"),
        }

        response = requests.post(url=url, data=data, files=files)
        
        return response.text
    

    def upload_train_data(self, x_train_path, y_train_path, proj_name, model_name):
        url = "https://mb-cloudrun-backend-6816-1054895724513.us-central1.run.app/api/model/train"

        data = {
            "secretAccessToken": self.token, 
            "proj_name": proj_name,
            "model_name": model_name,
        }

        files = {
            "X_train": open(x_train_path, "rb"),
            "Y_train": open(y_train_path, "rb")
        }

        response = requests.post(url=url, data=data, files=files)
        
        return response.text
    

    def upload_eval_data(self, x_eval_path, y_eval_path, proj_name, model_name):
        url = "https://mb-cloudrun-backend-6816-1054895724513.us-central1.run.app/api/model/eval"

        data = {
            "secretAccessToken": self.token, 
            "proj_name": proj_name,
            "model_name": model_name,
        }

        files = {
            "X_eval": open(x_eval_path, "rb"),
            "Y_eval": open(y_eval_path, "rb")
        }

        response = requests.post(url=url, data=data, files=files)
        
        return response.text
    

    def get_info(self):
        url = "https://mb-cloudrun-backend-6816-1054895724513.us-central1.run.app/api/user/getinfo"

        data = {
            "secretAccessToken": self.token
        }

        response = requests.get(url=url, data=data)
        print(response.text)
        response_data = response.json()
        
        project_data = response_data.get("project_data", [])
        model_data = response_data.get("model_data", [])

        project_models = {project["project_id"]: {"projectname": project["projectname"], "models": []} for project in project_data}

        for model in model_data:
            proj_id = model["project_id"]
            if proj_id in project_models:
                project_models[proj_id]["models"].append([model["modelname"], model["state"]])

        print("--------------------------------")
        for proj_id, info in project_models.items():
            print(f"Project Name: {info['projectname']}")
            if info["models"]:
                print("Models:")
                for model in info["models"]:
                    print(f"  - {model[0]} [{model[1]}]")
            else:
                print("  No associated models.")
            print("--------------------------------")

        return response_data