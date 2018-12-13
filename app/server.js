var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (req, res) {
    myRouter(req, res, finalHandler(req, res))
}).listen(PORT, () => console.log(`listening on port ${PORT}`));

Router.get('/api/brands', (req,res) => {

}) 

Router.get('/api/brands/:id/products', (req,res) => {

}) 

Router.get('/api/products', (req,res) => {

}) 

Router.post('/api/login', (req,res) => {

}) 

Router.get('/api/me/cart', (req,res) => {

}) 

Router.post('/api/me/cart', (req,res) => {

}) 

Router.delete('/api/me/cart/:productId', (req,res) => {

}) 

Router.post('/api/me/cart/:productId', (req,res) => {

})
