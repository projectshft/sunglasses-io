var http = require('http')
var fs = require('fs')
var finalHandler = require('finalhandler')
var queryString = require('querystring')
var Router = require('router')
var bodyParser = require('body-parser')
var uid = require('rand-token').uid

const PORT = 3001

// Variables
let brands = []
let users = []
let products = []

// Setup Router
let myRouter = Router()
myRouter.use(bodyParser.json())

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
    // Load brands data
    brands = JSON.parse(fs.readFileSync('brands.json', 'utf-8'))

    // Load users data
    users = JSON.parse(fs.readFileSync('users.json', 'utf-8'))

    // Load products data
    products = JSON.parse(fs.readFileSync('products.json', 'utf-8'))
})
