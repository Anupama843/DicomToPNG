import tkinter as tk

from tkinter import filedialog
from tkinter import messagebox
from PIL import Image
import pydicom
import numpy as np

def select_file():
    global file_path
    file_path = filedialog.askopenfilename(filetypes=[("dicom_files", "*.DCM")])
    print(file_path)
    messagebox.showinfo("Success", "Dicom file uploaded successfully.")
    return file_path

def convert_to_png(file_path):
    ds = pydicom.dcmread(file_path)
    pixel_array = ds.pixel_array.astype(float)
    rescaled_image = (np.maximum(pixel_array,0)/pixel_array.max())*255
    final_image = np.uint8(rescaled_image)
    final_image = Image.fromarray(final_image, 'RGB')
    final_image.show()

    png_file = file_path.replace('.DCM', '.png')
    final_image.save(png_file)
    messagebox.showinfo("Success", "File converted to PNG successfully.")

root = tk.Tk()
root.title("DICOM to PNG Converter")
root.geometry("500x500")

select_file_button = tk.Button(text="Select DICOM file", command=select_file)
select_file_button.pack(padx=150, pady=80)

convert_button = tk.Button(text="Convert to PNG", command=lambda: convert_to_png(file_path))
convert_button.pack(padx=20)

root.mainloop()
