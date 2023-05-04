import io
import base64
import pydicom
import shutil
from PIL import Image
from flask import Flask, jsonify, send_file, request

import numpy as np
import zipfile
import os

def multiframe_dicom_converter(dicom_file, final_path, new_dir):
    
    ds = dicom_file
    filename = dicom_file.filename
    convertedImages = []
    if ds.pixel_array.ndim == 3:
        # Multi-frame image
        print("inside multi-frame dicom image")
    
        converted_zipfile_images = []
        for i, frame in enumerate(ds.pixel_array):
            pixel_array = frame
            if ds.PhotometricInterpretation == "MONOCHROME1" or ds.PhotometricInterpretation == "MONOCHROME2":
                print("Gray scale multi dicom image")
                # Rescale the pixel values to the 0-255 range
                pixel_array = ((pixel_array - np.min(pixel_array)) / (np.max(pixel_array) - np.min(pixel_array))) * 255
                # Convert the pixel array to an 8-bit unsigned integer array
                pixel_array = np.uint8(pixel_array)
                
            # Create a PIL image from the pixel array
            im = Image.fromarray(pixel_array)
            # im = im.convert('RGB')
            im_data = io.BytesIO()
            im.save(im_data, format='PNG')
            
            # for dowloading the converted images
            img_path = os.path.join(final_path, f"{new_dir}_{i}.png")
            im.save(img_path)
            print("in mutliimages image path :")
            print(img_path)
            converted_zipfile_images.append(img_path)

            im_data.seek(0)
            im_base64 = base64.b64encode(im_data.read()).decode('utf-8')
            convertedImages.append({
                'original': f'data:image/png;base64,{im_base64}',
                'thumbnail': f'data:image/png;base64,{im_base64}',
                'originalAlt': filename,
                'thumbnailAlt': filename
            })

        # Create a zip file of all converted PNG images
        with zipfile.ZipFile('./temp/converted_images.zip', 'w') as zip:
            print("writing file to zip")
            for img in converted_zipfile_images:
                print(img)
                zip.write(img)

    return convertedImages
    
