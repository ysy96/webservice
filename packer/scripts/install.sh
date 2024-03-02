#!/bin/bash
sleep 10
cd home/ec2-user
sudo yum update -y
sleep 10
sudo yum install mysql -y
sudo yum install -y ruby wget
sleep 10
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
sleep 10
chmod +x ./install
sudo ./install auto
sleep 10
sudo service codedeploy-agent start
sudo service codedeploy-agent status
sudo yum install amazon-cloudwatch-agent -y
sleep 10
sleep 10
echo Install node js
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# . ~/.nvm/nvm.sh
# nvm install node
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
# npm config delete prefix 
# npm config set prefix $NVM_DIR/versions/node/v18.0.0
curl --silent --location https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum -y install nodejs
export PATH=/usr/local/lib/nodejs/node-v17.8.0-linux-x64/bin:$PATH
sudo echo 'export PATH=/usr/local/lib/nodejs/node-v17.8.0-linux-x64/bin:$PATH' | sudo tee -a /etc/profile
sleep 10
# install npm packages
sudo echo 'export PATH=$PATH:/home/ec2-user/node_modules/forever/bin' | sudo tee -a /etc/profile
source /etc/profile
sleep 10
# install npm packages
sudo chmod  -R 777 /usr/lib/node_modules/
npm install pm2@latest aws-sdk @aws-sdk/client-cloudwatch-logs morgan winston node-statsd express nodemon dotenv bcrypt sequelize mysql2 multer multer-s3 --save


