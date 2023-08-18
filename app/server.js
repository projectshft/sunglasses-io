var http = require('http')
var fs = require('fs')
var finalHandler = require('finalhandler')
var queryString = require('querystring')
var Router = require('router')
var bodyParser = require('body-parser')
var uid = require('rand-token').uid

const PORT = 3001
// const hostname = 'localhost'

// Variables
let brands = []
let users = []
let products = []

// Setup Router
let myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
})

server.listen(PORT, () => {
    // Load brands data
    brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'))

    // Load users data
    users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'))

    // Load products data
    products = JSON.parse(
        fs.readFileSync('../initial-data/products.json', 'utf-8')
    )
})

// GET brands
myRouter.get('/api/brands', function (request, response) {
    if (!brands) {
        response.writeHead(404, 'error')
        response.end()
    } else {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(brands))
    }
})

// GET products
myRouter.get('/api/products', function (request, response) {
    if (!products) {
        response.writeHead(404, 'error')
        response.end()
    } else {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(products))
    }
})

// GET products from a specified brand
myRouter.get('/api/brands/:id/products', function (request, response) {
    if (!products) {
        response.writeHead(404, 'error')
        response.end()
    } else {
        // Get the brand ID from the request
        const brandId = request.params.id
        // Make a new array of all theproducts from that brand ID
        let brandProdArr = []
        products.map((product) => {
            if (product.categoryId === brandId) {
                brandProdArr.push(product)
                return
            } else {
                return
            }
        })
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(brandProdArr))
    }
})

// Export for TDD
module.exports = server
