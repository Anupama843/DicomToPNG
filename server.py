import io
import base64
import pydicom
from PIL import Image
from flask import Flask, jsonify
from flask import Flask, request, jsonify
import numpy as np
import os
from os import write
import csv
import metadata_extraction

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_dicom_to_png():
    dicom_file = request.files['file']
    print("dicom file:")
    print(dicom_file)
    filename = dicom_file.filename
    #filename_metadata = os.path.splitext(dicom_file)[0] + '.csv'
    print("filename : " + filename)
    ds = pydicom.dcmread(dicom_file)
    # metadata = dicom_to_csv(ds)
    metadata = metadata_extraction.dicom_to_csv(dicom_file.filename)
    if ds.pixel_array.ndim == 2:
        # Single frame image
        im = Image.fromarray(ds.pixel_array)
        im = im.convert('RGB')
        im_data = io.BytesIO()
        im.save(im_data, format='PNG')
        im_data.seek(0)
        im_base64 = base64.b64encode(im_data.read()).decode('utf-8')
        im.show()
        
        return jsonify({'success': True, 'image': im_base64, 'metadata': metadata})
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
            #metadata = dicom_to_csv(dicom_file)
        return jsonify({'success': True,'images': ims, 'metadata': metadata})
    else:
        return jsonify({'success': False, 'error': 'Invalid DICOM image'})




def dicom_to_csv(ds):
    # ds = pydicom.dcmread(dicom_file)
    filename = 'dicom_to_csv_converted_file.csv' #os.path.splitext(dicom_file)[0] + '.csv'
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow("Group Elem Description VR Value".split())
        for elem in ds:
            writer.writerow([
                f"{elem.tag.group:04x}", f"{elem.tag.element:04x}",
                elem.description(), elem.VR, str(elem.value)
            ])
        cvs_data = base64.encode(open(filename, 'r'), open(filename, 'w'))
    return cvs_data





if __name__ == '__main__':
    app.run(debug=True)

