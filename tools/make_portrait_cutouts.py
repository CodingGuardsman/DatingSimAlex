from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1] / "assets/images/characters"
FILES = [
    path
    for path in ROOT.rglob("*")
    if path.suffix.lower() in {".png", ".jpg", ".jpeg"}
    and "move-the-character" not in path.name
]


for source in FILES:
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        continue

    height, width = image.shape[:2]
    mask = np.zeros((height, width), np.uint8)
    rectangle = (max(2, width // 30), max(2, height // 30),
                 width - 2 * max(2, width // 30),
                 height - 2 * max(2, height // 30))
    background_model = np.zeros((1, 65), np.float64)
    foreground_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(image, mask, rectangle, background_model, foreground_model, 5,
                cv2.GC_INIT_WITH_RECT)
    alpha = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0
    ).astype(np.uint8)
    alpha = cv2.medianBlur(alpha, 3)
    result = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)
    result[:, :, 3] = alpha
    destination = source.with_name(f"{source.stem}.cutout.png")
    cv2.imwrite(str(destination), result)
    print(destination)