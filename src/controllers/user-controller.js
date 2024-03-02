const db = require('../models');
const bcrypt = require('bcrypt');
const AWS = require('aws-sdk');
const { uuid } = require('uuidv4');
require('dotenv').config();
const dynamodbConfig = require('../config/dynamodb-config');
const winston = require('../utils/logger');
var StatsD = require('node-statsd'),
    client = new StatsD();
// const currentTime = Math.floor(Date.now() / 1000);
// const expirationTime = Math.floor(Date.now() / 1000) + 300;
// const currentTime = Math.floor(Date.now() / 1000);
// // const expirationTime = Date.parse(new Date().toString()) + 300;
// console.log(currentTime);
AWS.config.update({region:'us-east-1'});
const sns = new AWS.SNS();
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Create user
 * @param {*} req 
 * @param {*} res 
 */
function createUser(req, res) {
        db.User.findOne({where:{username:req.body.username}}).then(result => {
            if(result){
                res.status(400).json({
                    message: "Error! Username already exists!",
                });
                winston.error("Error! Username already exists!");
            }else{
                bcrypt.genSalt(10, function(err, salt){
                    bcrypt.hash(req.body.password, salt, function(err, hash){
                        const user = {
                            first_name: req.body.first_name,
                            last_name: req.body.last_name,
                            username: req.body.username,
                            password: hash
                        }
                        db.User.create(user).then(result => {
                            if(result){
                                const expirationTime = Math.floor(Date.now() / 1000) + 300;
                                const params = {
                                    TableName : 'Verification',
                                    Item: {
                                        token: uuid(),
                                        username: user.username,
                                        ttl: expirationTime
                                    }
                                };
                                docClient.put(params, function (err, data) {
                                    if (err) {
                                        winston.error(err);
                                        res.send({
                                            success: false,
                                            message: "Error storing token in dynamodb",
                                            error: err
                                        });
                                    } else {
                                        if(result.isVerified==true) {
                                            res.status(400).json({
                                                message: 'User already verified!'
                                            })
                                        }else{
                                            const jsonParams = JSON.stringify(params);
                                            const snsMessage = {
                                                Message: `${jsonParams}`,
                                                TopicArn: 'arn:aws:sns:us-east-1:284018978494:Verification',

                                            }
                                            sns.publish(snsMessage,(err,data) => {
                                                if(err) {
                                                    winston.error(err);
                                                    res.send({
                                                        message: "Error publishing sns messages",
                                                        error: err
                                                    });
                                                }else{
                                                    res.status(201).json({
                                                        id: result.id,
                                                        first_name: result.first_name,
                                                        last_name: result.last_name,
                                                        username: result.username,
                                                        account_created: result.createdAt,
                                                        account_updated: result.updatedAt,
                                                        isVerified: result.isVerified,
                                                        message: "Please go to your email and click the verification link!"
                                                    });
                                                    winston.info("SNS published successfully");
                                                }
                                            })
                                        }
                                        winston.info("User stored in dynamodb and rds successfully");
                                    }
                                });
                            }else{
                                res.status(400).json({ message:"Error inserting user in rds!"})
                            }
                        }).catch(error => {
                            res.status(400).json({ message:"Error! Username is not valid!"});
                            winston.error(error);
                        });
                    });
                });
            }
            winston.info("Successfully created user");
        }).catch(error => {
            res.status(400).json(error);
            winston.error(error);
        });
}

/**
 * Get current user detail
 * @param {*} req 
 * @param {*} res 
 */
function getUserInfo(req, res){
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
                message: "Username not match"
            });
            winston.error("No user record found in database");
        }else if(user.isVerified==false){
            res.status(403).json({
                message: "Please verify your email to proceed..."
            });
            winston.error("Email not verified");
        }
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    res.status(200).json({
                        message:"User fetched successfully",
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        username: user.username, 
                        account_created: user.createdAt,
                        account_updated: user.updatedAt,
                        isVerified: user.isVerified
                    })
                    winston.info("User record found in database");
                }else{
                    res.status(401).json({
                        message: "Invalid credentials!"
                    });
                    winston.error("Authentication not match");
                }
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
        });
        winston.error(error);
    })
}


/**
 * Update user
 * @param {*} req 
 * @param {*} res 
 */
function updateUserInfo(req, res){
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
            winston.error("No user record found in database");
        }else if(user.isVerified==false){
            res.status(403).json({
                message: "Please verify your email to proceed..."
            });
            winston.error("Email not verified");
        }
        else{
            bcrypt.compare(password, user.password, function(err, result){
                if(result){
                    bcrypt.genSalt(10, function(err, salt){
                        bcrypt.hash(req.body.password, salt, function(err, hash){
                            const updatedUser = {
                                first_name: req.body.first_name,
                                last_name: req.body.last_name,
                                username: username,
                                password: hash
                            }
                            db.User.update(updatedUser, {where: {username:username}}).then(result => {
                                if(result){
                                    res.status(200).json({
                                        message: "User updated successfully"
                                    });
                                    winston.info("Record updated successfully")
                                }else{
                                    res.status(204).json({
                                        status:204,
                                        message: "No content"
                                    });
                                    winston.error("No content");
                                }
                            }).catch(error => {
                                res.status(400).json({
                                    message: "Bad request...",
                                    error: error
                                })
                                winston.error(error);
                            })
                        })
                    });
                }else if(req.body == null){
                    res.status(204).json({
                        message:"No content..."
                    });
                    winston.error("No content");
                }else{
                    res.status(401).json({
                        message: "Invalid credentials!"
                    });
                    winston.error("Invalid credentials");
                }
            });
        }
    })
}

function verifyUser(req, res){
    const username = req.query.email;
    const token = req.query.token;
    const currentTime = Math.floor(Date.now() / 1000);
    const params = {
        TableName: 'Verification',
        Key: { 
            username: username
        },
    };
    docClient.get(params,function(err, data) {
        if(data.Item.ttl>=currentTime){
            const verifiedUser = {
                isVerified: true
            }
            db.User.update(verifiedUser, {where: {username:username}}).then(result => {
                if(result){
                    res.status(200).json({
                        message: `User ${username} verified successfully`
                    });
                    winston.info("Record verified successfully");
                }
            }).catch(error => {
                res.status(400).json({
                    message: "Bad request...",
                    error: error
                })
            })
        }
        else if(data.Item.ttl<currentTime){
            res.status(404).json({
                message: "Verification link expired!"
            });
            winston.error("Verification link expired!");
        }
        else{
            res.status(500).json({message: "Something went wrong!"});
            winston.error(err);
        }
    })
}




module.exports = {
    createUser: createUser,
    getUserInfo: getUserInfo,
    updateUserInfo: updateUserInfo,
    verifyUser: verifyUser
    
} 