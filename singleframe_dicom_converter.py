import io
import base64
import pydicom
import numpy as np
from PIL import Image

import os

def singleframe_dicom_converter(dicom_file, final_path, new_dir):
    
    ds = dicom_file
    filename = dicom_file.filename
    pixel_array = ds.pixel_array
    print("final_path: " + final_path)
    print("new dir:" + new_dir)

    if pixel_array.ndim == 2:
        convertedImage = []
        if ds.PhotometricInterpretation == "MONOCHROME1" or ds.PhotometricInterpretation == "MONOCHROME2":
            print("Gray scale single dicom image")
            # Rescale the pixel values to the 0-255 range
            pixel_array = ((pixel_array - np.min(pixel_array)) / (np.max(pixel_array) - np.min(pixel_array))) * 255
            # Convert the pixel array to an 8-bit unsigned integer array
            pixel_array = np.uint8(pixel_array)
        
        # Create a PIL image from the pixel array
        im = Image.fromarray(pixel_array)
        im_data = io.BytesIO()
        im.save(im_data, format='PNG')
        im_data.seek(0)
        im_base64 = base64.b64encode(im_data.read()).decode('utf-8')
        im.show()

        # for dowloading the converted images
        img_path = os.path.join(final_path, f"{new_dir}_0.png")
        im.save(img_path)
        print("single image saved in :" , img_path)

        convertedImage.append({
                'original': f'data:image/png;base64,{im_base64}',
                'thumbnail': f'data:image/png;base64,{im_base64}',
                'originalAlt': filename,
                'thumbnailAlt': filename
        })

        return convertedImage
    