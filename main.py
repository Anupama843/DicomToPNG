import numpy as np
import pydicom
import shutil
import os
from PIL import ImageTk, Image

path = "C:/Users/Shruti/Desktop/Python_handson/dicom_files/MRBRAIN.DCM";
ds = pydicom.dcmread(path)
print(ds)

file_name = os.path.basename(path)
print("filename:" + file_name)

# A dicom file has either single frame or multi frames image. NumberOfFrames attribute is used to check this.
# If dicom file is having multi frame images, each image should be converted to png
if (0x0028, 0x0008) in ds : 
    print("Multi-frame dicom image")
    print("Number of frames : ")
    print(ds.NumberOfFrames)
    arr = ds.pixel_array
    
    #os.path.split is used to split the path into head(directory) and tail(filename)
    parent_dir = os.path.split(path)
    
    #only directory part
    parent_dir = parent_dir[0]
    print("parent directory: " +parent_dir)

    #only file part
    
    #separate file name and ext
    new_dir = os.path.splitext(file_name)[0]
    print("New directory: " + new_dir)

    final_path = os.path.join(parent_dir,new_dir)
    print("final_path: " + final_path)

    #if dir already exists
    isDirExists = os.path.exists(final_path)

    if(isDirExists):
        try:
            print("Directory already exists!!")
            shutil.rmtree(final_path)
            print("Directory '% s' has been removed successfully" % new_dir)
        except OSError as error:
            print(error)
            print("Directory '% s' can not be removed" % new_dir)
    

    #make a new directory to store all the images of one dicom file
    os.mkdir(final_path)

    # Save each image as a separate PNG file
    for i in range(arr.shape[0]):
    # Convert pixel array to Pillow Image
        img = Image.fromarray(arr[i])

    # Save Pillow Image as PNG
        img.save(f'{final_path}/image_{i}.png')
else :
    print("Single-frame dicom image")
    file_extension = os.path.splitext(file_name)[1]
    new_image = ds.pixel_array.astype(float)
    scaled_image = (np.maximum(new_image, 0) / new_image.max()) * 255.0
    scaled_image = np.uint8(scaled_image)
    final_image = Image.fromarray(scaled_image)
    final_image.show()
    png_file = path.replace(file_extension, '.png')
    final_image.save(png_file)

print("..............End...............")