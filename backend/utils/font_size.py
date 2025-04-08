import cv2
import pytesseract
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def calculate_font_size(image_path: str) -> dict:
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        data = pytesseract.image_to_data(gray, output_type=pytesseract.Output.DICT)
        
        font_sizes = []
        for i in range(len(data['text'])):
            if int(data['conf'][i]) > 60 and data['text'][i].strip(): 
                text_height = data['height'][i]
                if text_height > 0:
                    font_sizes.append(text_height)
        
        if not font_sizes:
            return None
            
        avg_font_size = sum(font_sizes) / len(font_sizes)
        
        return {
            "font_size": round(avg_font_size, 2),
            "min_size": min(font_sizes),
            "max_size": max(font_sizes),
            "text_count": len(font_sizes)
        }
        
    except Exception as e:
        return None

def check_text_font_sizes(poster_path: str) -> dict:
    raw_components_dir = "utils/Memory/Raw Components"
    if not os.path.exists(raw_components_dir):
        return {}
        
    font_sizes = {}
    
    patterns = {
        'plain_text': 'plain_text_',
        'heading': 'heading_',
        'authors': 'authors_',
        'caption': 'caption_'
    }
    
    for component_type, prefix in patterns.items():
        files = [f for f in os.listdir(raw_components_dir) 
                if f.startswith(prefix) and f.endswith('.jpg')]
        
        for file in files:
            file_path = os.path.join(raw_components_dir, file)
            font_info = calculate_font_size(file_path)
            if font_info is not None:  # Only add to results if valid measurements exist
                component_name = file.replace('.jpg', '')
                font_sizes[component_name] = {
                    **font_info,
                    "img": f"get-image/Memory/Raw Components/{file}",
                    "type": component_type
                }
    return font_sizes

