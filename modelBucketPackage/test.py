import modelbucket as mb

client = mb.Client(
    name  = "test",
    token = "b22a073ba0af0e2dc1252a25c6cf52daa2b4d4c84a3c3b5006ef7faa5773ff42"
)

client.deploy(model_path        = "test_model.joblib",
              dependencies_path = "requirements.txt",
              proj_name         = "gfd",
              model_name        = "TestModel")