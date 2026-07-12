#!/usr/bin/env python3
"""Genera iconos PWA con el logo ñ+π usando Pillow."""
import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = "/home/z/my-project/public"

def render_icon(size, with_text=True):
    """Renderiza el logo ñ+π en un icono cuadrado con gradiente diagonal."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Fondo con gradiente diagonal azul -> verde
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size) if size > 0 else 0
            # azul (37, 99, 235) -> verde (16, 185, 129)
            r = int(37 + (16 - 37) * t)
            g = int(99 + (185 - 99) * t)
            b = int(235 + (129 - 235) * t)
            img.putpixel((x, y), (r, g, b, 255))
    
    if with_text:
        # Texto ñ+π en blanco, centrado
        # Buscar fuente TrueType disponible
        font_paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
        ]
        font = None
        for fp in font_paths:
            if os.path.exists(fp):
                try:
                    font = ImageFont.truetype(fp, int(size * 0.32))
                    break
                except Exception:
                    pass
        if font is None:
            font = ImageFont.load_default()
        
        text = "ñ+π"
        # Calcular posición centrada
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            tx = (size - tw) // 2 - bbox[0]
            ty = (size - th) // 2 - bbox[1] - int(size * 0.02)
        except Exception:
            tw, th = size // 2, size // 3
            tx = (size - tw) // 2
            ty = (size - th) // 2
        
        # Sombra sutil
        draw.text((tx + 2, ty + 2), text, font=font, fill=(0, 0, 0, 60))
        # Texto principal
        draw.text((tx, ty), text, font=font, fill=(255, 255, 255, 255))
    
    return img

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # 192x192
    print("Generando icon-192.png...")
    img = render_icon(192)
    img.save(os.path.join(OUT_DIR, "icon-192.png"), "PNG")
    print(f"  OK")
    
    # 512x512
    print("Generando icon-512.png...")
    img = render_icon(512)
    img.save(os.path.join(OUT_DIR, "icon-512.png"), "PNG")
    print(f"  OK")
    
    # apple-touch-icon 180x180 sin transparencia (fondo opaco)
    print("Generando apple-touch-icon.png...")
    img = render_icon(180, with_text=True)
    # Aplanar sobre fondo blanco para iOS
    bg = Image.new("RGBA", (180, 180), (255, 255, 255, 255))
    bg.alpha_composite(img)
    bg.convert("RGB").save(os.path.join(OUT_DIR, "apple-touch-icon.png"), "PNG")
    print(f"  OK")
    
    # favicon 32x32
    print("Generando favicon.ico...")
    img32 = render_icon(32)
    img16 = render_icon(16)
    img32.save(os.path.join(OUT_DIR, "favicon.ico"), format="ICO", sizes=[(16, 16), (32, 32)])
    print(f"  OK")
    
    print("Todos los iconos generados.")

if __name__ == "__main__":
    main()
