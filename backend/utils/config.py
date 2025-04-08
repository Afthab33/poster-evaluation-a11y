import os

DIRECTORIES_TO_CLEAR = [
    "utils/Input",
    "utils/Memory/Raw Components",
    "utils/Output/Logos",
    "utils/Buffer/components",
    "utils/Output/Color_Contrast",
    "utils/Output/"
]

def clear_directories():
    for directory in DIRECTORIES_TO_CLEAR:
        if os.path.exists(directory):
            for filename in os.listdir(directory):
                file_path = os.path.join(directory, filename)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except Exception:
                    pass
