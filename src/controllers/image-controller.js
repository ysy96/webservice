const db = require('../models');
const bcrypt = require('bcrypt');
const upload = require('../middleware/image-uploader')
const path = require('path');
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
require('dotenv').config;
const winston = require('../utils/logger');
var StatsD = require('node-statsd'),
    client = new StatsD();

const bucketName = "mys3.prod.songyue.me"
const region = "us-east-1"
const accessKeyId = ""
const secretAccessKey = ""
const date = new Date().toISOString().slice(0, 19).replace('T', ' ');

const s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
})

// Uploading
function createImage(req, res) {
    const auth = req.headers.authorization;
    if(!auth){
        winston.error("Authentication failed");
        return res.status(403).send({message:"Forbidden"});
    }
    const encoded = auth.substring(6);
    const decoded = Buffer.from(encoded,'base64').toString('ascii');
    const [username,password] = decoded.split(':');
    db.User.findOne({where:{username: username}}).then(user => {
        if(user === null){
            res.status(401).json({
                message: "Username not match",
            });
            winston.error("No record found in database");
        }else if(user.isVerified==false){
            res.status(403).json({
                message: "Please verify your email to proceed..."
            });
            winston.error("Email not verified");
        }
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    db.Image.findOne({where:{userId:user.id}}).then(image=>{
                            if(image != null){
                                res.status(400).json({ message:"Error! There must be only one profile pic exist!"});
                                winston.error("Duplicate image");
                            }
                            else{
                                upload.single('photo')(req,res,error=>{
                                    if(error){
                                        res.status(400).json({ error: error });
                                        winston.error(error);
                                    }
                                    else{
                                        const image = {
                                            file_name: req.file.originalname,
                                            url: req.file.location,
                                            userId: user.id,
                                            upload_date: date
                                        }
                                        db.Image.create(image).then(result=>{
                                            res.status(201).json({
                                                file_name: result.file_name,
                                                id: result.id,
                                                url: result.url,
                                                upload_date: result.upload_date,
                                                user_id: result.userId
                                            })
                                        }).catch(error => {
                                            res.status(400).json({ message:"Bad request...",error: error})
                                            winston.error(error);
                                        });
                                    }
                                });
                            }
                            winston.info("Successfully uploaded image");
                    })
                         
                }else{
                    res.status(401).json({
                        message: "Invalid credentials!"
                    });
                    winston.error("Authentication failed");
                }       
            });

        }
    }).catch(error => {
        res.status(500).json({ message:"Something else went wrong"})
        winston.error(error);
    })           

}

function getImage(req, res) {
    const auth = req.headers.authorization;
    if(!auth){
        return res.status(403).send({message:"Forbidden"});
        winston.error("Authentication failed");
    }
    const encoded = auth.substring(6);
    const decoded = Buffer.from(encoded,'base64').toString('ascii');
    const [username,password] = decoded.split(':');
    db.User.findOne({where:{username: username}}).then(user => {
        if(user === null){
            res.status(401).json({
                message: "Username not match",
            });
            winston.error("Record not found in database");
        }else if(user.isVerified==false){
            res.status(403).json({
                message: "Please verify your email to proceed..."
            });
            winston.error("Email not verified");
        }
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    db.Image.findOne({where:{userId: user.id}}).then(image=>{
                        if(image==null){
                            res.status(404).json({
                                message: "Profile picture not found",
                            });
                            winston.error("Record not found in database");
                        }
                        else{
                            const profilePic = {
                                Bucket: bucketName, // your bucket name,
                                Key: image.file_name // path to the object you're looking for
                            }
                            s3.getObject(profilePic, function (err, data) {
                                if (err) {
                                    res.status(404).json({error:err, message: "Image not found"})
                                    winston.error("Image not found in S3");
                                }else{
                                    db.Image.findOne({where:{file_name: image.file_name}}).then(result=>{
                                        res.status(200).json({
                                            file_name: result.file_name,
                                            id: result.id,
                                            url: result.url,
                                            upload_date: result.upload_date,
                                            user_id: result.userId
                                            // data: data.Body.toString('utf-8')
                                        })
                                        winston.info("Fetched image from s3");
                                    })
                                }
                            });
                        }
                    })
                }else{
                    res.status(401).json({
                        message: "Invalid credentials!"
                    });
                    winston.error("Authentication failed");
                }       
            });

        }
    }).catch(error => {
        res.status(500).json({ message:"Something else went wrong"})
        winston.error(error);
    })           

}

function deleteImage(req, res) {
    const auth = req.headers.authorization;
    if(!auth){
        return res.status(403).send({message:"Forbidden"});
        winston.error("Authentication failed");
    }
    const encoded = auth.substring(6);
    const decoded = Buffer.from(encoded,'base64').toString('ascii');
    const [username,password] = decoded.split(':');
    db.User.findOne({where:{username: username}}).then(user => {
        if(user === null){
            res.status(401).json({
                message: "Username not match",
            });
            winston.error("Username not found in database");
        }else if(user.isVerified==false){
            res.status(403).json({
                message: "Please verify your email to proceed..."
            });
            winston.error("Email not verified");
        }
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    db.Image.findOne({where:{userId: user.id}}).then(image=>{
                        if(image==null){
                            res.status(404).json({
                                message: "Profile picture not found",
                            });
                            winston.error("Image not found");
                        }
                        else{
                            const profilePic = {
                                Bucket: bucketName, 
                                Key: image.file_name 
                            } 
                            s3.deleteObject(profilePic, function (err, data) {
                                if(err){
                                    res.status(204).json({message:"No content"})
                                    winston.error(err);
                                }else{
                                    db.Image.destroy({where:{userId: image.userId}},function (err,data){
                                        if(err){
                                            res.status(404).json({
                                                message:"Profile picture not found..."
                                            })
                                            winston.error(err);
                                        }
                                    })
                                    res.status(200).json({
                                        message:"Successfully delete picture!"
                                    })
                                    winston.info("Successfully delete picture from s3");
                                }
                            })
                        }
                    })  
                }else{
                    res.status(401).json({
                        message: "Invalid credentials!"
                    });
                    winston.error("Authentication failed");
                }       
            });

        }
    }).catch(error => {
        res.status(500).json({ message:"Bad request..."})
        winston.error(error);
    })           

}




module.exports = {
    createImage: createImage,
    getImage: getImage,
    deleteImage: deleteImage
    
} 