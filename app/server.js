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
  })
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
})

module.exports = server
