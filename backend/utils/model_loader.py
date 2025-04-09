import os
from huggingface_hub import hf_hub_download, list_repo_files
import platform
import sys

def get_model_paths():
    """Get all model paths, downloading from Hugging Face if needed"""
    models_dir = os.path.join(os.path.dirname(__file__), "Models")
    os.makedirs(models_dir, exist_ok=True)
    
    # Your Hugging Face username - make sure this matches exactly with case-sensitivity
    hf_username = os.environ.get("HF_USERNAME", "Aftab33")
    
    # Model configurations
    models = {
        "base.pt": {
            "repo_id": f"{hf_username}/poster-base-model",
            "filename": "base.pt"
        },
        "figure_classifier.pt": {
            "repo_id": f"{hf_username}/poster-figure-classifier",
            "filename": "figure_classifier.pt"
        },
        "logo_classifier.pt": {
            "repo_id": f"{hf_username}/poster-logo-classifier",
            "filename": "logo_classifier.pt"
        }
    }
    
    model_paths = {}
    
    for model_name, config in models.items():
        filepath = os.path.join(models_dir, model_name)
        
        try:
            print(f"Attempting to download {model_name} from {config['repo_id']}...")
            
            # Try to list files in the repository to verify it exists
            try:
                repo_files = list_repo_files(config['repo_id'])
                print(f"Repository files: {repo_files}")
                
                if config['filename'] not in repo_files:
                    print(f"Warning: {config['filename']} not found in repository. Available files: {repo_files}")
            except Exception as e:
                print(f"Error listing repository contents: {str(e)}")
            
            # Download the file from Hugging Face
            filepath = hf_hub_download(
                repo_id=config['repo_id'],
                filename=config['filename'],
                local_dir=models_dir,
                force_download=True,  # Force download to ensure we get the latest version
                token=os.environ.get("HF_TOKEN")  # Add token if you have one
            )
            
            print(f"Successfully downloaded {model_name} to {filepath}")
            
            # Use platform-specific path formatting
            if platform.system() == 'Windows':
                model_paths[model_name] = filepath.replace('/', '\\')
            else:
                model_paths[model_name] = filepath
                
        except Exception as e:
            print(f"Failed to download {model_name}: {str(e)}")
            model_paths[model_name] = None
            
    return model_paths

# Auto-download models when module is imported
if __name__ != "__main__":
    # Always initialize models when imported
    print("Initializing models...")
    model_paths = get_model_paths()
else:
    # Test when run directly
    model_paths = get_model_paths()
    for name, path in model_paths.items():
        status = "✅ Available" if path and os.path.exists(path) else "❌ Missing"
        print(f"{name}: {status}")