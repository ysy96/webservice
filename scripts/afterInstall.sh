#!/bin/bash
sudo chmod -R 777 /home/ec2-user/src
sudo chmod -R 777 ~/src
cd ~
cd src
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
sleep 10
npm cache clean --force
npm update
npm install uuidv4 pm2@latest @aws-sdk/client-cloudwatch-logs morgan winston node-statsd express nodemon dotenv bcrypt sequelize mysql2 multer multer-s3 aws-sdk --save
sleep 10
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -m ec2 -a stop
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ec2-user/src/utils/cloudwatch-config.json -s


