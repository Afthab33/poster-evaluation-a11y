import cv2
import numpy as np
import os

def get_relative_luminance(r, g, b):
    r, g, b = r/255, g/255, b/255
    r = r/12.92 if r <= 0.03928 else ((r + 0.055)/1.055) ** 2.4
    g = g/12.92 if g <= 0.03928 else ((g + 0.055)/1.055) ** 2.4
    b = b/12.92 if b <= 0.03928 else ((b + 0.055)/1.055) ** 2.4
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def calculate_contrast_ratio(text_color, background_color):
    l1 = get_relative_luminance(*text_color)
    l2 = get_relative_luminance(*background_color)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

def get_dominant_colors(image):
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    pixels = img_rgb.reshape(-1, 3)

    _, _, centers = cv2.kmeans(np.float32(pixels), 2, None, 
                              (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, .1), 
                              10, cv2.KMEANS_RANDOM_CENTERS)

    colors = np.uint8(centers)
    edge_pixels = np.vstack([img_rgb[:10, :].reshape(-1, 3), img_rgb[-10:, :].reshape(-1, 3),
                            img_rgb[:, :10].reshape(-1, 3), img_rgb[:, -10:].reshape(-1, 3)])

    edge_votes = [sum(1 for pixel in edge_pixels if np.sum((pixel - color) ** 2) < 
                  np.sum((pixel - other_color) ** 2)) for color, other_color in 
                  [(colors[0], colors[1]), (colors[1], colors[0])]]

    background_color = colors[np.argmax(edge_votes)]
    text_color = colors[1 - np.argmax(edge_votes)]

    return text_color, background_color

class ColorContrastEvaluator:
    def __init__(self, original_image):
        self.original_image = original_image.copy()
        self.contrast_result_image = original_image.copy()
        self.section_counter = 0
        self.color_contrast_result = []

        self.thresholds = {
            'plain_text': 3.0,
            'title': 4.5,
            'caption': 3.0,
            'authors': 4.5,
            'heading': 4.5
        }

    def evaluate_section(self, component_type, x1, y1, x2, y2, cropped_image):
        self.section_counter += 1
        
        if cropped_image is None or cropped_image.size == 0:
            raise ValueError("Invalid cropped image provided")

        section_image = cropped_image.copy()
        
        text_color, background_color = get_dominant_colors(cropped_image)
        text_color = tuple(map(int, text_color))
        background_color = tuple(map(int, background_color))
        
        ratio = calculate_contrast_ratio(text_color, background_color)
        threshold = self.thresholds.get(component_type, 4.5)
        is_pass = ratio >= threshold

        result_entry = {
            'section': section_image,
            'text_color': text_color,
            'background_color': background_color,
            f'{component_type}_threshold': threshold,
            'accessibility': 'PASS' if is_pass else 'FAIL',
            'contrast_ratio': ratio,
            'type': component_type
        }
            
        self.color_contrast_result.append(result_entry)

        color = (0, 255, 0) if is_pass else (0, 0, 255)
        cv2.rectangle(self.contrast_result_image, (x1, y1), (x2, y2), color, 2)
        cv2.putText(self.contrast_result_image, 
                    f"Section {self.section_counter}", 
                    (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    def save_result(self):
        output_dir = "utils/Output/Color_Contrast"
        os.makedirs(output_dir, exist_ok=True)
        cv2.imwrite(os.path.join(output_dir, "color_contrast_result.png"), self.contrast_result_image)

    def get_results(self):
        if not self.color_contrast_result:
            return None

        results = {
            'sections': [],
            'color_contrast_summary': 'get-image/Output/Color_Contrast/color_contrast_result.png'
        }
        
        for idx, section in enumerate(self.color_contrast_result):
            section_filename = f'section_{idx + 1}.png'
            section_path = os.path.join("utils/Output/Color_Contrast", section_filename)
            cv2.imwrite(section_path, section['section'])
            
            section_dto = {
                'section_id': idx + 1,
                'section_image': f'get-image/Output/Color_Contrast/{section_filename}',
                'text_color': section['text_color'],
                'background_color': section['background_color'],
                'contrast_ratio': float(section['contrast_ratio']),
                'accessibility': section['accessibility'],
                'type': section['type'],
                'threshold': section[f"{section['type']}_threshold"]
            }
            results['sections'].append(section_dto)
            
        return results
