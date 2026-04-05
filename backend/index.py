from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

def process_image_file(file_storage) -> io.BytesIO:
    """
    Accepts a Werkzeug FileStorage (uploaded file), removes background using rembg,
    and returns a BytesIO containing PNG bytes.
    """
    file_bytes = file_storage.read()
    # rembg.remove may accept bytes or PIL.Image and may return bytes or PIL.Image
    output = remove(file_bytes)

    out_io = io.BytesIO()
    if isinstance(output, (bytes, bytearray)):
        out_io.write(output)
    elif isinstance(output, Image.Image):
        output.save(out_io, "PNG")
    else:
        # Try to treat output as raw bytes if unexpected type
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
        # Log the error server-side and return a clear client error message
        app.logger.exception("Background removal failed")
        return jsonify({"error": "Background removal failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)