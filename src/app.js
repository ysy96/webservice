var express = require("express");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
const db = require('./models');
const morgan = require('morgan');
const winston = require('./utils/logger');
const StatsD = require('node-statsd'),
    client = new StatsD();


app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Route
app.get("/healthz", (req,res) => {
    res.status(200).json();
    client.increment('health_api_counter');
    winston.info('Healthy endpoint!');
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());

db.User.sync().then((state)=> {
    console.log("Successfully create user table");
}).catch(err => {
    console.log(err);
    winston.error(err);
})
db.Image.sync().then((state)=> {
    console.log("Successfully create image table");
}).catch(err => {
    console.log(err);
    winston.error(err);
})
const userRoutes = require('./routes/user-route');
app.use('/v1',userRoutes);
app.use(morgan('combined', { stream: winston.stream }));

winston.info('You have successfully started working with winston and morgan');
module.exports = app;