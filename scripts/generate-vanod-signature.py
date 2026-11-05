"""Bake the authored film into transparent, random-access WebP sheets (OpenCV, Pillow, NumPy)."""
import hashlib
import json
from io import BytesIO
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

site = Path(__file__).resolve().parents[1] / "site"
art = site / "public/projects/vanod/interactive"
clip = cv2.VideoCapture(str(art / "brand-lockup-scrub.mp4"))
masks = []
while True:
    ok, frame = clip.read()
    if not ok:
        break
    alpha = np.clip(np.rint(frame.sum(axis=2) * 0.38 - 17.85), 0, 255).astype(np.uint8)
    masks.append(Image.fromarray(alpha))
clip.release()
if not masks:
    raise ValueError("Couldn't decode the Vanod signature source")

# Keep the original stage registration, cropped to the union of the ink bounds.
bounds = [mask.getbbox() for mask in masks if mask.getbbox()]
left, top = [min(box[i] for box in bounds) // 4 * 4 for i in (0, 1)]
right, bottom = [(max(box[i] for box in bounds) + 3) // 4 * 4 for i in (2, 3)]
columns, per_sheet = 4, 32
manifest = dict(frames=len(masks), columns=columns, perSheet=per_sheet, tiers=[])
for scale in (0.75, 1):
    w, h = int((right-left)*scale), int((bottom-top)*scale)
    tier = dict(width=int(masks[0].width*scale), height=int(masks[0].height*scale),
                x=int(left*scale), y=int(top*scale), w=w, h=h, sheets=[])
    for start in range(0, len(masks), per_sheet):
        group = masks[start:start+per_sheet]
        sheet = Image.new("L", (columns*w, ((len(group)+columns-1)//columns)*h))
        for index, mask in enumerate(group):
            tile = mask.crop((left, top, right, bottom)).resize((w, h), Image.Resampling.LANCZOS)
            sheet.paste(tile, (index % columns*w, index//columns*h))
        rgba = Image.new("RGBA", sheet.size)
        rgba.putalpha(sheet)
        buffer = BytesIO()
        rgba.save(buffer, "WEBP", lossless=True, method=5)
        data = buffer.getvalue()
        name = f"signature-{tier['width']}-{start:02}-{hashlib.sha256(data).hexdigest()[:12]}.webp"
        (art / name).write_bytes(data)
        tier["sheets"].append(name)
    manifest["tiers"].append(tier)

(site / "components/vanod/signature-frames.json").write_text(json.dumps(manifest, indent=2) + "\n")
