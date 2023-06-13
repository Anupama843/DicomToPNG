import React, { useState, useEffect } from 'react';
import './stylesheets/App.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import CsvPreview from './components/CsvPreview';
import ImageGalleryModal from './components/ImageGalleryModal';
import JSZip, { files } from 'jszip';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';


function App() {
  const [dicomFile, setDicomFile] = useState(null);
  const [dicomFolder, setDicomFolder] = useState(null);
  const [isConversionRequest, setIsConversionRequest] = useState(false);
  const [multiplePngImages, setMultiplePngImages] = useState(null);
  const [singlePngImage, setSinglePngImage] = useState(null);
  const [error, setError] = useState(null);
  const [csvMetaData, setCsvMetaData] = useState(null);
  const [isConvertInProgress, setIsConvertInProgress] = useState(false);
  const [isFolderUpload, setIsFolderUpload] = useState(false);
  const [subfolders, setSubfolders] = useState([]);
  const [selectedSubfolder, setSelectedSubfolder] = useState('');
  const [selectedSubfolderImages, setSelectedSubfolderImages] = useState(null);
  const [selectedSubfolderDicomFrame, setSelectedSubfolderDicomFrame] = useState('');
  const [dicomFilename, setDicomFilename] = useState('');
  const [showContactInformation, setShowContactInformation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      alert('Please upload the file again.');
      setTimeout(() => {
        window.location.reload();
      },895000); // Refresh after 5 seconds of showing the message
    }, 900000); // Refresh every 15 minutes (15 * 60 * 1000 milliseconds)

    return () => clearTimeout(timer);
  }, []);

  const initialize = () => {
    setSinglePngImage(null);
    setMultiplePngImages(null);
    setCsvMetaData(null);
    setSubfolders('');
    setSelectedSubfolder('');
    setSelectedSubfolderImages(null);
    setSelectedSubfolderDicomFrame('');  
    setShowContactInformation(false);  
  };

  const subFolderData = (subfolders, selected_subfolder) =>{
    console.log("in sub folder data function");
    const selectedData = subfolders.find((subfolder) => subfolder.subfolder === selected_subfolder);

    console.log("selected subfolder data:")
    console.log(selectedData)
    

    // Extract the images and metadata for the selected subfolder
    const images = selectedData ? selectedData.converted_files.map((file) => file.images) : [];
    const metadataArray= selectedData ? selectedData.converted_files.map((file) => file.metadata) : null;
    const dicomFrame = selectedData ? selectedData.converted_files.map((file) => file.dicomframe) : '';
    const dicomFileError = selectedData ? selectedData.converted_files.map((file) => file.error) : '';

    const singleDicomFileError = dicomFileError[0];

    //if any error while converting individual dicom file to png
    if(singleDicomFileError){
      setError(dicomFileError);
    }else{
      setError(null);
    }

    const filename = selectedData ? selectedData.subfolder : '';
    
    setDicomFilename(filename);

    setSelectedSubfolderImages(images);

    const metadata = metadataArray.length > 0 ? metadataArray[0] : null;

    setCsvMetaData(atob(metadata));
    setSelectedSubfolderDicomFrame(dicomFrame);

  };

  const handleFileChange = (e) => {
    
    if(!isFolderUpload){
      setDicomFile(e.target.files[0]);
      setDicomFilename(e.target.files[0].name);
    }else{
      // setDicomFolder(Array.from(e.target.files));
      console.log("folder")
      console.log(e.target.files)
      setDicomFolder(e.target.files);
    }
    
    setError(null)
    setIsConversionRequest(false);
    initialize();
  };

  const handleUploadOptionChange = (e) => {
    setIsFolderUpload(e.target.value === 'folder');
    initialize();
  };

  const handleSubfolderChange = (event) => {
    console.log("in selected subfolder handle")
    const selectedSubfolderName = event.target.value;
    setSelectedSubfolder(event.target.value);    

    if(subfolders.length > 0){
      subFolderData(subfolders, selectedSubfolderName )
    }
    
  };

  const handleConvert = async () => {
    console.log("in convert method");
    setIsConversionRequest(true);
    const formData = new FormData();
    if(!isFolderUpload){
      formData.append('file', dicomFile);
    }else{
      console.log("folder data");
      console.log(dicomFolder);
      for (const file of dicomFolder) {
        formData.append('files', file, file.name)
      }
    }

    setIsConvertInProgress(true);
    setError(null);
    initialize();

    // alert window asking user whether to allow the system to save the dicom file 
    const shouldSave = window.confirm('Do you want to save the file locally?');
    if (shouldSave) {
      console.log("Fetching save file")
      fetch('/saveFile', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.text())
        .then(text => console.log(text))
        .catch(error => console.error(error));
    }

    console.log("printing form data before calling convert");
    console.log(formData)

    const response = await fetch('/convert', {
      method: 'POST',
      body: formData
    });
    console.log("fetch called");
    const data = await response.json();
    console.log("data:");
    console.log(data);
    setIsConvertInProgress(false)
    
    if (data.success) {
      let folder_data = null;
      let subfolder_data = null;
      console.log("data success");
      if(isFolderUpload){
        console.log("folder upload result");
        folder_data = data.folder;
        console.log("folder data :");
        console.log(folder_data);
        setSubfolders(folder_data);
        subfolder_data = folder_data && folder_data.length > 0 ? folder_data[0].subfolder : null; 
        setSelectedSubfolder(subfolder_data );
        
        console.log("calling subfolder data function");

        if(folder_data && subfolder_data){
          subFolderData(folder_data,subfolder_data);
        }
        
      }
      if (!isFolderUpload && data.image) {
        setSinglePngImage(`data:image/png;base64,${data.image}`);
        // setSinglePngImage(data.image);
        setMultiplePngImages(null);
        setSubfolders('');
      } else if (!isFolderUpload && data.images) {
        setSinglePngImage(null);
        setMultiplePngImages(data.images);
        setSubfolders('');
      }
      
      setCsvMetaData(atob(data.metadata))
      setError(null);
    } else {
      console.log("Encountered error")
      console.log(data.error);
      setIsConversionRequest(false);
      setError(data.error);
      initialize();
    }
  };

  const imageURL = 'data:image/png;base64' + singlePngImage;
  const converted_png_image = [{
    original: imageURL,
    thumbnail: imageURL,
  }]

  

  function saveAs(data, filename) {
    var link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", filename);
    
    link.style.display = "none";
      document.body.appendChild(link);

      // Click download link
      link.click(); 

      // Remove download link from DOM
      document.body.removeChild(link);
  }

  const convertFileExtension = (filename, extension) => {
    // Save file name as the uploaded file name
    let fileName = filename.toUpperCase()
    console.log(fileName)
    console.log("---->")
    let result = fileName.replace('.DCM',`${extension}`);
    return result
  }

  const handleDownload = (image_index, downloadImage) => {
    // Create download link
    console.log("in png download function")
    console.log(image_index)
    try {
      if (image_index === 0 ){
        if(singlePngImage) {
        let fileName = convertFileExtension(dicomFile.name, ".png")
        saveAs(singlePngImage, fileName);
        return;
      }
    }

      var zip = new JSZip();
      let fileName = '';
      let images = [];
      if(isFolderUpload){
        console.log("in folder upload : download");
        fileName = dicomFilename;
        console.log(fileName);
        images = downloadImage;
        
      }else{
        console.log("single filr")
        fileName = convertFileExtension(dicomFile.name, "")
        images = multiplePngImages;
      }
      console.log("images");
      console.log(images);
      // see FileSaver.js
      
      images.map((image, index) => {
        console.log("in map loop")
        console.log(image);
            zip.file(fileName + "_" + index + '.png', image.original.replace('data:image/png;base64,', ""), {base64: true})
      })

      zip.generateAsync({type:"base64"}).then(function(content){
        // let filename = convertFileExtension(fileName, ".zip");
        let filename = fileName + '.zip';
        saveAs('data:application/zip;base64,' + content, filename);
      });
    } catch (error){
      console.log(error)
      setError("Error downloading image(s). Please try again.");
    }

    
  };

  const downloadMetaData = (filename) => {
    // Create download link
    console.log("in metadata download function")
      
    let fileName = convertFileExtension(filename, ".csv")
    saveAs('data:text/csv;charset=utf-8,' + encodeURIComponent(csvMetaData), fileName);
  }

  const handleContactInformation = () => {
    console.log(" in handle contact information");
    initialize();
    setShowContactInformation(true);
    setIsConversionRequest(false);
    setIsConvertInProgress(false);
  };

  return (
    <div className='dicomImageConverterApp'>
      <div className='appHeader'>
        <h1>DICOM to PNG Converter</h1>
        <div className='dicomFileHandlingSection'>
          <div className='dicomFileOrFolderUploadSection'>
            <div className='fileOrFolderUploadOptionSection'>
              <label>
                <input type="radio" name="uploadOption" value="single" checked={!isFolderUpload} onChange={handleUploadOptionChange}/>
                  Single File
              </label>
              <label>
                <input type="radio" name="uploadOption" value="folder" checked={isFolderUpload} onChange={handleUploadOptionChange}/>
                  Folder
              </label>
            </div>
            <div className='fileOrFolderSection'>
              <div className='uploadFileOrFolderSection'>
                {!isFolderUpload && <input type="file" onChange={handleFileChange} />}
                {isFolderUpload && <input type="file" webkitdirectory = "" onChange={handleFileChange} />}
                <button id="convertButton" onClick={handleConvert}>Convert</button>
              </div>
              <div className='folderDropDownSection'>
                {isFolderUpload && subfolders && <div className='subFolderSection'>
                  <select value={selectedSubfolder} onChange={handleSubfolderChange}>
              
                  {subfolders && subfolders.map((subfolder) => (
                    <option key={subfolder.subfolder} value={subfolder.subfolder}>
                      {subfolder.subfolder}
                    </option>
                  ))}
                  </select>
                </div>}
              </div>
            </div>
            
          </div>
        
        </div>
        <div>
          <a href="#contactInformation" onClick={handleContactInformation}>Contact</a>
        </div>
      </div>
      {error &&
        <div className='errorMessageSection'>
          <h4>{error}</h4>
        </div>
      }
      {/* Home page before requesting convert action */}
      {!isConversionRequest && !showContactInformation &&
        <div className='aboutSection'>
          <AboutPage/>
        </div>
      }
      {isConvertInProgress && <span class="loader"><span class="loader-inner"></span></span>}
      {!isConvertInProgress && isConversionRequest && !error &&
        <div className='dicomFileDetails'>
          {isFolderUpload && selectedSubfolder && <>
            {selectedSubfolderDicomFrame == 'single' && selectedSubfolderImages.map((image,index) => (
              <>
                <div className='convertedImageSection'>
                  <h2> Converted PNG Image </h2>
                  <ImageGalleryModal images = {image}/>
                  <button id="downloadMultiImagesButton" onClick={() => handleDownload(0, image)}>Download</button>
                </div>
                <div className='dicomMetadataSection'>
                  {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadMetaDataButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                    </div>
                  }
                </div>
              </>
            ))}
            {selectedSubfolderDicomFrame == 'multi' && selectedSubfolderImages.map((images,index) => (
              <>
                {images.map((singleImage,subIndex) => (
                  <div className='convertedImageSection'>
                    <h2> Converted PNG Image </h2>
                    <ImageGalleryModal images = {singleImage}/>
                    <button id="downloadMultiImagesButton" onClick={() => handleDownload(0, singleImage)}>Download</button>
                  </div>
                ))}
                {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadMetaDataButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                  </div>
                }

              </>
            ))}
            </>}
            {multiplePngImages && (
            <>
            <div className='convertedImageSection'>
              
              <h2> Converted PNG Image </h2>
              <ImageGalleryModal images = {multiplePngImages}/>
              <button id="downloadMultiImagesButton" onClick={() => handleDownload()}>Download</button>
            </div>
            <div className='dicomMetadataSection'>
              {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadMetaDataButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                  </div>
              }
            </div>
            </>
            )}
            {singlePngImage && (
              <>
              <div className='convertedImageSection'>
                <h2> Converted PNG Image </h2>
                <ImageGalleryModal images = {converted_png_image}/>
                <button id="downloadSingleImageButton" onClick={() => handleDownload(0)}>Download</button>
              </div>
              <div className='dicomMetadataSection'>
                {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadMetaDataButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                  </div>
                } 
              </div>
              </>
              )}
        </div>}
        {showContactInformation && <div id="contactInformation">
          <ContactPage/>
        </div>
        }
    </div>
  );
}

export default App;