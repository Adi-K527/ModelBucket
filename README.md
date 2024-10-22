# ModelBucket

ModelBucket is a solution for deploying machine learning models, designed to simplify the process of managing both inference and retraining. It provides deployment options and makes it easy to send requests for predictions or retraining.

</br></br>
## Deployments
---
</br>

**Tier 1** deployments setup a Fast API server to be able to run inferences using your model.

![tier1-diagram](https://github.com/user-attachments/assets/3fedaa89-ef8e-407e-a80e-8a772efbafd9)

</br>

**Tier 2** deployments provision a server with separate FastAPI servers for inference and retraining. Prometheus and Grafana are also set up to power a dashboard that tracks the model's performance over time.

![tier2-diagram](https://github.com/user-attachments/assets/db5283f0-2525-4112-98b7-f6b4b7c4038e)

</br>

Below is the kubernetes cluster that is set up on the server:

![k8scluster-diagram](https://github.com/user-attachments/assets/5aff1444-a6aa-4762-a52f-73aa119272fc)

</br></br>

## ModelBucket Python Package
---

To install the modelbucket python package:
`pip install model-bucket`

And import it by:
```py
import modelbucket as mb
```

</br>

To instantiate a modelbucket client:
```py
client = mb.Client(
    name  = "",
    token = "[GENERATED TOKEN]"
)
```

</br>

To deploy your model, run the following passing in the names of the project and model you created:
```py
client.deploy(model_path        = "example-model.joblib",
              dependencies_path = "example-model-requirements.txt",
              proj_name         = "example-project-name",
              model_name        = "example-model-name")
```

</br>

To upload a preprocessor which transforms the input before inference:
```py
client.upload_preprocessor(
    preprocessor_path = "example-preprocessor-path.joblib",
    proj_name    = "example-project-name",
    model_name   = "example-model-name"
)
```

</br>

To upload train and test data used during model retraining:
```py
client.upload_train_data(
    x_train_path = "example-train-x.csv",
    y_train_path = "example-train-y.csv",
    proj_name   = "example-project-name",
    model_name  = "example-model-name"
)

client.upload_eval_data(
    x_eval_path = "example-test-x.csv",
    y_eval_path = "example-test-y.csv",
    proj_name   = "example-project-name",
    model_name  = "example-model-name"
)
```

</br>

---

