import cv2
import spacy
from doclayout_yolo import YOLOv10
import warnings
import pytesseract
from PIL import Image
from ultralytics import YOLO
import numpy as np
import math
import os
from .color_contrast_evaluation import ColorContrastEvaluator
import google.generativeai as genai

warnings.filterwarnings("ignore", category=FutureWarning)

genai.configure(api_key="AIzaSyBSIkpsua97dh-Rx1kBidtLMumpRoF3C1U")
model = genai.GenerativeModel("gemini-1.5-flash-latest")

class LogoInfo:
    def __init__(self, image_path, label):
        self.image_path = image_path
        self.label = label

class PosterComponentExtractor:
    def __init__(self, poster_path):
        self.poster_path = poster_path
        self.authors = []
        self.author_coords = []
        self.logo_count = 0
        self.figure_count = 0
        self.diagram_count = 0
        self.caption_count = 0
        self.annotated_image = None
        self.original_image = None
        self.title_coords = {}
        self.color_contrast_evaluator = None
        self.logo_annotated_image = None
        self.logos_info = []
        self.table_count = 0
        
        self.directories = {
            'raw_components': "utils/Memory/Raw Components",
            'buffer': "utils/Buffer/components",
            'output': "utils/Output",
            'logos': "utils/Output/Logos"
        }
        
        for directory in self.directories.values():
            os.makedirs(directory, exist_ok=True)
            
        self.component_counters = {
            'title': 0,
            'heading': 0,
            'plain_text': 0,
            'pie_chart': 0,
            'bar_graphs': 0,
            'line_graph': 0,
            'diagram': 0,
            'logo': 0,
            'caption': 0,
            'table': 0,
            'authors': 0
        }

        self.base_model = YOLOv10(r"utils\Models\base.pt")
        self.figure_model = YOLO(r'utils\Models\figure_classifier.pt')
        self.logo_model = YOLO(r"utils\Models\logo_classifier.pt")

        self.components = ['title', 'plain text', 'abandon', 'figure', 'figure_caption', 
                        'table', 'table_caption', 'table_footnote', 'isolate_formula', 'formula_caption']
        self.captions = ['table_caption', 'table_footnote', 'figure_caption']

        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    def save_to_raw_components(self, component_type, x1, y1, x2, y2):
        self.component_counters[component_type] += 1
        count = self.component_counters[component_type]
        filename = f"{component_type}_{count}.jpg"
        filepath = os.path.join(self.directories['raw_components'], filename)
        cropped_image = self.original_image[y1:y2, x1:x2]
        cv2.imwrite(filepath, cropped_image)
        return count

    def count_words(self, input_string):
        words = input_string.split()
        return len(words)

    def count_persons(self, text):
        nlp = spacy.load("en_core_web_sm")
        count = 0
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                self.authors.append(ent.text)
                count += 1
        return count

    def isAuthorSection(self, image_path):
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        word_count = self.count_words(text)
        if word_count >= 25:
            return False
        if word_count < 25 and self.count_persons(text) >= 1:
            return True
        return False

    def process_component(self, index, x1, y1, x2, y2, cropped_image, component_count):
        component_type = self.components[index]
        handlers = {
            'plain text': self.handle_plain_text,
            'title': self.handle_title,
            'figure': self.handle_figure,
            'abandon': self.handle_figure,
            'table': self.handle_table,
            'table_caption': self.handle_caption,
            'table_footnote': self.handle_caption,
            'figure_caption': self.handle_caption
        }
        handler = handlers.get(component_type, self.handle_unknown)
        handler(x1, y1, x2, y2, cropped_image, component_count, component_type)

    def handle_plain_text(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        filename = os.path.join(self.directories['buffer'], f"{component_count}_{component_type}.jpg")
        cv2.imwrite(filename, cropped_image)

        if self.isAuthorSection(filename):
            text = pytesseract.image_to_string(cropped_image).strip()
            if text:
                self.author_coords.append((x1, y1, x2, y2, text))
                count = self.save_to_raw_components('authors', x1, y1, x2, y2)
                cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 0, 0), 2)
                cv2.putText(self.annotated_image, "Authors", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
                self.color_contrast_evaluator.evaluate_section('authors', x1, y1, x2, y2, cropped_image)
        else:
            count = self.save_to_raw_components('plain_text', x1, y1, x2, y2)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 0, 0), 2)
            cv2.putText(self.annotated_image, "Plain Text", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
            self.color_contrast_evaluator.evaluate_section('plain_text', x1, y1, x2, y2, cropped_image)

    def finalize_authors(self):
        if not self.author_coords or not self.title_coords:
            return

        max_index = max(self.title_coords, key=lambda k: (self.title_coords[k][2] - self.title_coords[k][0]) * (self.title_coords[k][3] - self.title_coords[k][1]))
        title_x1, title_y1, title_x2, title_y2, _ = self.title_coords[max_index]

        title_x, title_y = (title_x1 + title_x2) // 2, (title_y1 + title_y2) // 2

        closest_author = None
        min_distance = float("inf")

        for coords in self.author_coords:
            x1, y1, x2, y2, text = coords
            x, y = (x1 + x2) // 2, (y1 + y2) // 2
            distance = math.sqrt((x - title_x) ** 2 + (y - title_y) ** 2)

            if distance < min_distance:
                min_distance = distance
                closest_author = coords

        if closest_author and min_distance < 300:
            x1, y1, x2, y2, text = closest_author
            self.authors.append(text)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 0, 0), 2)
            cv2.putText(self.annotated_image, "Authors", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            
    def handle_title(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        filename = os.path.join(self.directories['buffer'], f"{component_count}_{component_type}.jpg")
        cv2.imwrite(filename, cropped_image)

        title_area = abs((y2 - y1) * (x2 - x1))
        self.title_coords[component_count] = (x1, y1, x2, y2, title_area)
        cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 255, 255), 2)

    def finalize_titles(self):
        if self.title_coords:
            max_index = max(self.title_coords, key=lambda k: self.title_coords[k][4])
            max_title = self.title_coords[max_index]

            x1, y1, x2, y2, _ = max_title
            count = self.save_to_raw_components('title', x1, y1, x2, y2)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 0, 255), 2)
            cv2.putText(self.annotated_image, "Title", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
            cropped_title = self.original_image[y1:y2, x1:x2].copy()
            self.color_contrast_evaluator.evaluate_section('title', x1, y1, x2, y2, cropped_title)

            for idx, (x1, y1, x2, y2, _) in self.title_coords.items():
                if idx != max_index:
                    count = self.save_to_raw_components('heading', x1, y1, x2, y2)
                    cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 165, 255), 2)
                    cv2.putText(self.annotated_image, "Heading", (x1, y1 - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
                    cropped_heading = self.original_image[y1:y2, x1:x2].copy()
                    self.color_contrast_evaluator.evaluate_section('heading', x1, y1, x2, y2, cropped_heading)

    def handle_figure(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        filename = os.path.join(self.directories['buffer'], f"{component_count}_{component_type}.jpg")
        cv2.imwrite(filename, cropped_image)

        figure_type = self.figure_model(filename, verbose=False)
        figure_name = figure_type[0].names[np.argmax(figure_type[0].probs.data.tolist())]

        figure_area = abs((y2 - y1) * (x2 - x1))

        if figure_name == "Logo":
            if figure_area >= 34000:
                self.diagram_count += 1
                count = self.save_to_raw_components('diagram', x1, y1, x2, y2)
                cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 255, 0), 2)
                cv2.putText(self.annotated_image, "Diagram", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)
            else:
                logo_type = self.logo_model(filename, verbose=False)
                logo_name = logo_type[0].names[np.argmax(logo_type[0].probs.data.tolist())]

                self.logo_count += 1
                logo_filename = f"logo_{self.logo_count}.png"
                logo_path = os.path.join(self.directories['logos'], logo_filename)
                cv2.imwrite(logo_path, cropped_image)

                self.logos_info.append(LogoInfo(
                    image_path=f"Output/Logos/{logo_filename}",
                    label=logo_name
                ))

                count = self.save_to_raw_components('logo', x1, y1, x2, y2)
                
                color = (0, 255, 0) if logo_name == 'Simple' else (0, 0, 255)
                cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), color, 2)
                cv2.putText(self.annotated_image, f"Logo {self.logo_count}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                
                if self.logo_annotated_image is None:
                    self.logo_annotated_image = self.original_image.copy()
                cv2.rectangle(self.logo_annotated_image, (x1, y1), (x2, y2), color, 2)
                cv2.putText(self.logo_annotated_image, f"Logo {self.logo_count}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

        elif figure_name == "Table":
            self.table_count += 1
            count = self.save_to_raw_components('table', x1, y1, x2, y2)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(self.annotated_image, f"Table {self.table_count}", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

        elif figure_name in ['Pie Chart', 'Bar Graphs', 'Line graph']:
            self.figure_count += 1
            component_type = figure_name.lower().replace(' ', '_')
            count = self.save_to_raw_components(component_type, x1, y1, x2, y2)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(self.annotated_image, figure_name, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        else:
            self.diagram_count += 1
            count = self.save_to_raw_components('diagram', x1, y1, x2, y2)
            cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 255, 0), 2)
            cv2.putText(self.annotated_image, "Diagram", (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2)

    def handle_table(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        self.figure_count += 1
        count = self.save_to_raw_components('table', x1, y1, x2, y2)
        cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (255, 0, 255), 2)
        cv2.putText(self.annotated_image, "Table", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)

    def handle_caption(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        self.caption_count += 1
        count = self.save_to_raw_components('caption', x1, y1, x2, y2)
        cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (0, 128, 128), 2)
        cv2.putText(self.annotated_image, "Caption", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 128, 128), 2)
        self.color_contrast_evaluator.evaluate_section('caption', x1, y1, x2, y2, cropped_image)

    def handle_unknown(self, x1, y1, x2, y2, cropped_image, component_count, component_type):
        cv2.rectangle(self.annotated_image, (x1, y1), (x2, y2), (128, 128, 128), 2)
        cv2.putText(self.annotated_image, "Unknown", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (128, 128, 128), 2)

    def extractComponents(self):
        self.original_image = cv2.imread(self.poster_path)
        if self.original_image is None:
            raise FileNotFoundError(f"Could not read image at {self.poster_path}")
            
        self.annotated_image = self.original_image.copy()
        self.logo_annotated_image = self.original_image.copy()
        self.color_contrast_evaluator = ColorContrastEvaluator(self.original_image)

        result = self.base_model.predict(
            self.poster_path,
            imgsz=1024,
            conf=0.2,
            device="cuda:0",
            verbose=False
        )

        boxes = result[0].boxes.data.cpu()
        component_count = 0

        for row in boxes:
            x1, y1, x2, y2, conf, index = map(int, row[:6])
            cropped_image = self.original_image[y1:y2, x1:x2]
            self.process_component(index, x1, y1, x2, y2, cropped_image, component_count)
            component_count += 1
        self.finalize_titles()
        self.finalize_authors()
        
        cv2.imwrite(os.path.join(self.directories['output'], 'extracted_components.png'), self.annotated_image)
        self.color_contrast_evaluator.save_result()

        if self.logo_count > 0:
            cv2.imwrite(os.path.join(self.directories['logos'], "logos_annotated.png"), self.logo_annotated_image)

    def get_logo_evaluation(self):
        if self.logo_count == 0:
            return None

        return {
            "logo_evaluation_summary": "get-image/Output/Logos/logos_annotated.png",
            "logos": [
                {
                    f"logo_{i+1}": "get-image/"+logo_info.image_path,
                    "label": logo_info.label
                }
                for i, logo_info in enumerate(self.logos_info)
            ]
        }

    def get_report(self):
        report = {
            'poster_layout': 'get-image/Output/extracted_components.png'
        }
        
        logo_eval = self.get_logo_evaluation()
        if logo_eval:
            report['logo_evaluation'] = logo_eval

        color_contrast_results = self.color_contrast_evaluator.get_results()
        if color_contrast_results:
            report['color_contrast'] = color_contrast_results
            
        # from utils.caption_extractor import check_figure_captions
        # caption_status = check_figure_captions(self.poster_path)
        # if caption_status:
        #     report['captions'] = caption_status
            
        return report

    
