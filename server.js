var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication" };
const PORT = 3001;

let brands = [];
let products = [];
let users = [];
let failedLoginAttempts = [];
let accessTokens = [];


//15min timer till user needs new token
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; 

//setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    return res.end();
  }
  //data from local files
  fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
  fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
  });
  fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });

myRouter(req, res, finalHandler(req, res))

//helper functions below
//find specific cart item by id
const CartItemByProductId = (cart, productId) => {
    return cart.find((cartItem) => {
      return cartItem.product.id === productId;
    });
}

const findUsername = (username) => {
    return users.find((user) => {
      return user.login.username === username;
    });
}

//Checks accessTokens if the user already has a token or not 
const findTokenByUsername = (username) => {
    return accessTokens.find((token) => {
      return token.username === username;
    })
}
  
//checks for valid token or to renew it.
const verifyToken = (req) => {
    //get token from url 
    let query = queryString.parse(req._parsedUrl.query);
    if (query.accessToken) {
      //checks to see if token has expired 
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token === query.accessToken
          && new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT;
      });
      //will update its time if valid token found
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return currentAccessToken;
      }
    }
}

  //get the list for brands
myRouter.get('/api/brands', (req, res) => {
    res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    return res.end(JSON.stringify(brands))
})

  //get a brand's particular product with its ID
myRouter.get('/api/brands/:brandId/products', (req, res) => {

    let ItemsRequested = products.filter((product) => {
      return product.categoryId === req.params.brandId;
    });
    //On success get the products from that brand
    if (ItemsRequested.length) {
      res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}))
      return res.end(JSON.stringify(ItemsRequested));
    } else {
      //if not found get error
      res.writeHead(401, "The brand was not found");
      return res.end();
    }
});


  myRouter.get('/api/products', (req, res) => {
    let query = queryString.parse(req._parsedUrl.query);
    if (query.search) {
      let queryItem = query.search.toLowerCase();
      res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      //lowercase to make it easier to search
      let productsMatchingQuery = products.filter((product) => {
        return product.name.toLowerCase().includes(queryItem)
          || product.description.toLowerCase().includes(queryItem);
      });


      return res.end(JSON.stringify(productsMatchingQuery));

    } else {
      res.writeHead(400, "Search term required");
      return res.end();
    }
  });

  myRouter.post('/api/login', (req, res) => {
    
    let validUser = users.find((user) => {
      return user.login.username === req.body.username
        && user.login.password === req.body.password;
    });

    if (validUser) {
      res.writeHead(200, CORS_HEADERS);
      let currentAccessToken = findTokenByUsername(req.body.username);

      let newAccessToken = null;
      if (currentAccessToken) {
        newAccessToken = currentAccessToken.token;
        currentAccessToken.lastUpdated = new Date();
      } else {
        newAccessToken = uid(16);
        accessTokens.push({
          username: req.body.username,
          token: newAccessToken,
          lastUpdated: new Date()
        })
      }
      return res.end(newAccessToken);
    } else {
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
    if (!req.body.username || !req.body.password) {
      
        res.writeHead(400, "Username and password needed to login")
        return res.end();
      }

  });

  myRouter.get('/api/me/cart', (req, res) => {
    let validToken = verifyToken(req);
    if (!validToken) {
      res.writeHead(401, "Invalid token");
      return res.end();
    } else {
      let loggedInUser = findUsername(validToken.username)
      res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
      return res.end(JSON.stringify(loggedInUser.cart));
    }
  });

  myRouter.post('/api/me/cart', (req, res) => {
    let validToken = verifyToken(req);
    if (!validToken) {
      res.writeHead(401, "Invalid token");
      return res.end();
    }
    let itemRequested = products.find((product) => {
      return product.id == req.body.productId;
    });

    if (!itemRequested) {
      res.writeHead(401, "Invalid product ID")
      return res.end();
    }

    res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}))


    let loggedInUser = findUsername(validToken.username);

    let requestedItemInCart = CartItemByProductId(loggedInUser.cart, itemRequested.id)

    if (requestedItemInCart) {
      requestedItemInCart.quantity += req.body.quantity;
    } else {
      loggedInUser.cart.push({
        product: requestedProduct,
        quantity: req.body.quantity
      });
    }
    return res.end(JSON.stringify(loggedInUser.cart));
  });

  //delete items in the cart that match ID
  myRouter.delete('/api/me/cart/:productId', (req, res) => {
    let validToken = verifyToken(req);
    if (!validToken) {
      res.writeHead(401, "Invalid token");
      return res.end();
    }

    let loggedInUser = findUsername(validToken.username);
    let itemDelete = CartItemByProductId(loggedInUser.cart, req.params.productId);
    if (!itemDelete) {
      res.writeHead(401, "Product not valid");
      return res.end();
    }
    let deleteItembyIndex = loggedInUser.cart.indexOf(itemDelete);
    loggedInUser.cart.splice(deleteItembyIndex, 1);

    res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    return res.end(JSON.stringify(loggedInUser.cart))
  });

  myRouter.post('/api/me/cart/:productId', (req, res) => {
    let validToken = verifyToken(req);
    if (!validToken) {
      res.writeHead(401, "Invalid token");
      return res.end();
    }

    let query = queryString.parse(req._parsedUrl.query);
    let itemsToAdd = query.quantity;

    let loggedInUser = findUsername(validToken.username);
    let updateProduct = CartItemByProductId(loggedInUser.cart, req.params.productId);
    if (!updateProduct) {
      res.writeHead(401, "Product was not found");
      return res.end();
    }
    let newQuantity = parseInt(itemsToAdd) + updateProduct.quantity;
    if (newQuantity < 1) {
      res.writeHead(401, "amount of items must be greater than zero")
    }

    updateProduct.quantity = newQuantity;

    res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
    return res.end(JSON.stringify(loggedInUser.cart))
  });

}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
});
