const http = require('http');
const fs = require('fs')
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const newAccessToken = uid(16);


const Brand = require('./app/models/brand')
const User = require('./app/models/user')


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





//TODOS



// Setup router
var myRouter = Router();
myRouter.use(bodyParser.urlencoded({
  extended: true
}));
myRouter.use(bodyParser.json());


let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));

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
myRouter.get('/api/brands', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Brand.getAll()));
});

// Returns all the sunglasses for a particular brand
myRouter.get('/api/brands/:id/products', function(request, response) {
 let reqBrandProducts = Brand.getBrandProd(request.params.id);

 console.log(reqBrandProducts);
  if (reqBrandProducts.length > 0) {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.statusCode = 200;
    return response.end(JSON.stringify(reqBrandProducts));
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.statusCode = 404;
    return response.end(JSON.stringify('Brand not found.'));
  }
});

// Returns all sunglasses
myRouter.get('/api/products', function(request,response) {
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Brand.getAllProd()));
});

// Allows user to send log in information to attempt login
// and creates an access token for them
// POST /api/login
myRouter.post('/api/login', (request, response) => {
	response.writeHead(200, { "Content-Type": "application/json" });
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      // We have a successful login, if we already have an existing access token, use that.
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      
       // Update the last updated value so we get another time period
       if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        // console.log(accessTokens);

        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
     // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
     response.writeHead(400, "Incorrectly formatted response");
     return response.end();
  }
});


// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  // Get the access token from the url
  var parsedUrl = require('url').parse(request.url, true);

  // Verify the access token 
  let currentAccessToken = accessTokens.find((token) => {
      return token.token == parsedUrl.query.accessToken;
  });

  if (currentAccessToken) {
    console.log(currentAccessToken);
    return currentAccessToken;
  } else {
    return null;
  }
};

// Returns the user's cart
// must log in first to push fresh access token into array
myRouter.get('/api/me/cart', (request, response) => {
  // Pass request url into helper method
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(404, "You need to be logged in to view this.");
    return response.end();
  } else {
  // Find the user's username by using the current access token
    let foundToken = accessTokens.find((user)=> {
      return user.username == currentAccessToken.username;
    })
  // Use filter method on users array to skip over elements that do not match criteria
    let foundUser = users.filter(function(user) {
      if (foundToken.username !== user.login.username) {
        return false;
      }
      return true;
  //   // Return the element that does match the criteria
    }).map(user => {
      if (user.login.username == foundToken.username) {
        return user;
      };
    });
    console.log(foundUser[0].cart);
  // Return the user's cart in an stringified object
    return response.end(JSON.stringify(foundUser[0].cart));
  }
});

// Adds a product to the user's cart by using the request.body
myRouter.post('/api/me/cart', (request, response) => {
  // Pass request url into helper method
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(404, "You need to be logged in to view this.");
    return response.end();
  } else {
    // Could make helper function for this too idk
    let foundToken = accessTokens.find((user)=> {
      return user.username == currentAccessToken.username;
    })
    // Use filter method on users array to skip over elements that do not match criteria
    let foundUser = users.filter(function(user) {
      if (foundToken.username !== user.login.username) {
        return false;
      }
      return true;
    }).map(user => {
      if (user.login.username == foundToken.username) {
        return user;
      };
    });
    // console.log(request.body);
    // Will send item to be pushed into user's cart in the request body
    foundUser[0].cart.push(request.body);
    // Return the user's cart in an stringified object
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(foundUser[0].cart));
  }
})

// Deletes a product using the product id from the user's cart
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  // Pass request url into helper method
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(404, "You need to be logged in to view this.");
    return response.end();
  } else {
    let foundToken = accessTokens.find((user)=> {
      return user.username == currentAccessToken.username;
  })
   // Use filter method on users array to skip over elements that do not match criteria
  let foundUser = users.filter(function(user) {
    if (foundToken.username !== user.login.username) {
      return false;
    } return true;
    }).map(user => {
      if (user.login.username == foundToken.username) {
        return user;
      };
    });

    // To check user's cart contents BEFORE deleting product
    console.log(`This is the found user's cart ${JSON.stringify(foundUser[0].cart)}`);


    // Get the product from the productId in req parameters
    // returns the product to be deleted as an object
    let reqProduct = User.getProdFromId(request.params.productId);

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
      response.writeHead(404, "That item is not in your cart.");
      return response.end();
    } else {
      console.log(matchedProd);

      // Creates a new cart...
      const newCart = foundUser[0].cart.filter(p => {
        return p.name !== matchedProd.name
      });
      
      foundUser[0].cart = newCart;
      console.log(foundUser[0].cart);
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(newCart));
    }
  }
});



module.exports = server;


// To work with spaces, use %20 in between words.
