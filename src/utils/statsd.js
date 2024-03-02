const StatsD = require('node-statsd'),
    client = new StatsD();


function countCreateUser(req, res) {
    client.increment('CreateUser_counter');
}
function countGetUser(req, res) {
    client.increment('GetUser_counter');
}
function countUpdateUser(req, res) {
    client.increment('UpdateUser_counter');
}
function countCreateImage(req, res) {
    client.increment('CreateImage_counter');
}
function countGetImage(req, res) {
    client.increment('GetImage_counter');
}
function countDeleteImage(req, res) {
    client.increment('DeleteImage_counter');
}
function countVerifyUser(req, res) {
    client.increment('VerifyUser_counter');
}



module.exports = {
    countCreateUser: countCreateUser,
    countGetUser: countGetUser,
    countUpdateUser: countUpdateUser,
    countCreateImage: countCreateImage,
    countGetImage:countGetImage,
    countDeleteImage:countDeleteImage,
    countVerifyUser:countVerifyUser



} 