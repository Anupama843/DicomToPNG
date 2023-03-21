import pydicom
import csv

# Load the DICOM image
ds = pydicom.dcmread('test1.dcm')

# Create a list of headers for the CSV file
headers = ['Tag', 'Name', 'VR', 'Value']

# Create a list of rows for the CSV file
rows = [[str(elem.tag), elem.name, elem.VR, str(elem.value)] for elem in ds]

# Save the metadata as a CSV file
with open('metadata.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(headers)
    writer.writerows(rows)
