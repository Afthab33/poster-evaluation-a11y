import os
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from utils.hyperlink import evaluateLink
from utils.poster_layout import PosterComponentExtractor
from utils.image_resolution import evaluate_image_accessibility
from utils.author_extraction import extract_authors
from utils.caption_extractor import get_image_captions
from utils.font_size import check_text_font_sizes

app = Flask(__name__)
CORS(app)

# Create required directories
def ensure_directories_exist():
    """Create all the required directories if they don't exist"""
    directories = [
        "utils/Input",
        "utils/Memory/Raw Components",
        "utils/Output",
        "utils/Output/Logos",
        "utils/Output/Color_Contrast",
        "utils/Buffer",
        "utils/Buffer/components",
        "utils/Models"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)

# Clear directories for new processing
def clear_directories():
    """Clear contents of temporary directories"""
    directories = [
        "utils/Input",
        "utils/Memory/Raw Components",
        "utils/Output/Logos",
        "utils/Buffer/components",
        "utils/Output/Color_Contrast",
        "utils/Output"
    ]
    
    for directory in directories:
        if os.path.exists(directory):
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except Exception as e:
                    print(f"Error removing {file_path}: {e}")

def evaluatePoster(file_path):
    extractor = PosterComponentExtractor(file_path)
    extractor.extractComponents()
    return extractor.get_report()

@app.route('/get-image/<path:image_path>')
def get_image(image_path):
    """Generic route to serve any image from utils directory"""
    try:
        # Sanitize the path to prevent directory traversal
        safe_path = os.path.normpath(image_path).lstrip('/')
        file_path = os.path.join("utils", safe_path)
        
        # Check if file exists
        if not os.path.exists(file_path):
            # Return a placeholder image instead
            return jsonify({"error": "Image not found"}), 404
            
        # Return the image file
        return send_file(file_path, mimetype='image/jpeg')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        # Ensure directories exist
        ensure_directories_exist()
        
        # Clear directories before processing
        clear_directories()
        
        # Check if poster file exists in request
        if "poster" not in request.files:
            return jsonify({"error": "No poster file provided"}), 400
            
        poster = request.files["poster"]
        if poster.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Save the file using platform-independent path
        input_dir = os.path.join("utils", "Input")
        file_path = os.path.join(input_dir, poster.filename)
        poster.save(file_path)
        
        # Process the poster
        result = evaluatePoster(file_path)
        
        # Add additional analyses
        hyperlinks = evaluateLink(file_path)
        if hyperlinks:
            result["hyperlinks"] = hyperlinks
            
        authors = extract_authors(file_path)
        if authors:
            result["authors"] = authors
            
        resolution = evaluate_image_accessibility(file_path)
        result["image_resolution"] = resolution

        captions = get_image_captions(file_path)
        result["captions"] = captions

        font_sizes = check_text_font_sizes(file_path)
        result["font_sizes"] = font_sizes
        
        # Return the complete result
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    # Ensure directories exist at startup
    ensure_directories_exist()
    
    # Use environment variables for port configuration
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", debug=False, port=port)
