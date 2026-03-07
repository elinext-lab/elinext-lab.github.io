#!/usr/bin/env python3
"""Generate OG image (1200x630px JPEG) for Callsy AI lead prototype."""

from PIL import Image, ImageDraw, ImageFont
import os

WIDTH, HEIGHT = 1200, 630
PADDING = 60

# --- Create base image with simulated gradient background ---
img = Image.new("RGB", (WIDTH, HEIGHT), "#0f1629")
draw = ImageDraw.Draw(img)

# Simulate vertical gradient from #0f1629 to #1a1f3a
r1, g1, b1 = 0x0F, 0x16, 0x29
r2, g2, b2 = 0x1A, 0x1F, 0x3A
for x in range(WIDTH):
    t = x / (WIDTH - 1)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    draw.line([(x, 0), (x, HEIGHT - 1)], fill=(r, g, b))

# --- Try to load fonts (use DejaVu as fallback on Ubuntu) ---
def load_font(size, bold=False):
    """Try to load a good font, falling back gracefully."""
    if bold:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]
    else:
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        ]
    for fp in font_paths:
        if os.path.exists(fp):
            return ImageFont.truetype(fp, size)
    return ImageFont.load_default()


# --- LEFT SIDE: Stylized "C" icon ---
icon_size = 200
icon_x = PADDING
icon_y = (HEIGHT - icon_size) // 2  # vertically centered

# Create icon with orange gradient square
icon_img = Image.new("RGBA", (icon_size, icon_size), (0, 0, 0, 0))
icon_draw = ImageDraw.Draw(icon_img)

# Draw gradient fill (top to bottom): #f59e0b -> #ea580c
ir1, ig1, ib1 = 0xF5, 0x9E, 0x0B
ir2, ig2, ib2 = 0xEA, 0x58, 0x0C
corner_radius = 32

for y in range(icon_size):
    t = y / (icon_size - 1)
    r = int(ir1 + (ir2 - ir1) * t)
    g = int(ig1 + (ig2 - ig1) * t)
    b = int(ib1 + (ib2 - ib1) * t)
    icon_draw.line([(0, y), (icon_size - 1, y)], fill=(r, g, b, 255))

# Create rounded corner mask
mask = Image.new("L", (icon_size, icon_size), 0)
mask_draw = ImageDraw.Draw(mask)
mask_draw.rounded_rectangle(
    [(0, 0), (icon_size - 1, icon_size - 1)],
    radius=corner_radius,
    fill=255,
)

# Apply mask for rounded corners
icon_img.putalpha(mask)

# Draw white "C" letter centered
c_font = load_font(130, bold=True)
c_text = "C"
c_bbox = icon_draw.textbbox((0, 0), c_text, font=c_font)
c_w = c_bbox[2] - c_bbox[0]
c_h = c_bbox[3] - c_bbox[1]
c_x = (icon_size - c_w) // 2 - c_bbox[0]
c_y = (icon_size - c_h) // 2 - c_bbox[1]
icon_draw.text((c_x, c_y), c_text, fill="white", font=c_font)

# Paste icon onto main image
img.paste(icon_img, (icon_x, icon_y), icon_img)

# --- RIGHT SIDE: Text content ---
text_x = 320  # 60 (padding) + 200 (icon) + 60 (gap) = 320

# Load fonts for text
main_font = load_font(52, bold=True)
brand_font = load_font(36, bold=False)
accent_font = load_font(22, bold=False)

# Main headline lines
lines = [
    "What if merchants could",
    "track cart recovery",
    "from their phone?",
]

# Calculate total text block height for vertical centering
line_height_main = 64
brand_gap = 28
brand_h = 36
accent_line_gap = 24
accent_h = 4
bottom_text_gap = 20
bottom_h = 22

main_block_h = len(lines) * line_height_main
total_text_h = (
    main_block_h
    + brand_gap
    + brand_h
    + accent_line_gap
    + accent_h
    + bottom_text_gap
    + bottom_h
)

# Vertically center the text block
text_top = (HEIGHT - total_text_h) // 2
cur_y = text_top

# Draw main headline (white, bold)
for line in lines:
    draw.text((text_x, cur_y), line, fill="white", font=main_font)
    cur_y += line_height_main

cur_y += brand_gap

# "Callsy AI" brand text (gray)
draw.text((text_x, cur_y), "Callsy AI", fill="#9ca3af", font=brand_font)
cur_y += brand_h + accent_line_gap

# Orange accent line: 4px height, 80px wide
draw.rectangle(
    [(text_x, cur_y), (text_x + 80, cur_y + 4)],
    fill="#f59e0b",
)
cur_y += accent_h + bottom_text_gap

# Bottom tagline (small gray)
draw.text(
    (text_x, cur_y),
    "AI-powered mobile teardown by Elinext",
    fill="#6b7280",
    font=accent_font,
)

# --- Save as JPEG quality 90 ---
output_path = "/home/ubuntu/lead-proto-service/output/callsy-ai_2026-03-07_08-45-40/prototype/og-image.jpg"
img_rgb = img.convert("RGB")
img_rgb.save(output_path, "JPEG", quality=90)
print(f"OG image saved: {output_path}")
print(f"Size: {img_rgb.size[0]}x{img_rgb.size[1]}px")
