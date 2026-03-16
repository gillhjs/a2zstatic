from PIL import Image
import os

folder = os.path.dirname(os.path.abspath(__file__))

converted = 0

for file in os.listdir(folder):
    if file.lower().endswith(".png"):
        try:
            path = os.path.join(folder, file)

            img = Image.open(path)

            webp_path = os.path.join(folder, os.path.splitext(file)[0] + ".webp")

            img.save(webp_path, "WEBP", quality=80)

            print(f"Converted: {file} -> {os.path.basename(webp_path)}")
            converted += 1

        except Exception as e:
            print(f"Error converting {file}: {e}")

print(f"\nFinished. {converted} images converted.")

input("\nPress ENTER to close...")