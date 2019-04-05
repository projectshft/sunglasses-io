var http = require('http')
var fs = require('fs')
var finalHandler = require('finalhandler')
var queryString = require('querystring')
var Router = require('router')
var bodyParser = require('body-parser')
var uid = require('rand-token').uid

const PORT = 3001

// Setup router
var myRouter = Router()
myRouter.use(bodyParser.json())

const server = http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response))
  })
  .listen(PORT, error => {
    if (error) {
      throw error
    }
    fs.readFile('initial-data/brands.json', 'utf8', (error, data) => {
      if (error) throw error
      brands = JSON.parse(data)
      console.log(`Server setup: ${brands.length} brands loaded`)
    })
    fs.readFile('initial-data/products.json', 'utf8', (error, data) => {
      if (error) throw error
      products = JSON.parse(data)
      console.log(`Server setup: ${products.length} products loaded`)
    })
  })

//get all brands
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
})
//get products by productName
myRouter.get('/products', (request, response) => {
  let query = queryString.parse(request.url.substring(10))

  if (Object.keys(query).length == 0) {
    response.writeHead(401, 'Please enter a product')
    response.end()
    return
  }
  let product = products.find(product => {
    return product.productName === query.productName
  })
  if (!product) {
    response.writeHead(403, 'The product does not exist')
    response.end()
    return
  }
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(product))
  return
})

module.exports = server
