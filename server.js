const http = require('http');
const fs = require('fs')
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const newAccessToken = uid(16);


const Brand = require('./app/models/brand')
const User = require('./app/models/user');
const Cart = require('./app/models/cart')
const { isArray } = require('util');


// State holding variables
let users = [];
let brands = [];
let products = [];
let accessTokens = [
  {
    username: "lazywolf342",
    token: '8W0m7DtqNT9WnfAZ'
  }
];

const exampleProduct = {
  "id": "10",
  "categoryId": "1",
  "name": "Test Glasses",
  "description": "Glasses to help test stuff!",
  "price": 15,
  "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.urlencoded({
  extended: true
}));
myRouter.use(bodyParser.json());


let server = http.createServer(function (req, res) {
  myRouter(req, res, finalHandler(req, res));

}).listen(8080, err => {
  if (err) {
    return console.log('Error on Server Startup: ', err);
  }

  fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  console.log(`Server is listening on 8080`);
});

// Returns an array of all the brands we carry
myRouter.get('/api/brands', function(req,res) {
	res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(Brand.getAll()));
});

// Returns all the sunglasses for a particular brand
myRouter.get('/api/brands/:id/products', function(req, res) {
 let reqBrandProducts = Brand.getBrandProd(req.params.id);

 console.log(reqBrandProducts);
  if (reqBrandProducts.length > 0) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.statusCode = 200;
    return res.end(JSON.stringify(reqBrandProducts));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.statusCode = 404;
    return res.end(JSON.stringify('Brand not found.'));
  }
});

// Returns all sunglasses
myRouter.get('/api/products', function(req,res) {
	res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(Brand.getAllProd()));
});

// Allows user to send log in information to attempt login
// and creates an access token for them
// POST /api/login
myRouter.post('/api/login', (req, res) => {
	res.writeHead(200, { "Content-Type": "application/json" });
  // Make sure there is a username and password in the req
  if (req.body.username && req.body.password) {
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      // We have a successful login, if we already have an existing access token, use that.
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      
       // Update the last updated value so we get another time period
       if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        // console.log(accessTokens);

        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
  } else {
     // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the res
     res.writeHead(400, "Incorrectly formatted res");
     return res.end();
  }
});


// Helper method to process access token
var getValidTokenFromRequest = function(req) {
  // Get the access token from the url
  var parsedUrl = require('url').parse(req.url, true);

  // Verify the access token 
  let currentAccessToken = accessTokens.find((token) => {
      return token.token == parsedUrl.query.accessToken;
  });

  if (currentAccessToken) {
    // console.log(`This is the current access token: ${currentAccessToken}`);
    return currentAccessToken;
  } else {
    return null;
  }
};

const getUserFromToken = (token) => {
  console.log(token);
//   // Find the user's username by using the current access token
  let foundToken = accessTokens.find((user)=> {
    return user.username == token.username;
  })
//   // Use filter method on users array to skip over users without the matching access token
  let foundUser = users.filter(function(user) {
  if (foundToken.username !== user.login.username) {
    return false;
  }
    return true;
  // Return the user that has the matching access token
  }).map(user => {
    if (user.login.username == foundToken.username) {
      return user;
    };
  });
  return foundUser;
};

// Returns the user's cart
// must log in first to push fresh access token into array
myRouter.get('/api/me/cart', (req, res) => {
  // Pass req url into helper method
  let currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    res.writeHead(404, "You need to be logged in to view this.");
    return res.end();
  } else {
    let foundUser = getUserFromToken(currentAccessToken);
    console.log(foundUser[0].cart);
  // Return the user's cart in an stringified object
    return res.end(JSON.stringify(foundUser[0].cart));
  }
});

// Add a product to the user's cart by sending the product id in the req.body
myRouter.post('/api/me/cart', (req, res) => {
  // Pass req url into helper method to retrieve access token
  let currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    res.writeHead(404, "You need to be logged in to view this.");
    return res.end();
  } else {
    let foundUser = getUserFromToken(currentAccessToken);
  
    if (req.body.id) {
    const product = products.find(p => p.id == req.body.id)

      if (product) {
        foundUser[0].cart.push(product);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(foundUser[0].cart));
      }    
    };
  }
});

// Deletes a product using the product id from the user's cart
myRouter.delete('/api/me/cart/:productId', (req, res) => {

  let currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    res.writeHead(404, "You need to be logged in to view this.");
    return res.end();
  } else {
    let foundUser = getUserFromToken(currentAccessToken);
    
    // To check user's cart contents BEFORE deleting product
    console.log(`This is the found user's cart ${JSON.stringify(foundUser[0].cart)}`);

    // Get the product from the productId in req parameters
    // returns the product to be deleted as an object
    let reqProduct = Cart.getProdFromId(req.params.productId);
    console.log(reqProduct);

    let matchedProd;
    
    // Matches the product to be deleted, makes sure it's actually there
    foundUser[0].cart.filter(p => {
      return p.id == reqProduct.id
    }).map((p) => {
     // matchedProd will be an obj
      matchedProd = p;
      return p;
    });
    if (!matchedProd) {
      res.writeHead(404, "That item is not in your cart.");
      return res.end();
    } else {
      console.log(matchedProd);

      // Creates a new cart...
      const newCart = foundUser[0].cart.filter(p => {
        return p.name !== matchedProd.name
      });
      
      foundUser[0].cart = newCart;
      console.log(foundUser[0].cart);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newCart));
    }
  }
});

// Changes the quantity of a product in the user's cart
myRouter.post('/api/me/cart/:productId', (req, res) => {
  // Pass req url into helper method
  let currentAccessToken = getValidTokenFromRequest(req);
  if (!currentAccessToken) {
    res.writeHead(404, "You need to be logged in to view this.");
    return res.end();
  } else {
    let user = getUserFromToken(currentAccessToken);
    const cart = user[0].cart;

    // Get the product from the productId in req parameters
    // returns the product to be deleted as an object
    let product = Cart.getProdFromId(req.params.productId);

    // Will send quantity in req.body
    const updateQuant = req.body.quantity;

    // Check the quantity already existing in cart
    const currentQuant = (arr) => {
      var count = 0;
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].name == product.name) {
          count++
        }
      };
      return count;
    };
    
    let currentCount = currentQuant(cart);
    if (currentCount < 0) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.statusCode = 403;
      return res.end(JSON.stringify('You don\'t have that item in your cart.'));
    }

    console.log(currentCount);
    console.log(updateQuant);

    // Subtract already existing quantity from desired quantity
    // use that number in for loop
    const diff = updateQuant - currentCount;
   
    // If diff < 0, remove that product from the array
    
    let newCart;

    if (diff <= 0) {
      newCart = cart.filter(p => {
        return p.name !== product.name
      }).map(p => {
       return p;
      });
    } else {
      newCart = cart.map(p => p)
      }
      for (let i = currentCount; i <= diff; i++) {
        newCart.push(product)
      };
      console.log(newCart);
      res.end(JSON.stringify(newCart));
    } 
  }

);

module.exports = server;
