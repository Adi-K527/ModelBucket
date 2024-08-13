import modelbucket as mb


client = mb.Client(
    name  = "test",
    token = "1d5155bbcf9167fd2b7abc1eb834ad1b4426af0fa53e5a43f38342353e166735"
)

client.deploy(model_path        = "test_model.joblib",
              dependencies_path = "requirements.txt",
              proj_id           = 8,
              model_id          = 10)