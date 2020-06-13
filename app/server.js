var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const Brands = require('./models/brands-model');
const Products = require('./models/products-model');
const UserCart = require('./models/cart-model');

const PORT = 3001;

//setup the router
var myRouter = Router();
myRouter.use(bodyParser.json());

//assign server to a variable for export
let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))

}).listen(PORT);

//Handle get request to return all available brands
myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Brands.getAllBrands()));
})

//Handle get request to return all available products
myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(Products.getAllProducts()));
})


//Handle get request to return all available products of a particular brand 
myRouter.get('/api/brands/:id/products', function(request, response) {
 
  //First get the brand from the brand id (query param)
  const selectedBrandId = request.params.id;
  
  //If brand id was not provided in the query, return error
  if (!selectedBrandId) {
    response.writeHead(400);
    return response.end("Unable to complete request")
  }

  // If there are no brands matching the brand Id from the query, return error
  // if (getProductsByBrandId(selectedBrandId).length == 0) {
  //   response.writeHead(404);
  //   return response.end("No products found");
  // }
  // Return the available products available for the particular brand id
  response.writeHead(200, {"Content-Type": "application/json"});

  return response.end(JSON.stringify(Products.getProductsByBrandId(selectedBrandId)))
})


//Handle request to return all the products in a user's cart
myRouter.get('/api/me/cart', function(request,response) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(UserCart.getEntireCart()));
})


//Handle request to add a product to the cart, added product will be returned in the response
myRouter.post('/api/me/cart', function(request,response) {
  //If product doesn't have an id, return an error
  if (!request.body.id ){
		response.writeHead(400);
		return response.end("Cannot add product to cart");
  }
  
  //Add item to cart and assign a variable to the added item
  const addedProduct = UserCart.addProduct(request.body);

  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(addedProduct));
});


//Handle request for testing if a book is successfully removed from the cart
myRouter.get('/api/me/cart/:productId', function(request,response) {
  if (UserCart.findProductInCart(request.params.productId)) {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end();

  } else {
    response.writeHead(404);
    return response.end("Item is not in the cart");
  }
})



//Handle request for removing a product from the user's cart by its id (parameter)
myRouter.delete('/api/me/cart/:productId', function(request,response) {
  // Check if product is in cart
  const foundProduct = UserCart.findProductInCart(request.params.productId);

  // If product is not in the cart, return an error
  if (!foundProduct) {
    response.writeHead(404);
    return response.end("Product not found");
  }

  // At this point, we know the product is in the cart and we can now remove it
  UserCart.deleteProduct(request.params.productId);

  // Return success code for removing the product
  response.writeHead(200);
	return response.end();
})



module.exports = server;