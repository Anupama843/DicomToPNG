// import React, {useState, useEffect} from 'react'
// import { useFilePicker } from 'use-file-picker';
// import FileUploadSingle from './FileUploadSingle';

// function App() {
  // const [openFileSelector, { filesContent, loading }] = useFilePicker({
  //   accept: '.DCM',
  // });

  // if (loading) {
  //   return <div>Loading...</div>;``
  // }

  // return (
  //   <div>
  //     <button
  //       onClick={ async () => {
  //         try {
  //           // you can also get values directly from the openFileSelector
  //           const result = await openFileSelector();
  //           console.log('result.errors', result.errors);
  //           console.log('result.filesContent', result.filesContent);
  //           console.log('result.plainFiles', result.plainFiles);
  //         } catch (err) {
  //           console.log(err);
  //           console.log('Something went wrong or validation failed');
  //         }
  //       }}
  //     >
  //       Select files{' '}
  //     </button>
  //     <br />
  //     {filesContent.map((file, index) => (
  //       <div>
  //         <h2>{file.name}</h2>
  //         <div key={index}>{file.content}</div>
  //         <br />
  //       </div>
  //     ))}
  //   </div>
  // );
//   return (
//     <FileUploadSingle/>
//   );
// }

// export default App


import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/convert', formData);
      setImage(response.data.filename);
      setMetadata(response.data.metadata);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <h1>DICOM to PNG Image Converter</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>

      {image && (
        <div>
          <img src={`http://localhost:5000/uploads/${image}`} alt="Converted DICOM Image" />
        </div>
      )}

      {metadata && (
        <div>
          <h2>Metadata</h2>
          <ul>
            <li>Patient Name: {metadata['Patient Name']}</li>
            <li>Study Date: {metadata['Study Date']}</li>
            <li>Modality: {metadata['Modality']}</li>
            <li>Image Dimensions: {metadata['Image Dimensions']}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
