var http = require('http')
var fs = require('fs')
var finalHandler = require('finalhandler')
var queryString = require('querystring')
var Router = require('router')
var bodyParser = require('body-parser')
var uid = require('rand-token').uid

const PORT = 3001
let brands = []
let products = []

// Setup router
var myRouter = Router()
myRouter.use(bodyParser.json())

const server = http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response))
  })
  .listen(PORT, error => {
    if (error) {
      return console.log('Error on Server Startup: ', error)
    }

    brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf8'))

    products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf8'))
    // fs.readFile('initial-data/brands.json', 'utf8', (error, data) => {
    //   if (error) throw error
    //   brands = JSON.parse(data)
    //   console.log(`Server setup: ${brands.length} brands loaded`)
    // })
    // fs.readFile('initial-data/products.json', 'utf8', (error, data) => {
    //   if (error) throw error
    //   products = JSON.parse(data)
    //   console.log(`Server setup: ${products.length} products loaded`)
    // })
  })

//get all brands
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
  return
})
//get all products by brandID
myRouter.get('/brands/:brandId/products', (request, response) => {
  //filter for the products with the appropriate brand Id
  let brandProducts = products.filter(product => {
    return product.brandId == request.params.brandId
  })
  //if there are no products with the brand Id, a 401 error should be thrown
  if (brandProducts == false) {
    response.writeHead(401, 'No products with that brand Id found.')
    response.end()
    return
  }
  //if there are products with the brandId, send them
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brandProducts))
  return
})
//get products by productName
myRouter.get('/products', (request, response) => {
  let query = queryString.parse(request.url.substring(10))

  //if the user enters an empty string in the search bar, a 403 error should be thrown
  if (Object.keys(query).length == 0) {
    response.writeHead(
      402,
      'Please enter the name of the product you are searching for.'
    )
    response.end()
    return
  }
  //match productName in query to the productNames in products.json
  let product = products.find(product => {
    return product.productName === query.productName
  })
  //if there is no product with that productName, a 403 error should be thrown
  if (!product) {
    response.writeHead(403, 'The product does not exist')
    response.end()
    return
  }
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  //if there is a product with the queried productName, return the product
  response.end(JSON.stringify(product))
  return
})

//export the server so that tests can be written
module.exports = server
