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
from werkzeug.middleware.proxy_fix import ProxyFix
import gc

app = Flask(__name__)
# Add ProxyFix middleware to handle forwarded headers
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Update CORS configuration to explicitly allow your frontend origin
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "https://poster-a11y.vercel.app", "https://postera11y.vercel.app"]}})

# Add this before your routes
@app.before_request
def handle_multipart():
    if request.method == 'POST' and request.content_type and 'multipart/form-data' in request.content_type:
        # No modification needed, but this intercepts the request before Railway middleware
        pass

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
        # "utils/Models" is intentionally NOT included!
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
        response = send_file(file_path, mimetype='image/jpeg')
        response.headers['Cache-Control'] = 'public, max-age=300'  # Cache for 5 minutes
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate", methods=["POST"])
def evaluate():
    try:
        # Ensure directories exist
        ensure_directories_exist()
        
        # Clear directories before processing
        clear_directories()
        
        # Special handling for Railway
        if request.content_type and 'multipart/form-data' in request.content_type:
            poster_file = None
            for key in request.files:
                if key == 'poster' or 'poster' in key:
                    poster_file = request.files[key]
                    break
                
            if not poster_file:
                return jsonify({"error": "No poster file found in request"}), 400
                
            if poster_file.filename == '':
                return jsonify({"error": "No selected file"}), 400
                
            # Save the file
            input_dir = os.path.join("utils", "Input")
            file_path = os.path.join(input_dir, poster_file.filename)
            poster_file.save(file_path)
        else:
            # Original handling
            if "poster" not in request.files:
                return jsonify({"error": "No poster file provided"}), 400
                
            poster = request.files["poster"]
            if poster.filename == '':
                return jsonify({"error": "No selected file"}), 400
                
            # Save the file
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
        
        gc.collect()  # Force garbage collection after processing
        
        # Return the complete result
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate-base64", methods=["POST"])
def evaluate_base64():
    try:
        # Ensure directories exist
        ensure_directories_exist()
        
        # Clear directories before processing
        clear_directories()
        
        # Get base64 data from request
        data = request.json
        if not data or 'image' not in data:
            return jsonify({"error": "No image data provided"}), 400
            
        # Decode base64 image
        base64_data = data['image']
        # Remove header if present
        if 'base64,' in base64_data:
            base64_data = base64_data.split('base64,')[1]
            
        image_data = base64.b64decode(base64_data)
        
        # Save to file
        input_dir = os.path.join("utils", "Input")
        file_path = os.path.join(input_dir, "uploaded_poster.png")
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
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
        
        gc.collect()  # Force garbage collection after processing
        
        return jsonify(result), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/evaluate-graphql", methods=["POST"])
def evaluate_graphql():
    try:
        # Check if the post request has the file part
        if 'operations' not in request.form or 'map' not in request.form:
            return jsonify({"error": "Missing GraphQL multipart fields"}), 400
            
        # For simplicity, just extract the file from the map
        if '0' not in request.files:
            return jsonify({"error": "No poster file provided"}), 400
            
        poster = request.files['0']
        if poster.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Save the file
        input_dir = os.path.join("utils", "Input")
        file_path = os.path.join(input_dir, poster.filename)
        poster.save(file_path)
        
        # Process the poster as usual
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
        
        gc.collect()  # Force garbage collection after processing
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render"""
    return jsonify({"status": "healthy"}), 200

@app.route("/debug-request", methods=["POST", "GET"])
def debug_request():
    if request.method == "GET":
        return """
        <html>
        <body>
            <h1>Debug Form</h1>
            <form action="/debug-request" method="post" enctype="multipart/form-data">
                <input type="file" name="file">
                <button type="submit">Submit</button>
            </form>
        </body>
        </html>
        """
    else:
        data = {
            "method": request.method,
            "content_type": request.content_type,
            "headers": dict(request.headers),
            "files": list(request.files.keys()) if request.files else None,
            "form": dict(request.form) if request.form else None
        }
        return jsonify(data)

def ensure_models_downloaded():
    """Download models from GCS at startup"""
    from utils.model_loader import get_model_paths
    
    model_paths = get_model_paths()
    missing_models = [name for name, path in model_paths.items() if path is None]
    
    if missing_models:
        print(f"WARNING: Failed to download the following models: {missing_models}")
        print("The application may not function correctly!")
    else:
        print("All models successfully downloaded/located")

# Make sure this is called at startup
if __name__ == "__main__":
    # Ensure directories exist at startup
    ensure_directories_exist()
    ensure_models_downloaded()  # Add this line
    # Use environment variables for port configuration
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", debug=False, port=port)
