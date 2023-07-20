import pydicom
import shutil
from flask import Flask, request, jsonify, send_file
import os
import metadata_extraction
import singleframe_dicom_converter
import multiframe_dicom_converter
import tempfile
from werkzeug.utils import secure_filename

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_dicom_to_png():
    print("inside flask fetch convert api")
      
    
    if 'file' in request.files : 
        print("in single file upload")
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Uploaded file is empty'})
        
        _, ext = os.path.splitext(file.filename)
        print("extension")
        print(ext)
        if ext.lower() != '.dcm':
            print("inside error handling")
            return jsonify({'success': False, 'error': 'Not a dicom file. Only ".DCM" or ".dcm" dicom image files are supported'})

        return convert_single_dicom_file_to_png(file)
    elif 'files' in request.files:
        print("in folder upload")
        folder = request.files.getlist('files')
        print("folder:")
        print(folder)
        print("os.getcwd")
        print(os.getcwd())
        
        folder_output = []

        print("In folder processing method")
        # converted_folder = os.path.join('converted', os.path.basename(folder))
        # os.makedirs(converted_folder, exist_ok=True)

        for file in folder:
            
            print("accessing each file")
            print(file.__dict__)
            filename = file.filename
            print("filename :")
            print(filename)
            _, ext = os.path.splitext(filename)
            print("extension")
            print(ext)
            subfolder = filename.replace(ext, '')
            subfolder_path = os.path.join('converted', subfolder)
            os.makedirs(subfolder_path, exist_ok=True)
            
            
            converted_files = []
            
            if filename.endswith('.dcm') or filename.endswith('.DCM'):
                
                ds = pydicom.dcmread(file, force=True)
                
                metadata = metadata_extraction.dicom_to_csv(ds)
                
                dicom_frame = ''
                
                converted_images = convert_folder_dicom_file_to_png(ds)
                if ds.pixel_array.ndim == 2:
                    dicom_frame = 'single'
                    
                elif ds.pixel_array.ndim == 3:
                    dicom_frame = 'multi'

                print("length of converted images")
                print(len(converted_images))
                print("converted images")
                # print(converted_images)
                converted_files.append({'images' : converted_images, 'metadata' : metadata, 'dicomframe' : dicom_frame})                     

            else :
                converted_files.append({'images' : '', 'metadata' : '', 'dicomframe' : '', 'error': 'This file is not a dicom file with extension ".dcm/.DCM"'})
              
              # Append the converted file path to the subfolder list
            subfolder_files = {'subfolder': subfolder, 'converted_files': converted_files}
            folder_output.append(subfolder_files)
            
        
        return jsonify({'success': True, 'folder': folder_output})

    elif 'file' not in request.files and 'files' not in request.files:
        return jsonify({'success': False, 'error': 'No file/folder uploaded. Please upload Dicom Image file'})
  
def convert_folder_dicom_file_to_png(dicom_file):
    
    print("folder upload : dicom file:")
    # print(dicom_file)
    filename = dicom_file.filename
    #filename_metadata = os.path.splitext(dicom_file)[0] + '.csv'
    print("filename : " + filename)
    ds = dicom_file
    print("ds ========>>>> in single file converter ")
    
    converted_images = []

    if ds.pixel_array.ndim == 2:
        print("folder : uploaded dicom image is single frame")
        converted_image = singleframe_dicom_converter.singleframe_dicom_converter(ds)
        converted_images.append({
                'original': f'data:image/png;base64,{converted_image}',
                'thumbnail': f'data:image/png;base64,{converted_image}',
                'originalAlt': filename,
                'thumbnailAlt': filename
            })
        # save_path = os.path.join(save_folder, filename)
        # converted_images.append(converted_image)
        return converted_images
            
    elif ds.pixel_array.ndim == 3:
        print("folder : upload dicom image is multi frame")
        
        converted_multiframe_images = multiframe_dicom_converter.multiframe_dicom_converter(ds)
        converted_images.append(converted_multiframe_images)
        
        return converted_images


def convert_single_dicom_file_to_png(dicom_file):
    
    print("Single file upload - dicom file:")
    
    filename = dicom_file.filename
    #filename_metadata = os.path.splitext(dicom_file)[0] + '.csv'
    print("filename : " + filename)
    ds = pydicom.dcmread(dicom_file)
    print("ds ========>>>> ")
    print(ds)

    metadata = metadata_extraction.dicom_to_csv(ds)

    
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
    if 'file' not in request.files and 'files' not in request.files:
        return jsonify({'success': False, 'error': 'No file/folder uploaded. Please upload Dicom Image file'})
    
    
    # Create a directory in a known location to save files to.
    uploads_dir = './uploads'

    os.makedirs(uploads_dir, exist_ok=True)

    if 'file' in request.files :
        uploaded_file = request.files['file']
        if uploaded_file.filename == '':
            return jsonify({'success': False, 'error': 'Uploaded file is empty'})
        save_path = os.path.join(uploads_dir, uploaded_file.filename)
        uploaded_file.save(save_path)
    elif 'files' in request.files :
        uploaded_folder = request.files.getlist('files')
        print("folder save")
        print(uploaded_folder)

        #save each file in the folder
        for file in uploaded_folder:
            print("file in save route:")
            print(file)
            print("filename:")
            print(file.filename)
            file.save(os.path.join(uploads_dir, secure_filename(file.filename)))


    return "File saved successfully."


if __name__ == '__main__':
    app.run(debug=True)
