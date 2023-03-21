import pydicom

# Load the DICOM file
dcm = pydicom.dcmread("0002.DCM")
dcm1 = pydicom.dcmread("test1.dcm")
dcm2 = pydicom.dcmread("test2.dcm")
dcm3 = pydicom.dcmread("BRAINIX_DICOM_FLAIR_IM-0001-0002.dcm")
dcm4 = pydicom.dcmread("test3.dcm")

# Extract the patient name
patient_name = dcm.PatientName
patient_name1 = dcm1.PatientName
patient_name2 = dcm2.PatientName
patient_name3 = dcm3.PatientName
patient_name4 = dcm4.PatientName

# Extract the patient ID
patient_id = dcm.PatientID
patient_id1 = dcm1.PatientID
patient_id2 = dcm2.PatientID
patient_id3 = dcm3.PatientID
patient_id4 = dcm4.PatientID

# Extract the imaging modality
imaging_modality = dcm.Modality
imaging_modality1 = dcm1.Modality
imaging_modality2 = dcm2.Modality
imaging_modality3 = dcm3.Modality
imaging_modality4 = dcm4.Modality

# Extract the imaging date
imaging_date = dcm.StudyDate
imaging_date1 = dcm1.StudyDate
imaging_date2 = dcm2.StudyDate
imaging_date3 = dcm3.StudyDate
imaging_date4 = dcm4.StudyDate


# Extract the imaging time
imaging_time = dcm.StudyTime
imaging_time1 = dcm1.StudyTime
imaging_time2 = dcm2.StudyTime
imaging_time3 = dcm3.StudyTime
imaging_time4 = dcm4.StudyTime

data = [(patient_name, patient_id, imaging_modality, imaging_date, imaging_time),
        (patient_name1, patient_id1, imaging_modality1, imaging_date1, imaging_time1),
        (patient_name2, patient_id2, imaging_modality2, imaging_date2, imaging_time2),
        (patient_name3, patient_id3, imaging_modality3, imaging_date3, imaging_time3),
        (patient_name4, patient_id4, imaging_modality4, imaging_date4, imaging_time4),
        ]



# print table header
# print("{:<10} {:<10} {:<10}".format("Patient Name", "Patient ID", "Imaging Modality",
#                                     "Imaging Date", "Imaging Time"))

# print table rows
# for row in data:
#     patient_name, patient_id, imaging_modality, imaging_date, imaging_time = row
#     print("{:<10} {:<10} {:<10} {:<10} {:<10}".format(patient_name, patient_id, imaging_modality, imaging_date, imaging_time))


# Print the extracted metadata information
print("Patient Name:", patient_name)
print("Patient ID:", patient_id)
print("Imaging Modality:", imaging_modality)
print("Imaging Date:", imaging_date)
print("Imaging Time:", imaging_time)
print("****************************")
print("Patient Name:", patient_name1)
print("Patient ID:", patient_id1)
print("Imaging Modality:", imaging_modality1)
print("Imaging Date:", imaging_date1)
print("Imaging Time:", imaging_time1)
print("****************************")
print("Patient Name:", patient_name2)
print("Patient ID:", patient_id2)
print("Imaging Modality:", imaging_modality2)
print("Imaging Date:", imaging_date2)
print("Imaging Time:", imaging_time2)
print("****************************")
print("Patient Name:", patient_name3)
print("Patient ID:", patient_id3)
print("Imaging Modality:", imaging_modality3)
print("Imaging Date:", imaging_date3)
print("Imaging Time:", imaging_time3)
print("****************************")
print("Patient Name:", patient_name4)
print("Patient ID:", patient_id4)
print("Imaging Modality:", imaging_modality4)
print("Imaging Date:", imaging_date4)
print("Imaging Time:", imaging_time4)
