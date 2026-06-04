from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(filename, size, color, text):
    img = Image.new('RGB', size, color)
    d = ImageDraw.Draw(img)
    
    # Try to load a font, otherwise use default
    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()

    # Calculate text position
    bbox = d.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((size[0] - text_width) / 2, (size[1] - text_height) / 2)
    
    d.text(position, text, fill=(255, 255, 255), font=font)
    
    path = os.path.join('d:/Antigravity/assets', filename)
    img.save(path)
    print(f"Created {path}")

# Create assets directory if it doesn't exist (just in case)
if not os.path.exists('d:/Antigravity/assets'):
    os.makedirs('d:/Antigravity/assets')

# Create Hero Background (Dark Blue/Purple)
create_placeholder('hero_bg_placeholder.jpg', (1920, 1080), (10, 10, 30), "Hero Background Placeholder")

# Create User Profile (Gray/Blue)
create_placeholder('ashad_placeholder.jpg', (400, 400), (50, 50, 80), "Ashad")

print("Placeholders created successfully.")
