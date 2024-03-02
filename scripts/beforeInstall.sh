#!/bin/bash
cd ~
pm2 kill
sudo pkill -f PM2
sudo rm -r home/ec2-user/src
sudo rm -rf home/ec2-user/webservice.zip




