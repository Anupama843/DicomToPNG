import pydicom

# Load the DICOM file
dcm = pydicom.dcmread("0002.DCM")

# Extract the patient name
patient_name = dcm.PatientName

# Extract the patient ID
patient_id = dcm.PatientID

# Extract the imaging modality
imaging_modality = dcm.Modality

# Extract the imaging date
imaging_date = dcm.StudyDate

# Extract the imaging time
imaging_time = dcm.StudyTime

# Print the extracted metadata information
print("Patient Name:", patient_name)
print("Patient ID:", patient_id)
print("Imaging Modality:", imaging_modality)
print("Imaging Date:", imaging_date)
print("Imaging Time:", imaging_time)
