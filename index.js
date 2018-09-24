// Import logging framework
const winston = require('winston')
// Import the express lirbary
const express = require('express')
var cors = require('cors')
// Create a new express application and use
const app = express()
// Import the axios library, to make HTTP requests
const axios = require('axios')
// import config variables
var config = require('./config/config.js').get(process.env.NODE_ENV);
// import the winston library for logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]    //new winston.transports.File({ filename: 'logfile.log' })
});

logger.info('oauth-demo application starting...')

// Handle CORS requirements
// Try this .optons method next
//app.options('*', cors()) // include before other routes
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


// Declare the redirect route
app.get('/oauth/redirect', (req, res, next) => {
  logger.debug('oauth redirect called...')
  // The req.query object has the query params that
  // were sent to this route. We want the `code` param
  const requestToken = req.query.code
  axios({
    // make a POST request
    method: 'post',
    // to the Github authentication API, with the client ID, client secret
    // and request token
    url: `https://github.com/login/oauth/access_token?client_id=${config.Github.clientID}&client_secret=${config.Github.clientSecret}&code=${requestToken}`,
    // Set the content type header, so that we get the response in JSOn
    headers: {
         accept: 'application/json'
    }
  }).then((response) => {
    logger.debug('oauth redirect accessToken response then(), redirecting to Welcome...')
    // Once we get the response, extract the access token from the response body
    const accessToken = response.data.access_token
    // redirect the user to the welcome page, along with the access token
    res.redirect(`/welcome.html?access_token=${accessToken}`)
  })
})

// use the express static middleware location, to serve all files inside the public directory
app.use(express.static(__dirname + '/public'))

// Start the server on port 3000
app.listen(3000)
logger.info('oauth-demo application listening on port 3000...')
