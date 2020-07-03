const multer = require('multer');
var cloudinary = require('cloudinary');
const config = require('config')

const cloudinaryStorage = require('multer-storage-cloudinary');
cloudinary.config({
  cloud_name: config.get('CLOUD_NAME'),
  api_key: config.get('CLOUDINARY_API'),
  api_secret: config.get('CLOUDINARY_SECRET'),
});
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'avatar',
  allowedFormats: ['jpg', 'jpeg', 'png'],
  transformation: [
    {
      width: 200,
      height: 200,
      crop: 'limit',
      // gravity: 'face',
      crop: 'thumb',
      quality: 'auto',
    },
  ],

  filename: function (req, file, cb) {
    cb(undefined, file.filename);
  },
});

const fileUpload = multer({ storage: storage });

module.exports = fileUpload;
