import React, { useState } from 'react';
import './App.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import ImageGallery from 'react-image-gallery';
import CsvPreview from './CsvPreview'
import JSZip from 'jszip'
function App() {
  const [dicomFile, setDicomFile] = useState(null);
  const [isConversionRequest, setIsConversionRequest] = useState(false);
  const [multiplePngImages, setMultiplePngImages] = useState(null);
  const [singlePngImage, setSinglePngImage] = useState(null);
  const [error, setError] = useState(null);
  const [csvMetaData, setCsvMetaData] = useState(null);
  const [isConvertInProgress, setIsConvertInProgress] = useState(false);


  const handleFileChange = (e) => {
    setDicomFile(e.target.files[0]);
    setError(null)
    setMultiplePngImages(null)
    setSinglePngImage(null)
    setCsvMetaData(null)
    setIsConversionRequest(false);
  };

  const handleConvert = async () => {
    console.log("in convert method");
    setIsConversionRequest(true);
    const formData = new FormData();
    formData.append('file', dicomFile);

    setIsConvertInProgress(true)
    setError(null)
    setMultiplePngImages(null)
    setSinglePngImage(null)
    setCsvMetaData(null)

    const response = await fetch('/convert', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log("data:");
    console.log(data);
    setIsConvertInProgress(false)
    if (data.success) {
      if (data.image) {
        setSinglePngImage(`data:image/png;base64,${data.image}`);
        // setSinglePngImage(data.image);
        setMultiplePngImages(null);
      } else if (data.images) {
        setSinglePngImage(null);
        setMultiplePngImages(data.images);
      }
      setCsvMetaData(atob(data.metadata))
      setError(null);
    } else {
      console.log("Encountered error")
      console.log(data.error);
      setMultiplePngImages(null);
      setSinglePngImage(null);
      setCsvMetaData(null);
      setIsConversionRequest(false);
      setError(data.error);
    }
  };

  const imageURL = 'data:image/png;base64' + singlePngImage;
  const converted_png_image = [{
    original: imageURL,
    thumbnail: imageURL,
  }]

  function saveAs(data, filename, type) {
    var link = document.createElement("a");
    link.setAttribute("href", type + data);
    link.setAttribute("download", filename);
    
    link.style.display = "none";
      document.body.appendChild(link);

      // Click download link
      link.click();

      // Remove download link from DOM
      document.body.removeChild(link);
  }

  const handleDownload = (image_index) => {
    // Create download link
    console.log("in png download function")
    try {
      if (image_index == 0 && singlePngImage) {
        saveAs(singlePngImage, "image.png", '');
        return;
      }

      var zip = new JSZip();
      // see FileSaver.js

      multiplePngImages.map((image, index) => {
            zip.file(image.originalAlt + index + '.png', image.original.replace('data:image/png;base64,', ""), {base64: true})
      })

      zip.generateAsync({type:"base64"}).then(function(content) {
        saveAs(content, "converted_images.zip", 'data:application/zip;base64,');
      });
    } catch (error){
      console.log(error)
      setError("Error downloading image(s). Please try again.");
    }

    
  };

  const downloadMetaData = () => {
    // Create download link
    console.log("in metadata download function")
    saveAs(encodeURIComponent(csvMetaData), "metadata.csv", 'data:text/csv;charset=utf-8,');
  }


  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header =>
      header
        .toLowerCase()
        .replace(/\W/g, '_')
  }

  return (
    <div className='dicomImageConverterApp'>
      <div className='appHeader'>
        <h1>DICOM to PNG Converter</h1>
        <div className='imageUploadSection'>
          <input type="file" onChange={handleFileChange} />
          <button id="convertButton" onClick={handleConvert}>Convert</button>
          {/* {error && <p>{error}</p>} */}
        </div>
      </div>
      {error &&
        <div className='errorMessageSection'>
          <h4>{error}</h4>
        </div>
      }
      {/* Home page before requesting convert action */}
      {!isConversionRequest && 
        <div className='aboutSection'>
          <h3>Online Dicom to PNG Image Converter</h3>
          <p>Welcome to our DICOM to PNG image converter website!</p>

          <p>We understand that medical images are an important aspect of healthcare, but working with them can be a challenge. That's why we've created a simple and user-friendly tool to help you convert DICOM files to PNG images and view metadata information in the dicom image.</p>

          <p>Our website allows you to easily upload your DICOM files and convert them to high-quality PNG images in just one click. You can also view patient's information, details on image and equipment used through metadata part of the dicom image.</p>

          <p>With our DICOM to PNG image converter, you can quickly and easily convert medical images into a format that is more accessible and compatible with a wider range of devices and applications.</p>

          <p>Thank you for choosing our DICOM to PNG image converter website. We hope that our tool will make your work with medical images easier and more efficient.</p>
          
        </div>}
      {}
      {isConvertInProgress && <span>Converting...</span>}
      {!isConvertInProgress && isConversionRequest && 
        <div className='dicomFileDetails'>
            {multiplePngImages && (<div className='convertedImageSection'>
              <h2> Converted PNG Image </h2>
              
              <ImageGallery
                items={multiplePngImages}
                showFullscreenButton={true}
                showPlayButton={true}
                showThumbnails={true} />
              
              
              <button id="downloadMultiImagesButton" onClick={() => handleDownload()}>Download</button>
              
            </div>
            )}
            {singlePngImage && (
              <div className='convertedImageSection'>
                <h2> Converted PNG Image </h2>
                <ImageGallery
                  items={converted_png_image}
                  showFullscreenButton={true}
                  showPlayButton={false}
                  showThumbnails={true} />
                
                  <button id="downloadSingleImageButton" onClick={() => handleDownload(0)}>Download</button>
                
              </div>)}
          
          <div className='dicomMetadataSection'>
            {csvMetaData
              && <CsvPreview metadata={csvMetaData} />}
            {csvMetaData && (
              <div className='downloadButtonsSection'>
                <button id="downloadMetaDataButton" onClick={() => downloadMetaData()}>Download</button>
              </div>
            )}
          </div>
        </div>}

    </div>
  );
}

export default App;
