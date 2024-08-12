import modelbucket as mb


client = mb.Client(
    name  = "test",
    token = "abc"
)

client.deploy(model_path        = "test_model.joblib",
              dependencies_path = "requirements.txt",
              obj_name          = "test_model.joblib")
