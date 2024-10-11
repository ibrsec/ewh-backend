"use strict";


module.exports = (imageData) => {
    const base64Image = imageData?.buffer.toString("base64");
      const imgSrc = `data:${imageData?.mimeType};base64,${base64Image}`;
      return imgSrc
}