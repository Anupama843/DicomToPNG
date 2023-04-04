import csv
from os import write
import pydicom as dicom
import os

def dicom_to_csv(dicom_file):
    ds = dicom.dcmread(dicom_file)
    filename = os.path.splitext(dicom_file)[0] + '.csv'
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow("Group Elem Description VR Value".split())
        for elem in ds:
            writer.writerow([
                f"{elem.tag.group:04x}", f"{elem.tag.element:04x}",
                elem.description(), elem.VR, str(elem.value)
            ])


listOfFiles = ['./file/test1.dcm', './file/test2.dcm', './file/test3.dcm', './file/test4.dcm', './file/test5.dcm', './file/0002.DCM']
for file in listOfFiles:
    dicom_to_csv(file)

