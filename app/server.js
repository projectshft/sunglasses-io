var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const hostname ='localhost';
const port = 8080;

let router = Router();

let server = http.createServer((req, res) => {
  let url = req.url;
  if(url === '/api/brands') {
    res.writeHead(200, {'Content-Type' : 'application/json'});
    res.write('brands array');
    let brandArry = ['gucci', 'oakley', 'mk'];
    console.log('server is requested!');
    res.end(JSON.stringify(brandArry));
  }
}).listen(port);

module.exports = server;