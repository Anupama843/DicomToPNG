import React, { useState, useEffect } from 'react';
import './stylesheets/App.css';
import 'react-image-gallery/styles/css/image-gallery.css';
import CsvPreview from './components/CsvPreview';
import ImageGalleryModal from './components/ImageGalleryModal';
import JSZip, { files } from 'jszip';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import Logo from './Logo/logo_4.png';


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
  const [startTimer, setStartTimer] = useState(false);
  let fifteenMinutesTimeout =15 * 60 * 1000
  let fifteenSecTimeout = 45 * 1000

  useEffect(() => {
    if (startTimer) {
      const timer = setTimeout(() => {
        alert('Please download the file, page will be refreshed in 15 second.');
        setTimeout(() => {
          setStartTimer(false)
          window.location.reload();
        },fifteenMinutesTimeout - fifteenSecTimeout); // Refresh after 15 seconds of showing the message
      }, fifteenMinutesTimeout); // Refresh every 15 minutes (15 * 60 * 1000 milliseconds)
      return () => clearTimeout(timer);  
    }
  }, [startTimer]);

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
    
    if(!isFolderUpload && e.target.files.length > 0){
      console.log("single file upload option selected");
      setDicomFile(e.target.files[0]);
      setDicomFilename(e.target.files[0].name);
      setError(null);
    }else if(isFolderUpload && e.target.files.length > 0){
      // setDicomFolder(Array.from(e.target.files));
      console.log("Folder upload option selected")
      setDicomFolder(e.target.files);
      setError(null);
    }else{
      setError("No file/folder uploaded. Please upload Dicom Image file");
      setDicomFile(null);
      setDicomFolder(null);
    }
    
    setIsConversionRequest(false);
    initialize();
  };

  const handleUploadOptionChange = (e) => {
    setIsFolderUpload(e.target.value === 'folder');
    setIsConversionRequest(false);
    setDicomFile(null);
    setDicomFolder(null);
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
    if(error || (isFolderUpload && !dicomFolder) || (!isFolderUpload && !dicomFile)){
      console.log("Encountered error before converting")
      console.log(error);
      let errorMessage = error == null ? "No file/folder uploaded. Please upload Dicom Image file" : error;
      setError(errorMessage);
      initialize();
      setIsConversionRequest(false);

    }else{
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
      setStartTimer(true)

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

  const handleDownloadFolder = () => {
    const zip = new JSZip();
    
    // Create subfolder for images and metadata
    
    if(subfolders.length > 0){
      subfolders.map((subfolder) => {

        console.log("inside subfolder loop");
        
        const filename = subfolder.subfolder;
        
        const sub_folder = zip.folder(subfolder.subfolder);
        const image_folder = sub_folder.folder('images');

        const errorMessage = subfolder.converted_files.map((file) => file.error) ? subfolder.converted_files.map((file) => file.error) : '';
          
        if(errorMessage[0] === undefined){
          // Save images to subfolder
          const dicomFrame = subfolder.converted_files.map((file) => file.dicomframe) ? subfolder.converted_files.map((file) => file.dicomframe) : '';

          const imageArray = subfolder.converted_files.map((file) => file.images) ? subfolder.converted_files.map((file) => file.images) : [];

          console.log("dicom frame : " + dicomFrame);
          
          if(dicomFrame == 'single'){
            console.log('inside single subfolder loop');
            imageArray.map((images,ind) => {
              images.forEach((image, index) => {
                const filename = subfolder.subfolder;
                image_folder.file(`${filename}_${index}.png`, image.original.replace('data:image/png;base64,', ''), { base64: true });
              });
            });
          }else if (dicomFrame == 'multi'){
            console.log('inside multi subfolder loop');
            imageArray.map((multiImages,index1) => {
              multiImages.map((images, index2) => {
                images.forEach((image, index) => {
                  const filename = subfolder.subfolder;
                  image_folder.file(`${filename}_${index}.png`, image.original.replace('data:image/png;base64,', ''), { base64: true });
                });
              });
            });
          }
          

          const metadataArray = subfolder.converted_files.map((file) => file.metadata) ? subfolder.converted_files.map((file) => file.metadata) : null;

          const metadata = metadataArray.length > 0 ? atob(metadataArray[0]) : null;

          //Save metadata in the subfolder
          sub_folder.file('metadata.csv', metadata);
        }
          
      });

      // Generate the zip file
      zip.generateAsync({ type: 'blob' })
      .then((content) => {
        // Create a link element
        
        const link = document.createElement('a');
        const filename = 'converted_files';
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;

        // Add the link to the document body
        document.body.appendChild(link);

        // Simulate a click on the link to trigger the download
        link.click();

        // Remove the link from the document body
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error('Error generating the zip file:', error);
      });
    }

    
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
        console.log("single file")
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
    console.log("csv metedata")
    console.log(csvMetaData);
    saveAs('data:text/csv;charset=utf-8,' + encodeURIComponent(csvMetaData), fileName);
  }

  const handleContactInformation = () => {
    console.log(" in handle contact information");
    initialize();
    setShowContactInformation(true);
    setIsConversionRequest(false);
    setIsConvertInProgress(false);
    // setStartTimer()
  };

  return (
  
    <div className='dicomImageConverterApp'>
      <div className='appHeader'>
        <div className='logoHeader'>
          <div className='logo'>
            <img src={Logo} alt="Logo" />
          </div>
          <h1>
            PixelBrew
          </h1>
        </div>
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
              <div className='uploadOptionFileOrFolderSection'>
                {!isFolderUpload && <input id= "fileUpload" type="file" onChange={handleFileChange} />}
                {isFolderUpload && <input id="folderUpload" type="file" webkitdirectory = "" onChange={handleFileChange} />}
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
              <div className='folderDownloadSection'>
                {isFolderUpload && subfolders && <div>
                  <a href="#" onClick={handleDownloadFolder}>Download all files</a>
                </div>}
              </div>
            </div>
            
          </div>
        
        </div>
        <div>
          <a href="#contactInformation" onClick={handleContactInformation}>Contact Us</a>
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
                  <button id="downloadButton" onClick={() => handleDownload(0, image)}>Download</button>
                </div>
                {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                    </div>
                }
                
              </>
            ))}
            {selectedSubfolderDicomFrame == 'multi' && selectedSubfolderImages.map((images,index) => (
              <>
                {images.map((singleImage,subIndex) => (
                  <div className='convertedImageSection'>
                    <h2> Converted PNG Image </h2>
                    <ImageGalleryModal images = {singleImage}/>
                    <button id="downloadButton" onClick={() => handleDownload(0, singleImage)}>Download</button>
                  </div>
                ))}
                {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
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
              <button id="downloadButton" onClick={() => handleDownload()}>Download</button>
            </div>
            {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                  </div>
            }
            </>
            )}
            {singlePngImage && (
              <>
              <div className='convertedImageSection'>
                <h2> Converted PNG Image </h2>
                <ImageGalleryModal images = {converted_png_image}/>
                <button id="downloadButton" onClick={() => handleDownload(0)}>Download</button>
              </div>
              {csvMetaData && <div className='csvMetadataSection'>
                    <CsvPreview metadata={csvMetaData} />
                    <button id="downloadButton" onClick={() => downloadMetaData(dicomFilename)}>Download</button>
                  </div>
              } 
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