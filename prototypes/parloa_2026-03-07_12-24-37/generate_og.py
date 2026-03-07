#!/usr/bin/env python3
"""Generate OG image for Parloa lead prototype."""
from PIL import Image, ImageDraw, ImageFont
import os

WIDTH, HEIGHT = 1200, 630
PAD = 60
BG_TOP = (15, 22, 41)      # #0f1629
BG_BOT = (20, 30, 60)

img = Image.new("RGB", (WIDTH, HEIGHT), BG_TOP)
draw = ImageDraw.Draw(img)

# Gradient background
for y in range(HEIGHT):
    r = int(BG_TOP[0] + (BG_BOT[0] - BG_TOP[0]) * y / HEIGHT)
    g = int(BG_TOP[1] + (BG_BOT[1] - BG_TOP[1]) * y / HEIGHT)
    b = int(BG_TOP[2] + (BG_BOT[2] - BG_TOP[2]) * y / HEIGHT)
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# Create Parloa-style icon (since we can't download)
icon_size = 200
icon_x, icon_y = PAD, (HEIGHT - icon_size) // 2
# Draw a rounded square with Parloa brand colors
for i in range(icon_size):
    for j in range(icon_size):
        # Rounded corners
        radius = 20
        px, py = icon_x + i, icon_y + j
        in_rect = True
        if i < radius and j < radius:
            in_rect = (i - radius) ** 2 + (j - radius) ** 2 <= radius ** 2
        elif i >= icon_size - radius and j < radius:
            in_rect = (i - (icon_size - radius)) ** 2 + (j - radius) ** 2 <= radius ** 2
        elif i < radius and j >= icon_size - radius:
            in_rect = (i - radius) ** 2 + (j - (icon_size - radius)) ** 2 <= radius ** 2
        elif i >= icon_size - radius and j >= icon_size - radius:
            in_rect = (i - (icon_size - radius)) ** 2 + (j - (icon_size - radius)) ** 2 <= radius ** 2
        if in_rect:
            # Blue-to-purple gradient
            r = int(66 + (130 - 66) * j / icon_size)
            g = int(99 + (80 - 99) * j / icon_size)
            b = int(235 + (200 - 235) * j / icon_size)
            img.putpixel((px, py), (r, g, b))

# Draw "P" letter in icon
try:
    icon_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
except:
    icon_font = ImageFont.load_default()
p_bbox = draw.textbbox((0, 0), "P", font=icon_font)
p_w = p_bbox[2] - p_bbox[0]
p_h = p_bbox[3] - p_bbox[1]
draw.text(
    (icon_x + (icon_size - p_w) // 2, icon_y + (icon_size - p_h) // 2 - 10),
    "P", fill="white", font=icon_font
)

# Text area: right of icon
text_x = icon_x + icon_size + 40
text_area_w = WIDTH - text_x - PAD
text_y_center = HEIGHT // 2

# Main question
try:
    title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    sub_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
except:
    title_font = ImageFont.load_default()
    sub_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

main_text = "What if your AI agents\nlived natively in\nevery mobile app?"

# Calculate text block height
lines = main_text.split("\n")
line_heights = []
for line in lines:
    bbox = draw.textbbox((0, 0), line, font=title_font)
    line_heights.append(bbox[3] - bbox[1])
total_text_h = sum(line_heights) + len(lines) * 8 + 120  # padding for sub elements

start_y = text_y_center - total_text_h // 2

# Draw main text
y = start_y
for line in lines:
    draw.text((text_x, y), line, fill="white", font=title_font)
    bbox = draw.textbbox((0, 0), line, font=title_font)
    y += (bbox[3] - bbox[1]) + 8

y += 15

# App name
draw.text((text_x, y), "Parloa — AI Agent Management Platform", fill=(160, 170, 190), font=sub_font)
y += 35

# Orange accent line
draw.rectangle([(text_x, y), (text_x + 80, y + 4)], fill=(255, 140, 50))
y += 20

# Bottom text
draw.text((text_x, y), "AI-powered mobile teardown by Elinext", fill=(120, 130, 150), font=small_font)

# Save
out_dir = os.path.dirname(os.path.abspath(__file__))
img.save(os.path.join(out_dir, "og-image.jpg"), "JPEG", quality=90)
print("OG image generated successfully")
