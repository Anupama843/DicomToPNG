import pydicom
import shutil
from flask import Flask, request, jsonify, send_file
import os
import metadata_extraction
import singleframe_dicom_converter
import multiframe_dicom_converter

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_dicom_to_png():
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded. Please upload Dicom Image file'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Uploaded file is empty'})

    _, ext = os.path.splitext(file.filename)
    print("extension")
    print(ext)
    if ext.lower() != '.dcm':
        print("inside error handling")
        return jsonify({'success': False, 'error': 'Not a dicom file. Only ".DCM" or ".dcm" dicom image files are supported'})
    
    global final_path
    global new_dir
    dicom_file = request.files['file']
    print("dicom file:")
    print(dicom_file)
    filename = dicom_file.filename
    #filename_metadata = os.path.splitext(dicom_file)[0] + '.csv'
    print("filename : " + filename)
    ds = pydicom.dcmread(dicom_file)
    print("ds ========>>>> ")
    print(ds)

    metadata = metadata_extraction.dicom_to_csv(ds)

    # try:
    #     shutil.rmtree('./temp')
    # except OSError as e:
    #     print("Error: %s - %s." % (e.filename, e.strerror))

    if(metadata == ""):
        return jsonify({'success': False, 'error': 'Metadata conversion failed'})
    
    if ds.pixel_array.ndim == 2:
        print("uploaded dicom image is single frame")
        try:
            converted_image = singleframe_dicom_converter.singleframe_dicom_converter(ds)
            return jsonify({'success': True, 'image': converted_image, 'metadata': metadata})
        except Exception as e:
            print("Exception is :")
            print(e)
            return jsonify({'success': False, 'error': 'Single frame dicom image conversion failed'})
            
    elif ds.pixel_array.ndim == 3:
        print("upload dicom image is multi frame")
        try:
            converted_images = multiframe_dicom_converter.multiframe_dicom_converter(ds)
            return jsonify({'success': True, 'images': converted_images, 'metadata': metadata})
        except Exception as e:
            print("Exception is :")
            print(e)
            return jsonify({'success': False, 'error': 'Multi frame dicom image conversion failed'})
    else:
        return jsonify({'success': False, 'error': 'Invalid DICOM image'})
    

@app.route('/saveFile', methods=['POST'])
def save_dicom_file():
    print("in save file method")
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded. Please upload Dicom Image file'})

    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'success': False, 'error': 'Uploaded file is empty'})


    # Save the file to a local directory
    save_path = os.path.join(os.getcwd(), uploaded_file.filename)
    uploaded_file.save(save_path)

    return "File saved successfully."


if __name__ == '__main__':
    app.run(debug=True)

