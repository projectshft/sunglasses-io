  
const http = require("http");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const fs = require("fs");
const url = require("url");
const querystring = require("querystring");
var uid = require('rand-token').uid;

let accessTokens = [
        {
          username: 'yellowleopard753',
          lastUpdated: 'Sun Jul 05 2020 19:18:49 GMT-0400 (Eastern Daylight Time)', 
          token: 'P180Xz67vPBraYsD'
        }
    ]; // for testing


//const Brand = require('./app/models/brand')

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
})

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate categories  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate goals
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

});

// Helper function for checking if user is logged in
const findUser = (req) => {

  let user;

    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == req.body.token;
    });

    if (currentAccessToken) {
      user = users.find((user) => {
        return user.login.username == currentAccessToken.username;
      });
    }
  

  return user;
}

const findProduct = (req) => {

  let product = products.find((product) => {
    return product.id == req.body.productId;
  })

  return product;
}


// Public route
myRouter.get('/brands', (req, res) => {

  const parsedUrl = url.parse(req.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  // Return all brands in the db

  let brandsToReturn = [];

  if (!query) {
    brandsToReturn = brands;
  } else {
    brands.map((brand) => {
      // standardizing all queries by going to lowercase
      if (brand.name.toLowerCase() === query.toLowerCase()) {
        brandsToReturn.push(brand);
      }
    })
  }

  if (brandsToReturn.length === 0) {
    res.writeHead(404, "There are no matching brands for your search");
    return res.end();
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(brandsToReturn));
  }
});

// Public
// GET /api/brands/:id/products
myRouter.get('/brands/:id/products', (req, res) => {
  const { id } = req.params;

  let productsToReturnById = [];

  products.map((product) => {

      if (product.categoryId === id) {
        productsToReturnById.push(product);
      }
    })


  if (productsToReturnById.length === 0) {
    res.writeHead(404, "Id not found");
    return res.end();
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(productsToReturnById));
  }

});

// Public
// GET /api/products
myRouter.get('/products', (req, res) => {

  const parsedUrl = url.parse(req.originalUrl);
  const { name, description } = querystring.parse(parsedUrl.query);


  let productsToReturn = [];

  // Both name and description
  if (name && description) {
    products.map((product) => {
      if ((product.name.toLowerCase()).includes(name.toLowerCase()) &&
      (product.description.toLowerCase()).includes(description.toLowerCase())) {
        productsToReturn.push(product);
      }
    })
  // Name, no description
  } else if (name && !description) {
    products.map((product) => {
      // standardizing all queries by going to lowercase
      if ((product.name.toLowerCase()).includes(name.toLowerCase())) {
        productsToReturn.push(product);
      }
    })
  //Description, no name
  } else if (!name && description) {
    products.map((product) => {
      if ((product.description.toLowerCase()).includes(description.toLowerCase())) {
        productsToReturn.push(product);
      }
    })
  // return all if unspecified
  } else {
    productsToReturn = products;
  }

  if (productsToReturn.length === 0) {
    res.writeHead(404, "There are no matching products for your search");
    return res.end();
  } else {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(productsToReturn));
  }
});

//Public
// POST /api/login
myRouter.post('/login', (req, res) => {

  if (req.body.username && req.body.password) {
    let user = users.find((user)=>{
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });
    if (user) {
      // No CORS for this project. Keep object to return access token
      res.writeHead(200, {'Content-Type': 'application/json'});

      // Check if logged-in user has an access token
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update user's access token with new timestamp
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
        console.log(accessTokens);
        console.log(newAccessToken)
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      // Login failure
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }

  } else {
    // Incorrect formatting
    res.writeHead(400, "Incorrectly formatted response");
    return res.end();
  }
});

// GET /api/me/cart
myRouter.get('/me/cart', (req, res) => { 

    let user = findUser(req);

    if (!user) {
      // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
      res.writeHead(401, "You need to have access to this call to continue");
      return res.end();
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(user.cart));
    }
  
});


// POST /api/me/cart
myRouter.post('/me/cart/', (req, res) => { 

  let user = findUser(req);
  let product = findProduct(req);

  if (!user) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else if (!product) {
      res.writeHead(404, "Product not found");
      return res.end();
    } else {
      user.cart.push(product);
      res.writeHead(200, "Product successfully added");
      return res.end();
    } 

});

// DELETE /api/me/cart/:productId
myRouter.delete('/me/cart/:productId', (req, res) => { 

  let user = findUser(req);
  const { productId } = req.params;

  if (!user) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else { 
    // Create new array based on filtering 
    let cartWithoutDeletedItem = user.cart.filter((product) => {
      return product.id !== productId;
    })
      // check: if filtered cart is the same length as user's cart, nothing was deleted
      // Send error message
      if (cartWithoutDeletedItem.length === user.cart.length) {
        res.writeHead(404, "Product not found in cart");
        return res.end();
      } else {
        user.cart = cartWithoutDeletedItem;
        res.writeHead(200, "Product successfully deleted");
        return res.end();
    }
  }

});

// POST /api/me/cart/:productId
myRouter.post('/me/cart/:productId', (req, res) => { 
  
  let user = findUser(req);
  const { productId } = req.params;


  if (!user) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    res.writeHead(401, "You need to have access to this call to continue");
    return res.end();
  } else if (req.body.quantity < 0) {
    res.writeHead(400, "Invalid quantity entered");
    return res.end();
  } else {

    // Create new array based on filtering 
    let newCart = user.cart.filter((product) => {
      return product.id !== productId;
    })

    for (i = 0; i < req.body.quantity; i++) {
      newCart.push(products.find((product) => product.id === productId))
    }

    user.cart = newCart;
    res.writeHead(200, "Product quantity successfully updated");
    return res.end();
  }

});

module.exports = server;