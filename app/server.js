// Import all built-in node modules and methods, as well as installed modules 
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalHandler');
const queryString = require('queryString');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

// Establish port 
// const PORT = process.env.PORT || 3001; ????
 const hostname = 'localhost';
 const PORT = 3001;

 // Establish state-holding variables


 // Set up router 
 const myRouter = Router()
 myRouter.use(bodyParser.json())

 // Establish server with finalHandler (***replaces res.end?) ???
  const server = http.createServer(function(req,res) {
    res.setHeader('Content-type', 'application/json')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200)
    myRouter(req, res, finalHandler(req, res));
  });

server.listen(PORT, hostname, err => {
    if (err) throw err;
    console.log(`'Server running at http://${hostname}:${PORT}/'`);
  });

module.exports = server;