import React from 'react';

const PopUpModal= ({ open , onClose, dicomFile }) => {

    if (!open) return null;

    const handleSaveFile = async () => {
      console.log("in save file method");
      
      const formData = new FormData();
      formData.append('file', dicomFile);
  
      const response = await fetch('/saveFile', {
        method: 'POST',
        body: formData
      });
  
      const data = await response.json();
      console.log("data:");
      console.log(data);
      if (data.success) {
        console.log("data saved successfully");
        console.log(data.message);
        
      } else {
        console.log("Encountered error");
        console.log(data.error);
      }
    };
    
    return (
        <div onClick={onClose} className='overlay'>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className='popUpModalContainer'>
            <div className='modalRight'>
              <p className='closeBtn' onClick={onClose}>
                X
              </p>
              <div className='modalContent'>
                <p>Do you want us to save the uploaded dicom image</p>
              </div>
              <div className='btnContainer'>
                <button className='btnYes' onClick={handleSaveFile}>
                  <span className='bold'>YES</span>
                </button>
                <button className='btnNo'>
                  <span className='bold'>NO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    );
};

export default PopUpModal;