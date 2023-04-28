# from flask import Flask, render_template, request, redirect, url_for
# import base64

# app = Flask(__name__)

# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route("/convert", methods=['POST'])
# def convert():
#     print("received req=====>>>>")
#     uploaded_file = request.files['file']
#     if uploaded_file.filename != '':
#         uploaded_file.save(uploaded_file.filename)
#     return redirect(url_for('index'))

# import os
# from flask import Flask, flash, request, redirect, url_for
# from werkzeug.utils import secure_filename
# from metadata_extraction import dicom_to_csv

# UPLOAD_FOLDER = './files'
# ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'dcm'}

# app = Flask(__name__)
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# @app.route('/', methods=['GET', 'POST'])
# def upload_file():
#     if request.method == 'POST':
#         # check if the post request has the file part
#         if 'file' not in request.files:
#             flash('No file part')
#             return redirect(request.url)
#         file = request.files['file']
#         # If the user does not select a file, the browser submits an
#         # empty file without a filename.
#         if file.filename == '':
#             flash('No selected file')
#             return redirect(request.url)
#         if file and allowed_file(file.filename):
#             filename = secure_filename(file.filename)
#             saved_file_path = './' + filename
#             file.save(filename)
#             csv_file = dicom_to_csv(filename)
#             flash(csv_file)
#             return {"file": csv_file}
#     return '''
#     <!doctype html>
#     <title>Upload new File 1sss</title>
#     <h1>Upload new File qqqq</h1>
#     <form method=post enctype=multipart/form-data>
#       <input type=file name=file>
#       <input type=submit value=Upload>
#     </form>
#     '''

# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify
import os
import pydicom
from PIL import Image

app = Flask(__name__)

@app.route('/convert', methods=['POST'])
def convert_dicom():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'})

    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type'})

    # Save the DICOM file to a temporary directory
    filename = secure_filename(file.filename)
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(temp_path)

    # Read the DICOM file and convert it to a PNG image
    dicom_file = pydicom.read_file(temp_path)
    img = Image.fromarray(dicom_file.pixel_array)
    png_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.png")
    img.save(png_path)

    # Get the metadata from the DICOM file
    metadata = {
        'Patient Name': str(dicom_file.PatientName),
        'Study Date': str(dicom_file.StudyDate),
        'Modality': str(dicom_file.Modality),
        'Image Dimensions': f"{img.width}x{img.height}"
    }

    # Return the PNG image and its metadata
    return jsonify({'filename': f"{filename}.png", 'metadata': metadata})

if __name__ == '__main__':
    app.run(debug=True)
