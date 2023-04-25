import io
import base64
import pydicom
from PIL import Image
from flask import Flask, jsonify
from flask import Flask, request, jsonify
import numpy as np

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_dicom_to_png():
    dicom_file = request.files['file']
    print("dicom file:")
    print(dicom_file)
    filename = dicom_file.filename
    print("filename : " + filename)
    ds = pydicom.dcmread(dicom_file)
    if ds.pixel_array.ndim == 2:
        # Single frame image
        im = Image.fromarray(ds.pixel_array)
        im = im.convert('RGB')
        im_data = io.BytesIO()
        im.save(im_data, format='PNG')
        im_data.seek(0)
        im_base64 = base64.b64encode(im_data.read()).decode('utf-8')
        im.show()
        return jsonify({'success': True, 'image': im_base64})
    elif ds.pixel_array.ndim == 3:
        # Multi-frame image
        print("inside multi-frame dicom image")
        ims = []
        for frame in ds.pixel_array:
            im = Image.fromarray(frame)
            im = im.convert('RGB')
            im_data = io.BytesIO()
            im.save(im_data, format='PNG')
            im_data.seek(0)
            im_base64 = base64.b64encode(im_data.read()).decode('utf-8')
            ims.append({
                'original': f'data:image/png;base64,{im_base64}',
                'thumbnail': f'data:image/png;base64,{im_base64}',
                'originalAlt': filename,
                'thumbnailAlt': filename
            })
        return jsonify({'success': True,'images': ims})
    else:
        return jsonify({'success': False, 'error': 'Invalid DICOM image'})

if __name__ == '__main__':
    app.run(debug=True)

