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
const accessTokens = [{username: 'yellowleopard753', lastUpdated: '2022-08-29', token: "1234567890123456"}];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
let router = Router();
router.use(bodyParser.json());

// create function that grabs req.body access token, checks if token is present in the list of tokens, and returns the cart that belongs to the owner of the token




let server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS'){
    res.writeHead(200, CORS_HEADERS);
    return res.end();}
  router(req, res, finalHandler(req, res));
  console.log(`server is running at port ${port}`);
}
  ).listen(port);


router.get('/api/brands', (req, res) => {
   res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
    let brandArry = JSON.stringify(brands);
    return res.end(brandArry);
  
});
    

router.get('/api/brands/:id/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  if(req.params.id === 'gucci')
    {
      let dummyProducts = ["gucciSwg1", "gucciSwg2", "gucciSwg3"];
      res.writeHead(200, {'Content-Type': 'application/json'});
      return res.end(JSON.stringify(dummyProducts));
    }
    else 
      {
        return res.end(JSON.stringify({ message: "specified brand id was not found"}))
      }
  
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  return res.end(JSON.stringify(products));
})
    
router.post('/api/login', (req, res) => {
  // res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
 
  if(req.method === "POST" && req.body.username && req.body.password) {
          // See if there is a user that has that username and password
    let user = users.find((user) => {
    return user.login.username === req.body.username && user.login.password === req.body.password;
        });
  if (user) {
      // Write the header because we know we will be returning successful at this point and that the res will be json
    res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));

      // We have a successful login, if we already have an existing access token, use that
    let currentAccessToken = accessTokens.find((tokenObject) => {
    return tokenObject.username == user.username;
      });

      // Update the last updated value so we get another time period
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
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
    return res.end('Hakuna Matata! err #400, Incorrectly formatted response');
  }
})

const userCart = (req) => {
  let targetPerson = accessTokens.find((user) => user.token === req.body.accessToken); // return username from accessTokens that has same token as requested token (from cliend req)
  if(!targetPerson.username) { console.log('Error, invalid token')}
  let user = users.find(user =>  user.login.username === targetPerson.username); // find user by name and return from users db file
  return user.cart;
  }

router.get('/api/me/cart', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  // access request header with the token (?) and check if it matches token on file, then return cart data related to that token obj
  //req.body.token, refer to curr-m, create a f() to handle token. In real life this would be handled in req.body
  let cart = userCart(req);
  console.log(cart);
  return res.end(JSON.stringify(cart));
})

module.exports = server;