const winston = require('winston'),
  WinstonCloudWatch = require('winston-cloudwatch');
const logger = new winston.createLogger({
  format: winston.format.json(),
  transports: [
      new (winston.transports.Console)({
          timestamp: true,
          colorize: true,
      })
  ]
});
const cloudwatchConfig = {
  logGroupName: "csye6225-spring2022",
  logStreamName: "webapp",
  awsAccessKeyId: "",
  awsSecretKey: "",
  awsRegion: "us-east-1",
  messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
}
logger.add(new WinstonCloudWatch(cloudwatchConfig))

module.exports = logger;