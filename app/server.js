const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;

const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods": "*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000


let users = []
let products = []
let brands = []
let tokens = []
let loginAttempts = []

const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer((request, response) => {
  if (request.method === 'OPTIONS'){
    response.writeHead(200, CORS_HEADERS);
    response.end();
  }
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
  if (error) {
    return console.log('Error on Server Startup: ', error)
  }
  fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

myRouter.post('/api/login', function(request, response) {
  const rejectYou = (request, response) => {
    response.writeHead(401, "password or username not accepted", CORS_HEADERS)
    return response.end()
  }

  // Make sure there is a username and password in the request
  if (!request.body.username || !request.body.password) {
    response.writeHead(400, "please enter both your username and password", CORS_HEADERS)
    return response.end()
  }

  const previousAttempts = loginAttempts.find( (attempt) => {
    return attempt.username === request.body.username
  })

  if (previousAttempts && previousAttempts.attempts >=3) {
    response.writeHead(401, "too many login attempts", CORS_HEADERS)
    return response.end()
  }
  // See if there is a user that has that username and password 
  const validUser = users.find( (user) => {
    return user.login.username === request.body.username && user.login.password === request.body.password
    //if successful, remove user from no-no file
  })
  // When a login fails, tell the client in a generic way that either the username or password was wrong
  if (!validUser) {
    if (previousAttempts) {
      previousAttempts.attempts ++
    }
    else {
      loginAttempts.push({"username":request.body.username,"attempts":1})
    } 
    return rejectYou(request,response)
  }
  // Write the header because we know we will be returning successful at this point and that the response will be json
  response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'})
  if (previousAttempts) {
    const indexToRemove = loginAttempts.indexOf(previousAttempts)
    loginAttempts.splice(indexToRemove,1)
  }
  // If we already have an existing access token, use that
  const currentToken = tokens.find( (token) => {
    return token.user === request.body.username && token.token
  })
  if (currentToken) {
    currentToken.lastUpdate = new Date()
    return response.end(JSON.stringify(currentToken.token))
  }
    // Create a new token with the user value and a "random" token
  else {
    const token = uid(16)
    tokens.push({"user":request.body.username, "token":token, "lastUpdate": new Date()})
    return response.end(JSON.stringify(token))
  }
})

myRouter.get('/api/products', function(request,response) {
  response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
  let productNames = products.map( (product) => {
    return {"name": product.name, "id": product.id, "price":product.price}
  })
  response.end(JSON.stringify(productNames));
})

myRouter.get('/api/products/:productId', function(request,response) {
  response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
  const productId = request.params.productId
  const product = products.find((product) => {
    return product.id == productId
  })
  response.end(JSON.stringify(product));
})

myRouter.get('/api/brands', function(request,response) {
  response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
  let brandNames = brands.map( (brand) => {
    return {"name": brand.name, "id": brand.id}
  })
  response.end(JSON.stringify(brandNames));
})

myRouter.get('/api/brands/:id/products', function(request,response) {
  response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
  const brandId = request.params.id
  const productNames = products.filter((product) => {
    return product.categoryId == brandId
  })
  response.end(JSON.stringify(productNames));
})

const getValidTokenFromRequest = (request) => {
  const parsedUrl = require('url').parse(request.url,true)
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = tokens.find((accessToken) => {
      let tokensMatch = (accessToken.token == parsedUrl.query.accessToken)
      let tokenNotExpired = ((new Date) - accessToken.lastUpdate) < TOKEN_VALIDITY_TIMEOUT
      return  tokensMatch && tokenNotExpired
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

//lets a user view their cart
myRouter.get('/api/me/cart', function(request,response) {
  let validToken = getValidTokenFromRequest(request)
  let authUser = users.find((user) => {
    return validToken.user === user.login.username
  })
  if (!validToken){
    response.writeHead(401, "Session Expired, please login again", CORS_HEADERS)
    return response.end()
  }
  else {
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    return response.end(JSON.stringify(authUser.cart))
  } 
});

//lets a user add an item to their cart
myRouter.post('/api/me/cart/:productId', function(request,response) {
  let validToken = getValidTokenFromRequest(request)
  let authUser = users.find((user) => {
    return validToken.user === user.login.username
  })
  if (!validToken){
    response.writeHead(401, "Session Expired, please login again", CORS_HEADERS)
    return response.end()
  }
  else {
    const product = products.find((product) => {
      return product.id == request.params.productId
    })
    if (product) {
      authUser.cart.push(product)
      response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
      return response.end(JSON.stringify(authUser.cart))
    }
    else {
    response.writeHead(404, "Invalid Product Id", CORS_HEADERS)
    return response.end()
    }
  } 
});

//lets a user delete a single item from their cart
myRouter.delete('/api/me/cart/:productId', function(request,response) {
  let validToken = getValidTokenFromRequest(request)
  let authUser = users.find((user) => {
    return validToken.user === user.login.username
  })
  if (!validToken){
    response.writeHead(401, "Session Expired, please login again", CORS_HEADERS)
    return response.end()
  }
  else {
    const deletedProductIndex = authUser.cart.findIndex((item) => {
      return item.id == request.params.productId
    })
    if (deletedProductIndex != -1) {
      authUser.cart.splice(deletedProductIndex,1)
      response.writeHead(200, {...CORS_HEADERS, 'Access-Control-Allow-Headers': '*'});
      return response.end(JSON.stringify(authUser.cart))
    }
    else {
      response.writeHead(404, "Invalid Product Id", CORS_HEADERS)
      return response.end()
    }
  }
});

//lets a user delete all items from their cart
myRouter.delete('/api/me/cart', function(request,response) {
  let validToken = getValidTokenFromRequest(request)
  let authUser = users.find((user) => {
    return validToken.user === user.login.username
  })
  if (!validToken){
    response.writeHead(401, "Session Expired, please login again", CORS_HEADERS)
    return response.end()
  }
  else {
    authUser.cart =[]
    response.writeHead(200, {...CORS_HEADERS, 'Access-Control-Allow-Headers': '*'});
    return response.end(JSON.stringify(authUser.cart))
  } 
});