import React, { useState } from 'react';
import './App.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import CSVReader from 'react-csv-reader'
import ImageGallery from 'react-image-gallery';
import CsvPreview from './CsvPreview'

function App() {
  const [dicomFile, setDicomFile] = useState(null);
  const [multiplePngImages, setMultiplePngImages] = useState(null);
  const [singlePngImage, setSinglePngImage] = useState(null);
  const [error, setError] = useState(null);
  const [csvMetaData, setCsvMetaData] = useState(null);
  const [isConvertInProgress, setIsConvertInProgress] = useState(false);


  const handleFileChange = (e) => {
    setDicomFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    console.log("in convert method");
    const formData = new FormData();
    formData.append('file', dicomFile);

    const response = await fetch('/convert', {
      method: 'POST',
      body: formData
    });
    setIsConvertInProgress(true)
    const data = await response.json();
    console.log("data:");
    console.log(data);
    setIsConvertInProgress(false)
    if (data.success) {
      console.log("data.metadata =>>>>> ");
      console.log(data.metadata);
      if (data.image) {
        // setSinglePngImage(`data:image/png;base64,${data.image}`);
        setSinglePngImage(data.image);
        setMultiplePngImages(null);
        console.log("single image");
        console.log(data.image);
      } else if (data.images) {
        setSinglePngImage(null);
        setMultiplePngImages(data.images);
      }
      setCsvMetaData(atob(data.metadata))
      setError(null);
    } else {
      setMultiplePngImages(null);
      setSinglePngImage(null);
      setError(data.message);
    }
  };

  const handleDownload = (image_index) => {
    let url = "/download";
    console.log("download button clicked")
    if (image_index !== undefined) {
      console.log("single frame")
      url += `?image_idx=${image_index}`;
    }
    fetch(url, {
      method: "GET",
    })
      .then((response) => {
        console.log("in download react response");
        console.log(response);
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        console.log("url:");
        console.log(url);
        const link = document.createElement("a");

        if (image_index !== undefined) {
          link.setAttribute("download", "converted_image.png");
        } else {
          link.setAttribute("download", "converted_images.zip");
        }

        link.href = url;
        // link.setAttribute("download", "converted_images.zip");
        document.body.appendChild(link);
        link.click();
      });
  };

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
          <button onClick={handleConvert}>Convert</button>
          {error && <p>{error}</p>}
        </div>
      </div>
      {isConvertInProgress && <span>Converting...</span>}
      {!isConvertInProgress &&
        <div className='dicomFileDetails'>
          <div className='convertedImageSection'>

            {/* {pngImage && <img src={pngImage} alt="Converted PNG image" />} */}
            {/* {pngImage && <ImageSlider folderLink={pngImage}/>} */}
            {multiplePngImages && (<div>
              <h2> Converted PNG Image </h2>
              <ImageGallery
                items={multiplePngImages}
                showFullscreenButton={true}
                showPlayButton={true}
                showThumbnails={true} />
              <button onClick={() => handleDownload()}>Download</button></div>
            )}
            {singlePngImage && (
              <div>
                <h2> Converted PNG Image </h2>
                <ImageGallery
                  items={singlePngImage}
                  showFullscreenButton={true}
                  showPlayButton={false}
                  showThumbnails={true} />
                <button onClick={() => handleDownload(0)}>Download</button>
              </div>)}
          </div>
          <div className='dicomMetadataSection'>
            {csvMetaData
              && <CsvPreview metadata={csvMetaData} />}
            {csvMetaData && (
              <a
                href={`data:text/csv;charset=utf-8,${escape(csvMetaData)}`}
                download="metadata.csv"
              >
                download
              </a>
            )}
          </div>
        </div>}

    </div>
  );
}

export default App;
