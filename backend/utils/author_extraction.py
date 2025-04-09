import base64
from PIL import Image
from io import BytesIO
import google.generativeai as genai
import json
import os

def extract_authors(image_path: str) -> list:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not set. Author extraction may fail.")
        return []
    genai.configure(api_key=api_key)
    
    def image_to_base64(image):
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        return buffered.getvalue()
    
    try:
        img = Image.open(image_path)
        img_data = image_to_base64(img)
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = """Extract the author names from this research poster. 
Return the response in the following JSON format:
{
    "authors": ["Author 1", "Author 2", ...]  # List of author names as strings
}
If no authors are found, return:
{
    "authors": []
}
Do not include any other text in your response, only the JSON object."""
        
        response = model.generate_content(
            [
                prompt,
                {
                    "mime_type": "image/png",
                    "data": img_data
                }
            ]
        )
        
        response_text = response.text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        try:
            result = json.loads(response_text)
            return result.get('authors', [])
        except json.JSONDecodeError:
            return []
    except Exception as e:
        print(f"Error extracting authors: {str(e)}")
        return []

