'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const winston = require("../utils/logger")
const db = {};
// var crt = fs.readFileSync("../prod_songyue.me/prod_songyue_me.crt").toString();
// var ca = fs.readFileSync("../prod_songyue.me/prod_songyue_me.ca-bundle").toString();
const rdsCa = fs.readFileSync('../us-east-1-bundle.pem');

let sequelize;
sequelize = new Sequelize(config.database, config.username, config.password,{
  port: "3306",
  host: "csye6225.cdvveudp2pfk.us-east-1.rds.amazonaws.com",
  dialect: "mysql",
  dialectOptions:{
    ssl: {
      rejectUnauthorized: true,
      ca: [rdsCa]
    }
  }
});


sequelize.authenticate().then(() => {
  console.log("Connected to the database!");
}).catch(err => {
  console.log("Cannot connect to the database!", err);
  winston.error(err);
  process.exit();
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;