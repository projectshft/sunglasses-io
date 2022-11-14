var http = require('http');
var fs = require('fs');
var finalHandler = require('finalHandler');
var queryString = require('queryString');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var { expect } = require('chai');

// // var myRouter = Router()
// // myRouter.use(bodyParser.json())

 const hostname = 'localhost';
 const port = 3001;

 let person = JSON.stringify({
  name: 'Jill',
  title: 'Software Engineer',
  graduated: false,
});

http.createServer(function(req,res) {
  res.setHeader('Content-type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.writeHead(200)
  res.end(person);
  })
  .listen(port, hostname, function() {
    console.log('Server running at http://' + hostname + ':' + port + '/');
  });




