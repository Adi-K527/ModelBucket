import modelbucket as mb

client = mb.Client(
    name  = "test",
    token = "2fcab417f263981a55a7a72ffd2c58c6fbb4b51f9dc3bf9cf74e4cf602df95cc"
)

client.deploy(model_path        = "test_model.joblib",
              dependencies_path = "requirements.txt",
              proj_name         = "gfd",
              model_name        = "XGBOOST-TEST-2")