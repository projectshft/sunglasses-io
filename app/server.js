var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const hostname ='localhost';
const port = 8080;
const users = JSON.parse(fs.readFileSync('./initial-data/users.json'));
const brands = JSON.parse(fs.readFileSync('./initial-data/brands.json'));
const products = JSON.parse(fs.readFileSync('./initial-data/products.json'));
const accessTokens = [{username: 'yellowleopard753', lastUpdated: '2022-12-01', token: "123456789ABCDEF"}];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
let router = Router();
router.use(bodyParser.json());



let server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS'){
    res.writeHead(200, CORS_HEADERS);
    return res.end();}
  router(req, res, finalHandler(req, res));
}
  ).listen(port);


router.get('/api/brands', (req, res) => {
   res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
    let brandArray = JSON.stringify(brands);
    return res.end(brandArray);
  
});
    

router.get('/api/brands/:id/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  let requestedProd = products.find(product => product.id === req.params.id);
  if(!requestedProd) {
    res.writeHead(404, 'Cannot find rquested product');
    res.end();
  }
  res.writeHead(200, 'Request Successful!');
  res.end(JSON.stringify(requestedProd));
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  return res.end(JSON.stringify(products));
})
    
router.post('/api/login', (req, res) => {
 
  if(req.method === "POST" && req.body.username && req.body.password) {
    let user = users.find((user) => {
    return user.login.username === req.body.username && user.login.password === req.body.password;
        });
  if (user) {
    res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    let currentAccessToken = accessTokens.find((tokenObject) => {
    return tokenObject.username == user.username;
      });
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        
        let newAccessToken = {
          username: user.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }

  } else {
    res.writeHead(400, "Incorrectly formatted res");
    return res.end();
  }
})

const userCart = (req, res) => {
  let targetPerson = accessTokens.find((user) => user.token === req.body.accessToken); 
  if(!targetPerson.username) {
    console.log('Error, invalid token');
    res.writeHead(404, 'User Not Found!');
    return res.end();
  }
  let user = users.find(user =>  user.login.username === targetPerson.username); 
  return user.cart;
  }

router.get('/api/me/getcart', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  if(!req.body.accessToken) {
    res.writeHead(401, 'Unauthorized user!');
    return res.end();
  }
  let cart = userCart(req);
  res.writeHead(200, 'Success!')
  res.end(JSON.stringify(cart));
})

router.post('/api/me/cart', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  let tokenIsPresent = accessTokens.find(token => token.token === req.body.accessToken)
  if(!tokenIsPresent) {
    res.writeHead(401, "Invalid/missing access token");
    return res.end();
  }
  let cart = userCart(req);
  let productToAdd = products.find(product => product.id === req.body.productId);
  cart.push(productToAdd);
  fs.writeFileSync('./initial-data/users.json', JSON.stringify(users, null, 2));
  res.writeHead(201, 'Product Successfully Added to Cart');
  res.end(JSON.stringify(cart));
})

router.delete('/api/me/cart/:productId/delete', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  if(!req.body.accessToken) { 
    res.writeHead(401, 'Unauthorized user!');
    return res.end();
  } else { 
      let cart = userCart(req);
      let indexOfProductToDelete = cart.findIndex(product => product.id === req.params.productId);
      if( indexOfProductToDelete === -1 ) {
        res.writeHead(404, 'Product not Found');
        return res.end();
      } 
      cart.splice(indexOfProductToDelete, 1); 
      fs.writeFileSync('./initial-data/users.json', JSON.stringify(users, null, 2));
      res.writeHead(200, 'Product Has Been Deleted');
      return res.end(JSON.stringify(cart));
    
  }
})

router.post('/api/me/cart/:productId', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  if(!req.body.accessToken) {
    res.writeHead(401, 'Unauthorized user!');
    return res.end();
  } else {
    let cart = userCart(req);
    let requestedProd = cart.find( product => product.id === req.params.productId);
    if(!requestedProd) {
      res.writeHead(404, 'Incorrect Product Id');
      return res.end();
    }
    requestedProd.quantity = req.body.newCount;
    fs.writeFileSync('./initial-data/users.json', JSON.stringify(users, null, 2));
    res.writeHead(200, 'Cart Has Been Updated!');
    res.end(JSON.stringify(cart));
  }
})

module.exports = server;