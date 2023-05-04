import io
import base64
import pydicom
import shutil
from PIL import Image
from flask import Flask, request, jsonify, send_file
import numpy as np
import os
from os import write
import csv
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

    # create folder to save converted dicom images
    parent_dir = './temp/convertedimages'

    isDirExists = os.path.exists(parent_dir)
    if(isDirExists):
        try:
            print("Directory '% s' already exists!!" % parent_dir)
            shutil.rmtree(parent_dir)
            print("Directory '% s' has been removed successfully" % parent_dir)
        except OSError as error:
            print(error)
            print("Directory '% s' can not be removed" % parent_dir)

    os.makedirs(parent_dir)
    
    #separate file name and ext
    new_dir = os.path.splitext(filename)[0]
    print("New directory: " + new_dir)

    
    final_path = os.path.join(parent_dir,new_dir)
    print("final_path: " + final_path)

    # if dir already exists
    isDirExists = os.path.exists(final_path)

    if(isDirExists):
        try:
            print("final Directory '% s' already exists!!" % final_path)
            shutil.rmtree(final_path)
            print("Directory '% s' has been removed successfully" % final_path)
        except OSError as error:
            print(error)
            print("Directory '% s' can not be removed" % final_path)
    

    #make a new directory to store all the images of one dicom file
    os.makedirs(final_path)


    # metadata = dicom_to_csv(ds)
    metadata = metadata_extraction.dicom_to_csv(ds)

    # try:
    #     shutil.rmtree('./temp')
    # except OSError as e:
    #     print("Error: %s - %s." % (e.filename, e.strerror))

    if(metadata == ""):
        return jsonify({'success': False, 'error': 'Metadata conversion failed'})
    
    if ds.pixel_array.ndim == 2:
        print("upload dicom image is single frame")
        try:
            converted_image = singleframe_dicom_converter.singleframe_dicom_converter(ds, final_path, new_dir)
            return jsonify({'success': True, 'image': converted_image, 'metadata': metadata})
        except Exception as e:
            print("Exception is :")
            print(e)
            return jsonify({'success': False, 'error': 'Single frame dicom image conversion failed'})
            
    elif ds.pixel_array.ndim == 3:
        print("upload dicom image is multi frame")
        try:
            converted_images = multiframe_dicom_converter.multiframe_dicom_converter(ds, final_path, new_dir)
            return jsonify({'success': True, 'images': converted_images, 'metadata': metadata})
        except Exception as e:
            print("Exception is :")
            print(e)
            return jsonify({'success': False, 'error': 'Multi frame dicom image conversion failed'})
    else:
        return jsonify({'success': False, 'error': 'Invalid DICOM image'})
    
 

@app.route('/download', methods=['GET'])
def download_file():
    print("in download function")
    image_idx = request.args.get('image_idx')
    print("image idx:")
    print(image_idx)
    if image_idx is None:
    # Download the zip file containing all converted images
        print("muliple image idx:")
        print(image_idx)
        return send_file('./temp/converted_images.zip', as_attachment=True)
    else:
        # Download a single frame converted image
        # img_path = f'./temp/{image_idx}.png'
        print("in download final path is : '% s'" % final_path)
        print("in download new dir path is : '% s'" % new_dir)
        img_path = f'{final_path}/{new_dir}_{image_idx}.png'
        print("image path for single image:")
        print(img_path)
        return send_file(img_path, as_attachment=True)

    # return send_file('./converted_images.zip', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

