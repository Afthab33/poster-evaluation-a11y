from utils.model_loader import get_model_paths
import os

def test_models():
    print("Testing Hugging Face model access...")
    model_paths = get_model_paths()
    
    all_ok = True
    for model_name, path in model_paths.items():
        if path is None or not os.path.exists(path):
            print(f"❌ Failed to access {model_name}")
            all_ok = False
        else:
            size_mb = os.path.getsize(path) / (1024*1024)
            print(f"✅ Successfully accessed {model_name} ({size_mb:.2f} MB)")
    
    return all_ok

if __name__ == "__main__":
    success = test_models()
    if success:
        print("\nAll models are available and accessible!")
        exit(0)
    else:
        print("\nSome models could not be accessed. Please check your Hugging Face setup.")
        exit(1)