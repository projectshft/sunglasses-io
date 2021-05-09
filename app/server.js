var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var querystring = require('querystring');
const url = require("url");
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// state holding variables
const PORT = process.env.PORT || 3005;
let brands = [];
let users = [];
let products = [];
let accessTokens = [];
let failedLoginAttempts = {};
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

 /*------------------------- Setup router ------------------------- */
const myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer((req, res) => {
	res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
}).listen(PORT, err => {
	if (err) throw err;
	console.log(`server running on port ${PORT}`);
	//populate state holding variables
	brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
	products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));
	users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
});


/*------------------------- Helper functions ------------------------- */
//success response writeHead
const success = (res) => res.writeHead(200, { "Content-Type": "application/json" });

//to GET number of failed requests per username
const getNumFailedLoginReqForUsername = (username) => {
  let currentNumberOfFailedRequests = failedLoginAttempts[username];
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests;
  } else {
    return 0;
  };
};

//to SET number of failed requests per username
const setNumbFailedLoginReqForUsername = (username, numFails) => {
  failedLoginAttempts[username] = numFails;
};

//to GET access token from req
const getValidTokenFromreq = (req) => {
  const token = req.headers.accesstoken;
  if (token) {
    // Verify the access token to make sure its valid and not expired
    let currentAccessToken = accessTokens.find(item => {
      return item.token == token && ((new Date) - item.lastUpdated) < TOKEN_VALIDITY_TIMEOUT; 
    });
    if (currentAccessToken) {
      return currentAccessToken
    } else {
      return null;
    };
  } else {
    return null;
  };
};

// to verify a user has valid accessToken
const verifyUser = (currentAccessToken) => {
	let user = users.find(user => user.login.username == currentAccessToken.username);
	return user;
	}; 

// to GET user cart for a valid user
const getCartForValidAccessToken = (currentAccessToken, res) => {
	if (!currentAccessToken) {
		res.writeHead(401, "You need to have access to this call to continue");
		return res.end();
	} else {
		const user = verifyUser(currentAccessToken)
		let userCart = user.cart
		return userCart
	};
};

// to add a quantity of product to a user cart	
const handleCartProductQuantity = (productId, quantity, userCart) => {
	const itemToAdd = products.find(product => product.id == productId);
	itemToAdd.quantity = parseInt(quantity);
	const itemToAddAsArray = [itemToAdd];
	userCart.push(itemToAdd);
};

/*------------------------------ Routes -------------------------------- */
// GET brands
myRouter.get('/api/brands', (req, res) => {
	success(res);
  return res.end(JSON.stringify(brands));
});

// GET products
myRouter.get('/api/products', (req, res) => {
	const parsedUrl = url.parse(req.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
	let productsToReturn = [];

	if (query !== undefined) {
    productsToReturn = products.filter(product => product.description.includes(query));
		if (!productsToReturn) {
			res.writeHead(404, "There aren't any product descriptions containing that search term");
			return res.end();
		}; 
	} else {
			productsToReturn = products
		};

	success(res);
	return res.end(JSON.stringify(productsToReturn));
});

// GET products by ID
myRouter.get('/api/brands/:id/products', (req, res) => {
	const { id } = req.params;
	const reqBrand = brands.find(brand => brand.id == id);
	if (!reqBrand) {
		res.writeHead(404, "Requested brand not found in store");	
		return res.end();
	} else {
		const reqBrandProducts = products.filter(product => product.categoryId == reqBrand.id);
		success(res);
		return res.end(JSON.stringify(reqBrandProducts));
	};
});

// POST login credentials
myRouter.post('/api/me/login', (req, res) => {
  // Check req has username & password, & get # failed logins for username
  if (req.body.username && req.body.password && getNumFailedLoginReqForUsername(req.body.username) < 3) {
    // See if there is a user that has that username and password
    let user = users.find(user => user.login.username == req.body.username && user.login.password == req.body.password);
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumbFailedLoginReqForUsername(req.body.username,0);
			// writehead for succesful response since correct login 
      success(res);
      // Check for already existing access token for username
      let currentAccessToken = accessTokens.find(tokenObject => tokenObject.username == user.login.username);
      // If existing token exists, update time
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      } else {
				// No existing access token found, create one
				let newAccessToken = {
					username: user.login.username,
					lastUpdated: new Date(),
					token: uid(16)
				};
				accessTokens.push(newAccessToken);
				return res.end(JSON.stringify(newAccessToken.token));
      };
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumFailedLoginReqForUsername(req.body.username);
      setNumbFailedLoginReqForUsername(req.body.username,++numFailedForUser);
      // Login failed, inform client
      res.writeHead(401, "Login failed");
      return res.end();
    };
  } else {
    // Login failed, missing parameter
    res.writeHead(400, "Login failed.");
    return res.end();
  };
});

// GET logged-in user cart
myRouter.get('/api/me/cart', (req, res) => {
  let currentAccessToken = getValidTokenFromreq(req);
  if (!currentAccessToken) {
    res.writeHead(401, "Aceess requires login");
    return res.end();
  } else {
		const user = verifyUser(currentAccessToken) 
		let userCart = user.cart 	
    if (!userCart) {
      res.writeHead(404, "That cart cannot be found");
      return res.end();
    } else {
			success(res);
      return res.end(JSON.stringify(userCart));
		};
  }; 
});

// POST to a logged-in user cart
myRouter.post('/api/me/cart', (req, res) => {
  let currentAccessToken = getValidTokenFromreq(req);
	const { quantity, productId } = req.body
	let userCart = getCartForValidAccessToken(currentAccessToken, res)
	if (!userCart) {
		res.writeHead(404, "That cart cannot be found");
		return res.end();
	} else {
		success(res);
		handleCartProductQuantity(productId, quantity, userCart)
		return res.end(JSON.stringify(userCart));
	};
});

// POST to a loegged-in user cart, product quantity change
myRouter.post('/api/me/cart/:productId', (req, res) => {
  let currentAccessToken = getValidTokenFromreq(req);
	const productId = req.params.productId;
	const quantity = req.body.quantity;
	let userCart = getCartForValidAccessToken(currentAccessToken, res);
	if (!userCart) {
		res.writeHead(404, "That cart cannot be found");
		return res.end();
	} else {
		if (quantity < 1) {
			res.writeHead(404, "1 is the min. valid cart quantity.");
			return res.end();
		};
		success(res);
		handleCartProductQuantity(productId, quantity, userCart);
		return res.end(JSON.stringify(userCart));
	};
});


myRouter.delete('/api/me/cart/:productId', (req,res) => {
  let currentAccessToken = getValidTokenFromreq(req);
	const productId  = req.params.productId
	let userCart = getCartForValidAccessToken(currentAccessToken, res);
	if (!userCart) {
    res.writeHead(404, "That cart cannot be found");
    return res.end();
    } else {
			let cartWithoutDeletedProduct = userCart.filter(product => product.id !== productId);
			if (!cartWithoutDeletedProduct) {
				res.writeHead(404, "Invalid productId.");
				return res.end();
			};
			success(res);
			userCart = cartWithoutDeletedProduct
      return res.end(JSON.stringify(userCart));
		};
});

module.exports = server;