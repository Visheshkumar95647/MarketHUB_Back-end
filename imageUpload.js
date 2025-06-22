const cloudinary = require('./cloudinaryConfig'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder:"ProfileImage/images", 
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], 
  },
});

const upload = multer({ storage });

module.exports = upload;
