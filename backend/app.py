import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from utils.hyperlink import evaluateLink
from utils.poster_layout import PosterComponentExtractor
from utils.image_resolution import evaluate_image_accessibility
from utils.config import clear_directories
from utils.color_contrast_evaluation import ColorContrastEvaluator
from utils.author_extraction import extract_authors
from utils.caption_extractor import get_image_captions
from utils.font_size import check_text_font_sizes

app = Flask(__name__)
CORS(app)


def evaluatePoster(file_path):
    extractor = PosterComponentExtractor(file_path)
    extractor.extractComponents()
    return extractor.get_report()

@app.route('/get-image/<path:image_path>')
def get_image(image_path):
    """Generic route to serve any image from utils directory"""
    try:
        full_path = os.path.join('utils', image_path)
        return send_file(full_path, mimetype='image/png')
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route("/evaluate", methods=["POST"])
def evaluate():
    clear_directories()
    poster = request.files["poster"]
    file_path = os.path.join(r"E:\A11Y Poster\Back End\utils\Input", poster.filename)
    poster.save(file_path)
    result = evaluatePoster(file_path)
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
    return jsonify(result), 200

if __name__ == "__main__":
    clear_directories()
    app.run(debug=True, port=5000)
