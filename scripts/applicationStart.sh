#!/bin/bash 
pm2 kill
sudo pkill -f PM2
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v17.9.0/bin /home/ec2-user/.nvm/versions/node/v17.9.0/lib/node_modules/pm2/bin/pm2 start ~/src/server.js -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v17.9.0/bin /home/ec2-user/.nvm/versions/node/v17.9.0/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v17.9.0/bin /home/ec2-user/.nvm/versions/node/v17.9.0/lib/node_modules/pm2/bin/pm2 save -u ec2-user --hp /home/ec2-user
sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v17.9.0/bin /home/ec2-user/.nvm/versions/node/v17.9.0/lib/node_modules/pm2/bin/pm2 list -u ec2-user --hp /home/ec2-user