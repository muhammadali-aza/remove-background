from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os

app = Flask(__name__)
# CORS setting for production
CORS(app, resources={r"/*": {"origins": "*"}})

def process_image_file(file_storage):
    file_bytes = file_storage.read()
    output = remove(file_bytes)
    out_io = io.BytesIO()
    
    if isinstance(output, (bytes, bytearray)):
        out_io.write(output)
    elif isinstance(output, Image.Image):
        output.save(out_io, "PNG")
    else:
        out_io.write(bytes(output))
        
    out_io.seek(0)
    return out_io

@app.route("/remove-bg", methods=["POST"])
def remove_background_route():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    try:
        png_io = process_image_file(file)
        return send_file(png_io, mimetype="image/png")
    except Exception as e:
        app.logger.exception("Background removal failed")
        return jsonify({"error": "Background removal failed", "details": str(e)}), 500

# Railway/Production Port logic
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)