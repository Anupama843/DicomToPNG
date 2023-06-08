import React from 'react';
import ImageGallery from 'react-image-gallery';

const ImageGalleryModal= ({ images }) => {
    
    return (
            <ImageGallery
            items={images}
            showFullscreenButton={true}
            showPlayButton={true}
            showThumbnails={true} /> 
    );
};

export default ImageGalleryModal;