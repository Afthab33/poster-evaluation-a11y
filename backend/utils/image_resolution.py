from PIL import Image

def get_image_resolution_and_dpi(image_path):
    with Image.open(image_path) as img:
        width, height = img.size
        dpi = img.info.get('dpi', (72, 72))
    return width, height, dpi

def evaluate_image_accessibility(image_path):
    width, height, dpi = get_image_resolution_and_dpi(image_path)
    
    evaluation_result = {
        'Resolution': f"{width}x{height}",
        'DPI': dpi[0]
    }

    return evaluation_result





