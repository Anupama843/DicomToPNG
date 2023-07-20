# Dicom File Converter
 This is a simple and user-friendly tool to help us convert DICOM files to PNG images and view metadata information in the dicom image.This application allow us to easily upload the DICOM files and convert them to high-quality PNG images in just one click. We can also view patient's information, details on image and equipment used through metadata part of the dicom image. With this DICOM to PNG image converter, we can quickly and easily convert medical images into a format that is more accessible and compatible with a wider range of devices and applications.

## Setup
### React App
To start react server please run following commands
```
cd ~/DicomToPNG/client
npm start
```

### Python Service 
To install and start Python Service, please run following commands
```
cd ~/DicomToPNG
source venv/bin/activate  //now you should see (venv) before $ in the shell that mean you env is active
pip install -r requirements.txt  //to install all the libraries on which the project is dependent
python3 server.py
```