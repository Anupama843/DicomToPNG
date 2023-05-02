import React, { useState } from 'react';
import './App.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import CSVReader from 'react-csv-reader'
import ImageGallery from 'react-image-gallery';
import FileViewer from 'react-file-viewer';
import CsvPreview from './CsvPreview'

function App() {
  const [dicomFile, setDicomFile] = useState(null);
  const [multiplePngImages, setMultiplePngImages] = useState(null);
  const [singlePngImage, setSinglePngImage] = useState(null);
  const [error, setError] = useState(null);
  const [csvMetaData, setCsvMetaData] = useState(null);

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

    const data = await response.json();
    console.log("data:");
    console.log(data);

    if (data.success) {
      console.log("data.metadata =>>>>> ");
      console.log(data.metadata);
      if (data.image) {
        setSinglePngImage(`data:image/png;base64,${data.image}`);
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

  const papaparseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    transformHeader: header =>
      header
        .toLowerCase()
        .replace(/\W/g, '_')
  }
  const file = 'http://example.com/image.png'
  const type = 'CSV'

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
      <div className='dicomFileDetails'>
        <div className='convertedImageSection'>

          {/* {pngImage && <img src={pngImage} alt="Converted PNG image" />} */}
          {/* {pngImage && <ImageSlider folderLink={pngImage}/>} */}

          {multiplePngImages && <ImageGallery items={multiplePngImages} />}
          {singlePngImage && <img src={singlePngImage} alt="Converted PNG image" />}
        </div>
        <div className='dicomMetadataSection'>
          {csvMetaData
            && <CsvPreview metadata={csvMetaData}/>}
        </div>
        {csvMetaData && (
          <a
            href={`data:text/csv;charset=utf-8,${escape(csvMetaData)}`}
            download="metadata.csv"
          >
            download
          </a>
        )}
      </div>

    </div>
  );
}

export default App;
