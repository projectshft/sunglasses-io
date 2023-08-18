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
let userIsLoggedIn = false

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

// POST Login
// myRouter.post('/api/login', function (request, response) {
//     // Make sure there is a username and password in the request
//     if (request.body.username && request.body.password) {
//         let user = users.find(
//             (user) =>
//                 user.login.username === username &&
//                 user.login.password === password
//         )
//         if (!user) {
//             response.writeHead(401, 'Invalid username or password')
//             response.end()
//         } else {
//             userIsLoggedIn = true
//             response.writeHead(200, { 'Content-Type': 'application/json' })
//             response.end()
//         }
//     }
// })

myRouter.post('/api/login', (request, response) => {
    // get credentials from post
    const { username, password } = request.body
    //check if username and password are not empty
    if (username && password) {
        let user = users.find(
            // Find the user in the users file
            (user) =>
                user.login.username === username &&
                user.login.password === password
        )
        if (user) {
            // if the user exists
            validUser = true
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end()
        } else {
            // If credentials were entered but not found
            response.writeHead(401, 'Invalid username or password')
            response.end()
        }
    } else {
        // if one or both of the username and password were not entered
        response.writeHead(400, 'Incorrectly formatted response')
        response.end()
    }
})

// Export for TDD
module.exports = server
