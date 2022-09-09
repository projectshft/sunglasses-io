var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/Brands')
let User = require('./models/User')

let myRouter = Router()
myRouter.use(bodyParser.json())
const PORT = 3001;

let server = http.createServer(function (request, response){
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT)

fs.readFile('./initial-data/brands.json', (error, data) => {
  if (error) throw error
  brands = JSON.parse(data)
})

fs.readFile('./initial-data/products.json', (error, data) => {
  if (error) throw error
  products = JSON.parse(data)
})

fs.readFile('./initial-data/users.json', (error, data) => {
  if (error) throw error
  users = JSON.parse(data)
})

myRouter.get('/brands', function(request, response){
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(Brand.getBrands()))
})

myRouter.get('/user/:id', function(request, response){
  const foundUser = User.getUser(request.params.id)
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(User.getUser))
})

module.exports = server