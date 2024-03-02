const app =  require( "./app");
const port = process.env.PORT || 8080;
const winston = require( "./utils/logger");
// Starting server
app.listen(port, () =>
  console.log('Webapp listening on port 8080!'),
  winston.info('Webapp listening...')
);