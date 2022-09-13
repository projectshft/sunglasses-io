var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const hostname ='localhost';
const port = 8080;

const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
let router = Router();
router.use(bodyParser.json());

let server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS'){
    res.writeHead(200, CORS_HEADERS);
    return res.end();}
  router(req, res, finalHandler(req, res));}).listen(port);


router.get('/api/brands', (req, res) => {
   res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
    let brandArry = JSON.stringify(['gucci', 'oakley', 'mk']);
    return res.end(brandArry);
  
});
    

router.get('/api/brands/:id/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  if(id === 'gucci')
    {
      let dummyProducts = ["gucciSwg1", "gucciSwg2", "gucciSwg3"];
      return res.end(dummyProducts);
    }
    else 
      {
        return res.end(JSON.stringify({ message: "specified brand id was not found"}))
      }
  
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
})
    
router.post('/api/login', (req, res) => {
  res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type' : 'application/json'}));
  const users = [{username: 'BorisJ', password: 'userPass123'}];
      const accessTokens = [{username: 'BorisJ', lastUpdated: '2022-08-29', token: "1234567890"}];
        if(req.method === "POST" && req.body.username && req.body.password) {
          // See if there is a user that has that username and password
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password;
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the res will be json
      res.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));

      // We have a successful login, if we already have an existing access token, use that
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

module.exports = server;