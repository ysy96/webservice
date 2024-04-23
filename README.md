# webservice

## Infrastructure
https://github.com/ysy96/infrastructure

## Serverless
https://github.com/ysy96/serverless

### Prerequisites

Run following command:
```
npm install express nodemon mysql2 dotenv bcrypt sequelize multer multer-s3 aws-sdk --save
```

### Building the app

```
npm start
```

**Validate Packer Template**
```
packer validate packer/ami.json
```

**Build AMI**
```
packer build -var-file=packer/vars.json packer/ami.json
```
**Import SSL Certificate**
```
aws acm import-certificate --certificate fileb://prod_songyue_me.crt \
    --certificate-chain fileb://prod_songyue_me.ca-bundle \
    --private-key fileb://prod.songyue.mekey
```
