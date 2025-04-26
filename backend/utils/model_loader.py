import os
import logging
from google.cloud import storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_model_paths():
    """Get all model paths, downloading from Google Cloud Storage if needed"""
    models_dir = os.path.join(os.path.dirname(__file__), "Models")
    os.makedirs(models_dir, exist_ok=True)
    
    # GCS bucket name
    bucket_name = os.environ.get("GCS_BUCKET_NAME", "poster-evaluation-models")
    
    # Model file configurations
    model_files = {
        "base.pt": "models/base.pt",  # Path in GCS bucket
        "figure_classifier.pt": "models/figure_classifier.pt",
        "logo_classifier.pt": "models/logo_classifier.pt"
    }
    
    # Initialize GCS client
    try:
        client = storage.Client()
        bucket = client.bucket(bucket_name)
    except Exception as e:
        logger.error(f"Error initializing GCS client: {str(e)}")
        # Fallback to local files if they exist
        logger.warning("Falling back to local model files if they exist")
        return {name: os.path.join(models_dir, name) if os.path.exists(os.path.join(models_dir, name)) else None 
                for name in model_files.keys()}
    
    model_paths = {}
    
    # Download each model
    for model_name, gcs_path in model_files.items():
        local_path = os.path.join(models_dir, model_name)
        
        # Check if model exists locally first
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            logger.info(f"Using cached model {model_name} from {local_path}")
            model_paths[model_name] = local_path
            continue
        
        # If not, download from GCS
        logger.info(f"Downloading {model_name} from GCS bucket {bucket_name}, path {gcs_path}")
        try:
            blob = bucket.blob(gcs_path)
            blob.download_to_filename(local_path)
            
            # Verify download was successful
            if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
                logger.info(f"Successfully downloaded {model_name} to {local_path}")
                model_paths[model_name] = local_path
            else:
                logger.error(f"Downloaded file {local_path} is empty or missing")
                model_paths[model_name] = None
        except Exception as e:
            logger.error(f"Error downloading {model_name}: {str(e)}")
            model_paths[model_name] = None
    
    # Check if any models are missing
    missing_models = [name for name, path in model_paths.items() if path is None]
    if missing_models:
        logger.error(f"The following models are missing: {missing_models}")
    
    return model_paths

# For direct testing
if __name__ == "__main__":
    model_paths = get_model_paths()
    for name, path in model_paths.items():
        status = "✅ Available" if path and os.path.exists(path) else "❌ Missing"
        print(f"{name}: {status}")
else:
    # Auto-initialize when imported
    logger.info("Initializing models...")
    model_paths = get_model_paths()