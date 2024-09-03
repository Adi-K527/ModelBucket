import modelbucket as mb

client = mb.Client(
    name  = "test",
    token = "5a5e38c6be41488a9ab05bc64bb63b7d2d88a9c7c0dc29220c286371af6f199b"
)



client.upload_eval_data(
    x_eval_path        = "random_x_values.csv",
    y_eval_path        = "random_y_values.csv",
    proj_name          = "gfd",
    model_name         = "MAIN-MODEL"
)

# client.deploy(model_path        = "test_model.joblib",
#               dependencies_path = "requirements.txt",
#               proj_name         = "gfd",
#               model_name        = "XGBOOST-TEST-2")