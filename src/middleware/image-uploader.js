const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require('dotenv').config;

const region = "us-east-1"
const accessKeyId = ""
const secretAccessKey = ""

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
})


const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: "mys3.prod.songyue.me",
      metadata: function (req, file, cb) {
        cb(null, {fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname);
      }
    })
});

module.exports = upload;