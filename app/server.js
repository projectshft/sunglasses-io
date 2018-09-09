var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;



// Create the server
http.createServer(function (request, response) {

}).listen(PORT, (error) => {
  
  console.log(`Server is listening on ${PORT}`);
  });