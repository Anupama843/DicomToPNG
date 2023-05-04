import csv
from os import write
import pydicom as dicom
import os
import base64

def get_dicom_Data(dicom_file):
    return dicom.dcmread(dicom_file) 

def dicom_to_csv(dicom_file):
    print("dicom_file ====>>>> ")
    
    ds = dicom_file #get_dicom_Data(dicom_file)
     
    converted_file = './temp/converted_file.csv'
    csv_data = dicom_data_to_csv_data(ds, converted_file)

    if os.path.isfile(converted_file):
        os.remove(converted_file)
    
    return csv_data

def dicom_data_to_csv_data(ds, filename):
    try:
        with open(filename, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow("Group Elem Description VR Value".split())
            for elem in ds:
                writer.writerow([
                    f"{elem.tag.group:04x}", f"{elem.tag.element:04x}",
                    elem.description(), elem.VR, str(elem.value)
                ])
        with open(filename, 'rb') as csvfile:        
            binary_file_data = csvfile.read()
            base64_encoded_data = base64.b64encode(binary_file_data)
            base64_message = base64_encoded_data.decode('utf-8')
        return base64_message
    except Exception as e :
        print("Metadata extraction exception occurred")
        print(e)
        return ""


# listOfFiles = ['./file/test1.dcm', './file/test2.dcm', './file/test3.dcm', './file/test4.dcm', './file/test5.dcm', './file/0002.DCM']
# for file in listOfFiles:
# print("dicom_to_csv =====>>>> ")
# print(dicom_to_csv('./0002.DCM'))
