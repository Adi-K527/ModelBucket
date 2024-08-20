resource "google_artifact_registry_repository" "model_bucket_gcp_registry" {
  provider = google

  repository_id = "mb-gcp-registry"
  location      = "us-central1"
  format        = "DOCKER"
  description   = "Docker repository for model bucket"
}


resource "google_cloud_run_service" "cr_backend" {
  name     = "mb-cloudrun-backend-6816"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "gcr.io/google-samples/hello-app:1.0"
      }

      sc {
        min_instance_count = 1  # Keep at least one instance running
        max_instance_count = 10 # Set the maximum number of instances
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}


resource "google_cloud_run_service" "cr_frontend" {
  name     = "mb-cloudrun-frontend-8326"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "gcr.io/google-samples/hello-app:1.0"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth_backend" {
  location    = google_cloud_run_service.cr_backend.location
  project     = google_cloud_run_service.cr_backend.project
  service     = google_cloud_run_service.cr_backend.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth_frontend" {
  location    = google_cloud_run_service.cr_frontend.location
  project     = google_cloud_run_service.cr_frontend.project
  service     = google_cloud_run_service.cr_frontend.name

  policy_data = data.google_iam_policy.noauth.policy_data
}