var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var url = require('url');

const PORT = 3001;

// declare vars that will contain state
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// set up router
const myRouter = Router();
myRouter.use(bodyParser.json());


// create server
const server = http.createServer(function (request, response) {
	myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
	if (error) throw error;
	brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
	products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"));
	users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf8"));
});

// GET /api/brands (return all brands available)
myRouter.get("/api/brands", (request, response) => {
	if(brands.length == 0){
		response.writeHead(404, "No brands available");
		response.end();
	}
	response.writeHead(200, "Request for brands was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(brands));
})

// GET /api/products (return all products available when no query is provided)
myRouter.get("/api/products", (request,response) => {
	const parsedUrl = url.parse(request.url);
	const { query } = queryString.parse(parsedUrl.query);
	if (products.length == 0){
		response.writeHead(400, "Products not available");
		response.end();
	}

	let productsReturnedByQuery = [];
	// make sure that if the query is empty that a 404 error is returned, otherwise send a successfull response
	if(query !== undefined){
		productsReturnedByQuery = products.filter(product =>
			product.name.includes(query) || product.description.includes(query));
		if(productsReturnedByQuery.length == 0){
			response.writeHead(404, "No products that match that query");
			response.end();
		}
	}else{
		productsReturnedByQuery = products;
	}
	response.writeHead(200, "Request for products was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(productsReturnedByQuery));
})

// GET /api/brands/:id/products (returns all products of a specific brand by brand ID)
myRouter.get("/api/brands/:id/products", (request, response) => {
	const{ id } = request.params;
	const productsByBrandId = products.filter(product => 
		product.categoryId === id);
	if(productsByBrandId.length == 0){
		response.writeHead(404, "No products available or brand ID incorrect");
		response.end();
	}
	response.writeHead(200, "Request for products by brand was successful", {"Content-Type": "application/json"});
	response.end(JSON.stringify(productsByBrandId));
})

// POST /api/login (Log user into page requiring username & password)
myRouter.post("/api/login", (request, response) => {
	// check to see if username and password were both entered, return user that matches username and password
	if (request.body.username && request.body.password){
		let user = users.find((user) => {
			return user.login.username == request.body.username && user.login.password == request.body.password;
		});
		// if there is already an existing access token, use that one
		if (user){
			let currentAccessToken = accessTokens.find((tokenObject) => {
				return tokenObject.username == user.login.username;
			});
			// update the lastUpdated value to a new time period
			if (currentAccessToken){
				currentAccessToken.lastUpdated = new Date();
				response.writeHead(200, "Request to login was successful", {"Content-Type": "application/json"});
				response.end(JSON.stringify(currentAccessToken.token));
			} else {
				// new token with user value and "random" generated token
				let newAccessToken = {
					username: user.login.username,
					lastUpdated: new Date(),
					token: uid(16)
				}
			accessTokens.push(newAccessToken);
        	response.writeHead(200, "Successful Login", {'Content-Type': 'application/json'});
    		response.end(JSON.stringify(newAccessToken.token));
			}
		} else {
			response.writeHead(401, "The username or password was incorrect.");
			response.end();
		}
	} else {
		// user is missing a parameter
		response.writeHead(400, "Server could not understand the request due to invalid syntax or formatting.");
		response.end();
	}
});

// GET /api/me/cart (Get all the products that are in the user's cart.)
myRouter.get("/api/me/cart", (request, response) => {
	// check to validate access token with helper function, if invalid token then return error message 404
	let validAccessToken = getValidTokenFromRequest(request);
	if(!validAccessToken){
		response.writeHead(404, "User not found, You must have authentication to get the requested response.");
		response.end();
	} else {
		let userAccessToken = accessTokens.find((tokenObject) => {
			return tokenObject.token == request.headers.token;
		});
		let user = users.find((user) => {
			return user.login.username == userAccessToken.username;
		})
		if(!user){
			response.writeHead(404, "User not found, You must have authentication to get the requested response.");
      		response.end();
      		return;
		} else {
			response.writeHead(200, "Request to retrieve user's cart was successful.", {"Content-Type": "application/json"});
			response.end(JSON.stringify(user.cart));
		}
	}
});

// PUT /api/me/cart (Allows user to update quantities of items in their cart.)
myRouter.put("/api/me/cart", (request, response) => {
	let validAccessToken = getValidTokenFromRequest(request);
	if(!validAccessToken){
		response.writeHead(404, "User not found, You must have authentication to get the requested response.");
		response.end();
	} else {
		let userAccessToken = accessTokens.find((tokenObject) => {
			return tokenObject.token == request.headers.token;
		});
		let user = users.find((user) => {
			return user.login.username == userAccessToken.username;
		})
		if(!user){
			response.writeHead(404, "User not found, You must have authentication to get the requested response.");
      		response.end();
      		return;
		} else {
			const updatedQuantities = request.body.updatedQuantities;
			user.cart.forEach((item, i) => {
				item.quantity = updatedQuantities[i];
			})
			response.writeHead(200, "Successfully updated user's cart", {"Content-Type": "application/json"});
			response.end(JSON.stringify(user.cart));
		}
	}
});

// POST /api/me/cart/:productId (Adds a product to the user's cart. If product exists in cart already, increase quantity)
myRouter.post("/api/me/cart/:productId", (request, response) => {
	// check to validate access token with helper function, if invalid token then return error message 404
	let validAccessToken = getValidTokenFromRequest(request);
	if(!validAccessToken){
		response.writeHead(404, "User not found, You must have authentication to get the requested response.");
		response.end();
	} else {
		let userAccessToken = accessTokens.find((tokenObject) => {
			return tokenObject.token == request.headers.token;
		});
		let user = users.find((user) => {
			return user.login.username == userAccessToken.username;
		})
		if(!user){
			response.writeHead(404, "User not found, You must have authentication to get the requested response.");
      		response.end();
      		return;
		} else {
			const { productId } = request.params;
			const validProductId = products.find(product => 
				product.id == productId);
			if (!validProductId) {
				response.writeHead(400, "server could not understand the request due to invalid syntax or formatting");
				response.end();
			}
			const existingProductInCart = user.cart.find(product => product.id == productId);
			if (!existingProductInCart){
				const productToAddInCart = products.filter(product => product.id == productId);
				Object.assign(productToAddInCart[0], {"quantity": 1})
				user.cart.push(productToAddInCart[0]);
			} else {
				existingProductInCart.quantity += 1;
			}
			response.writeHead(200, "Successfully added product to user's cart.", {"Content-Type": "application/json"});
			response.end(JSON.stringify(user.cart));
		}
	}
})

// function that checks whether token is valid or expired
const getValidTokenFromRequest = (request) => {
	if (request.headers.token) {
	  let currentAccessToken = accessTokens.find((accessToken) => {
		return accessToken.token == request.headers.token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
	  });
	  if (currentAccessToken) {
		return currentAccessToken;
	  } else {
		return null;
	  }
	} else {
	  return null;
	}
  };

// export server to use in server-test file
module.exports = server;