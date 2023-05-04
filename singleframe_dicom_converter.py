import io
import base64
import numpy as np
from PIL import Image

def singleframe_dicom_converter(dicom_file):
    
    ds = dicom_file
    pixel_array = ds.pixel_array
    
    if pixel_array.ndim == 2: 
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
        
        return im_base64
    