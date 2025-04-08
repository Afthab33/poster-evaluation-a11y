import pytesseract
import cv2
import re
import requests

def check_link(url):
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    try:
        response = requests.head(url, allow_redirects=True, timeout=5)
        return response.status_code >= 200 and response.status_code < 400
    except requests.exceptions.RequestException:
        return False

def evaluateLink(poster):
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    image = cv2.imread(poster)
    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)

    url_pattern = r'\b(?:[a-zA-Z0-9-]+\.)+(com|edu|org|net|gov|mil|info|biz|co|io|ai|tech|me|us|uk|ca|in|pdf)\b'
    link_statuses = {}

    for i in range(len(data['text'])):
        word = data['text'][i]
        if re.search(url_pattern, word):
            is_working = check_link(word)
            link_statuses[word] = "Valid" if is_working else "Invalid"
            (x, y, w, h) = (data['left'][i], data['top'][i], data['width'][i], data['height'][i])
            color = (0, 255, 17) if is_working else (0, 0, 255)
            cv2.rectangle(image, (x, y), (x + w, y + h), color, 2)
            cv2.putText(image, "Valid" if is_working else "Invalid", 
                       (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    return link_statuses

