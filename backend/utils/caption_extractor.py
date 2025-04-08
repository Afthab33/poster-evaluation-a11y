import google.generativeai as genai
from PIL import Image
import os

genai.configure(api_key="AIzaSyAQIEoIQ2VYc9wWSgFqPuClkcqajTpBFfk")
model = genai.GenerativeModel('gemini-1.5-flash')

def get_caption(poster_image: Image, component_image: Image) -> str:
    response = model.generate_content([
        poster_image, 
        component_image, 
        """RULES:
1. The second image is a component extracted from the first image (poster).
2. Your task is to find if this component has a caption in the poster.
3. RESPONSE FORMAT:
   - If you find a caption: Return ONLY the exact caption text, nothing else
   - If no caption exists: Return an empty string ("")
4. DO NOT include any explanatory text like:
   - "Here's the caption"
   - "The caption is"
5. If you're not 100% sure it's a caption, return empty string"""
    ])
    text = response.text.strip()
    
    return text

def process_captions(poster_path: str, component_paths: list = None) -> dict:
    if not os.path.exists(poster_path) or component_paths is None:
        return {}
        
    patterns = {
        'bar_graphs': 'bar_graphs_',
        'pie_chart': 'pie_chart_',
        'line_graph': 'line_graph_',
        'diagram': 'diagram_',
        'table': 'table_'
    }
    
    poster_image = Image.open(poster_path)
    results = {}
    
    for path in component_paths:
        if not os.path.exists(path):
            continue
            
        filename = os.path.basename(path)
        if not any(filename.startswith(pattern) for pattern in patterns.values()):
            continue
            
        component_image = Image.open(path)
        component_name = filename.replace('.jpg', '')
        caption = get_caption(poster_image, component_image)
        
        results[component_name] = {
            "img": f"get-image/Memory/Raw Components/{filename}",
            "caption": caption
        }
    
    return results

def get_image_captions(poster_path: str) -> dict:
    raw_components_dir = os.path.join(os.path.dirname(os.path.dirname(poster_path)), "Memory/Raw Components")
    files = os.listdir(raw_components_dir)
    components = []
    
    for file_name in files:
        if (
            file_name.startswith("bar_graphs_") or
            file_name.startswith("pie_chart_") or
            file_name.startswith("line_graph_") or
            file_name.startswith("diagram_") or
            file_name.startswith("table_")
        ):
            full_path = os.path.join(raw_components_dir, file_name)
            components.append(full_path)
    
    return process_captions(poster_path, components)

if __name__ == "__main__":
    poster = "Input/2.png"
    results = get_image_captions(poster)
    print(results)



