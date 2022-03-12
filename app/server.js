var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 5050;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];


// Setup router
const router = Router();
router.use(bodyParser.json());

// Server setup
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

//Listen on port
server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  //populate brands  
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

});

//Route for brands
router.get('/api/brands', (req,res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
});



//Route for all products
router.get('/api/products', (req,res) => {

  const parsedUrl = url.parse(req.url,true);
  const query = parsedUrl.query;
  let {q} = query

  let queriedProducts = [];

  if(q === undefined || q.length === 0) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(products));
  }

  else if (q.length>0) {
    queriedProducts = products.filter(p => p.name.trim().toLowerCase().includes(q.trim().toLowerCase()));
      if(queriedProducts.length > 0 ) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(queriedProducts));
      }
      else {
      res.writeHead(404, 'No products were found related to your search term');
      return res.end();
     }
  }
});



//Route for products of a specific brand
router.get('/api/brands/:id/products', (req, res) => {
  const {id} = req.params;
  const brandProducts= products.filter(p => p.categoryId === id);

  if (brandProducts.length === 0) {
    res.writeHead(404, 'No products by this brand were found');
    return res.end();
  }

  else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brandProducts));
  }
});


//Route for login information
router.post('/api/login', (req, res) => {
    // Make sure there is a username and password in the request
    if (req.body.username && req.body.password) {
      // See if there is a user that has that username and password
      let user = users.find((user) => {
        return user.login.username === req.body.username && user.login.password === req.body.password;
      });

      //If user, success and then retrieve an existing or create an access token
      if (user) {
        res.writeHead(200, {'Content-Type': 'application/json'});
  
      //Checking for already existing token
        let currentAccessToken = accessTokens.find((tokenObject) => {
          return tokenObject.username == user.login.username;
        });
  
        // // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          return res.end(JSON.stringify(currentAccessToken.token));
        } 
        
        else {
        //   // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }

          //Returning a token ONLY so account for this in testing
          accessTokens.push(newAccessToken);
          return res.end(JSON.stringify(newAccessToken.token));
        }
      } 
      
      else {
        //Failed login
        res.writeHead(401, "Invalid username or password");
        return res.end();
      }
  }   
  //Missing parameters in login
  else {
    res.writeHead(400, "Please enter both a valid username and passport");
    return res.end();
  }
});


//Route for cart
router.get('/api/me/cart', (req,res) => {
let currentAccessToken = getValidTokenFromRequest(req);

if (!currentAccessToken) {
  res.writeHead(401, "You need to be logged in to see your cart");
  return res.end();
} 

else {
  res.writeHead(200, {'Content-Type': 'application/json'})
  let user = users.find((user) => (user.login.username == currentAccessToken.username) )
  return res.end(JSON.stringify(user.cart));
  }
})


router.post('/api/me/cart', (req,res) => {
  let currentAccessToken = getValidTokenFromRequest(req);
  
  if (!currentAccessToken) {
    res.writeHead(401, "You need to be logged in to add to your cart");
    return res.end();
  } 
  
  let product = products.find(p => p.id === req.body.id);
  
  if (!product) {
    res.writeHead(400, "There is no product to add to cart");
        return res.end();
  }

  //Only throwing an error here is the name or price is missing. The rest of the info seems optional
//   if( product.name === undefined || product.price === undefined ) {
//     res.writeHead(400, "This product is missing vital information");
//     return res.end();
// }

  let item = {
   product: product,
   quantity: 1
  }
  
  res.writeHead(200, {'Content-Type': 'application/json'})
  let user = users.find((user) => (user.login.username === currentAccessToken.username) )
 
  user.cart.push(item);
 return res.end(JSON.stringify(user.cart));  
   
})

// DELETE a product
router.delete('/api/me/cart/:productId', (req,res) => {
  let currentAccessToken = getValidTokenFromRequest(req);
  
  //Invalid or lack of access token
  if (!currentAccessToken) {
    res.writeHead(401, "You need to be logged in to delete from your cart");
    return res.end();
  } 
  
  //First find user
 let user = users.find((user) => (user.login.username === currentAccessToken.username) )

 // Then product - which was pushed as an item so the ID is nested
 const foundProduct = user.cart.find(item => item.product.id === req.params.productId)
    
   
  if (!foundProduct) {
      res.writeHead(404, "Product was not found");	
      return res.end();
    }
    
  // Remove product from cart list and have that reflected in user.cart
  //This is to delete the ENTIRE product - not just one (that is below)
  const updatedCart = user.cart.filter(item => item.product.id !== foundProduct.product.id)

  user.cart = updatedCart;

  res.writeHead(200, {'Content-Type': 'application/json'})
  return res.end(JSON.stringify(user.cart));
  
  });

  // below means to change the quantity of a product#
// # POST /api/me/cart/:productId
router.post('/api/me/cart/:productId', (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);
  
  if (!currentAccessToken) {
    res.writeHead(401, "You need to be logged in to make changes to your cart");
    return res.end();
  } 
  
  //Product from route and then the quantity that is requested
  let product = products.find(p => p.id === req.params.productId);

  if (!product) {
    res.writeHead(400, "There is no such product to update");
      return res.end();
  }

  let {quantity} = req.body

  if (!quantity || quantity < 1 || isNaN(quantity)) {
    res.writeHead(400, "Enter a sufficient quantity to update");
    return res.end();
}

//If all of that passes, then find user, the product to update 
const user = users.find((user) => (user.login.username === currentAccessToken.username) )
const foundProduct = user.cart.find(item => item.product.id === req.params.productId)


if (!foundProduct) {
  res.writeHead(404, "Product was not found in your cart");	
  return res.end();
}

if (quantity === Number(foundProduct.quantity)) {
  res.writeHead(400, "The stated quantity is already in the cart");
  return res.end();
}

//Find id of product whose quantity needs to be updated and update
let id = user.cart.indexOf(foundProduct);

  user.cart[id].quantity = quantity
  res.writeHead(200, {'Content-Type': 'application/json'})
  return res.end(JSON.stringify(user.cart));
});




// Helper method to process access token
const getValidTokenFromRequest = (req) => {
  const parsedUrl = require('url').parse(req.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes




module.exports = server;