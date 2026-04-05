from flask import Flask, request, send_file
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return {"error": "No image uploaded"}, 400
    
    file = request.files['image']
    # Read raw bytes from the uploaded file
    file_bytes = file.read()

    # Background remove main function — rembg.remove may return bytes or a PIL.Image
    output = remove(file_bytes)

    # If rembg returned raw bytes, wrap in BytesIO and send directly
    if isinstance(output, (bytes, bytearray)):
        img_io = io.BytesIO(output)
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png')

    # Otherwise assume it's a PIL Image and save to BytesIO
    img_io = io.BytesIO()
    output.save(img_io, 'PNG')
    img_io.seek(0)

    return send_file(img_io, mimetype='image/png')

if __name__ == '__main__':
    app.run(debug=True, port=5000)