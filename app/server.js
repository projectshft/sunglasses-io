const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const queryHandler = require('../utils/queryHandler');
const arrayEquals = require('../utils/arrayEquals');
const postErrorMessage = require('../utils/postErrorMessage');
const validApiKeys = require('../initial-data/validApiKeys');

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let products = [];
let brands = [];
let cart = [];
let users = [];
let accessTokens = [

];

let server = http.createServer( (req, res) => {
  if (!validApiKeys.includes(req.headers["x-authentication"])) {
    res.writeHead(401)
    res.end('Must enter a valid API key')
  }

  myRouter(req, res, finalHandler(req, res))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/products.json', "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/brands.json', "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/users.json', "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data)
    console.log(`Server setup: ${users.length} users loaded
    Listening on PORT ${PORT}`);
  });
});

//LOGIN STEPS
/* 
$$$ 1) create a valid API Key database (https://parsity.teachable.com/courses/1377241/lectures/31787299)
$$$ 2) Inside the server, check that the header of the request contained the API Key in the x-authentication (https://parsity.teachable.com/courses/1377241/lectures/31787299)
3) Build login POST method (https://parsity.teachable.com/courses/1377241/lectures/31790907)
4) Build a getValidTokenFromRequest function (https://parsity.teachable.com/courses/1377241/lectures/31806852)
5) Make the tokens expire (https://parsity.teachable.com/courses/1377241/lectures/31806852)
6) Check for access token in each of the /cart methods
  GET /cart
  POST /cart
  DELETE /cart
  DELETE /cart/:id
*/

//match tests to work

myRouter.post('/login', (req, res) => {
  const reqUsername = req.body.username;
  const reqPassword = req.body.password

  const usernameAndPassword = users.find(user => user.login.username === reqUsername && user.login.password === reqPassword)
  
  // if (!reqUsername || !reqPassword) {
  //   res.writeHead(401)
  //   res.end('Must enter a username and password')
  // } else if (!usernameAndPassword) {
  //   res.writeHead(401)
  //   res.end('Invalid username or password')
  // } else {
  //   res.writeHead(201)
  //   res.end('good so far')
  // }
/*
  If we already have an existing access token, use that

  Update the last updated value of the existing token so we get another time period before expiration

  Create a new token with the user value and a "random" token

  When a login fails, tell the client in a generic way that either the username or password was wrong

  If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
*/

  //create a new accessToken
    let newAccessToken = {
      username: reqUsername,
      lastUpdated: new Date()
      //last updated
      //token
    }
    accessTokens.push(newAccessToken)
    console.log(accessTokens)
    res.end()

  
})

myRouter.get('/sunglasses', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(products))
})

myRouter.delete('/sunglasses', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete this resource')
})

myRouter.get('/sunglasses/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(brands))
})

myRouter.delete('/sunglasses/brands', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete this resource')
})

myRouter.get('/sunglasses/:product', (req, res) => {
  if (queryHandler(products, req)) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(queryHandler(products, req)))
  } else {
    res.writeHead(404)
    res.end('searched product not found')
  }
})

myRouter.get('/sunglasses/brands/:brand', (req, res) => {
  if (queryHandler(brands, req)) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(queryHandler(brands, req)))
  } else {
    res.writeHead(404)
    res.end('searched brand not found')
  }
})

myRouter.post('/cart', (req, res) => {
  const toPost = req.body

  const canonList = [ 'id', 'categoryId', 'name', 'description', 'price', 'imageUrls' ]
  let listToCheck = []

  
  for (let prop in toPost) {
    listToCheck.push(prop)
  }

  if (!arrayEquals(canonList, listToCheck)) {
    res.writeHead(404)
    res.end(postErrorMessage)
  } else {
    cart.push(toPost)
    res.writeHead(201)
    res.end(`${toPost.name} posted to cart.`);
  }
})

myRouter.get('/cart', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(cart))
})

myRouter.delete('/cart', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete entire cart. Can only delete individual items')
})

myRouter.delete('/cart/:id', (req, res) => {
  const reqID = req.params.id

  let isMatched = false;

  cart.map(obj => {
    if (obj.id === reqID) {
      isMatched = true;
    }
  })
  
  if (!isMatched) {
    res.writeHead(404)
    res.end('The item ID does not match any items in your cart.');
  } else {
    let indexForObjectToDelete;

    cart.map((obj, i) => {
      if (obj.id === reqID) {
        indexForObjectToDelete = i;
        cart.splice(indexForObjectToDelete, 1)
      }
    })
    res.writeHead(201)
    res.end(`Item successfully removed from the cart`)
  }
})

module.exports = server;