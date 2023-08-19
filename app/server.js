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
let brands = [] //list of all brands from json file
let users = [] //list of all users from json file
let products = [] //list of all products from json file
let user = {} //user that is logged in
let userIsLoggedIn = false

// Setup Router
let myRouter = Router()
myRouter.use(bodyParser.json())

const server = http.createServer((request, response) => {
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
myRouter.get('/api/brands', (request, response) => {
    if (!brands) {
        response.writeHead(404, 'error')
        response.end()
    } else {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(brands))
    }
})

// GET products
myRouter.get('/api/products', (request, response) => {
    if (!products) {
        response.writeHead(404, 'error')
        response.end()
    } else {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(products))
    }
})

// GET products from a specified brand
myRouter.get('/api/brands/:id/products', (request, response) => {
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

// POST login existing user
myRouter.post('/api/login', (request, response) => {
    // get credentials from post
    const { username, password } = request.body
    //check if username and password are not empty
    if (username && password) {
        // need this to be a local variable so I can look at the users cart in other requests
        user = users.find(
            // Find the user in the users file
            (user) =>
                user.login.username === username &&
                user.login.password === password
        )
        if (user) {
            // if the user exists
            userIsLoggedIn = true
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

// GET /api/me/cart
myRouter.get('/api/me/cart', (request, response) => {
    // Check if a valid user is logged in
    if (userIsLoggedIn) {
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify(user.cart))
    } else {
        // If a user isnt logged in
        response.writeHead(400, 'There is no user logged in')
        response.end()
    }
})

// POST /api/me/cart add product to cart (I think parsity missed adding '/:productId' to this in the list of expected routes)
myRouter.post('/api/me/cart/:productId', (request, response) => {
    // Check if a valid user is logged in
    if (userIsLoggedIn) {
        const productId = request.params.productId // Get the product ID from the request
        const productToAdd = products.find(
            (product) => product.id === productId
        )
        // if the product id doesnt match a product
        if (!productId) {
            response.writeHead(400, 'Please enter a valid product ID')
            response.end()
        } else {
            productToAdd.qty = '1'
            user.cart.push(productToAdd)
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify(user.cart))
        }
    } else {
        // If a user isnt logged in
        response.writeHead(400, 'There is no user logged in')
        response.end()
    }
})

// DELETE /api/me/cart/:productId
myRouter.delete('/api/me/cart/:productId', (request, response) => {
    // Check if a valid user is logged in
    if (userIsLoggedIn) {
        // Get the product ID from the request
        const productId = request.params.productId
        // Find the index of the product in the cart
        const indexOfProduct = user.cart.findIndex((product) => {
            product.id === productId
        })
        // if the product id doesnt match a product
        if (!productId) {
            response.writeHead(400, 'Please enter a valid product ID')
            response.end()
        } else {
            user.cart.splice(indexOfProduct, 1) // remove one item at the index of the product from the params
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify(user.cart))
        }
    } else {
        // If a user isnt logged in
        response.writeHead(400, 'There is no user logged in')
        response.end()
    }
})

// POST /api/me/cart/:productId/:productQty
myRouter.post('/api/me/cart/:productId/:productQty', (request, response) => {
    // Check if a valid user is logged in
    if (userIsLoggedIn) {
        const productId = request.params.productId // Get the product ID from the request
        const productQty = request.params.productQty // Get the product ID from the request
        const productToEditIndex = user.cart.findIndex(
            (product) => product.id === productId
        )
        // if the product id doesnt match a product
        if (!productId) {
            response.writeHead(400, 'Please enter a valid product ID')
            response.end()
        } else {
            user.cart[productToEditIndex].qty = productQty
            response.writeHead(200, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify(user.cart))
        }
    } else {
        // If a user isnt logged in
        response.writeHead(400, 'There is no user logged in')
        response.end()
    }
})

// Export for TDD
module.exports = server
