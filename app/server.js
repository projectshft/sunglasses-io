var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var uid = require('rand-token').uid;
var bodyParser = require('body-parser');
var url = require('url');

const PORT = 3001;

//initialize arrays to hold incoming data from the fs.readFile functions
var products = [];
var users = [];
var brands = [];
let accessTokens = [
  { token: 'qswWsnJLHJlcIHoY', username: 'yellowleopard753' }
];
//function to find the user of the currently used access token
const findTheUserOfTheCurrentAccessToken = xauth => {
  const findTheUserViaCurrentAccessToken = accessTokens.filter(index => {
    return index.token == xauth;
  });
  //filter the current user object from the users array
  let currentUserArray = users.filter(index => {
    return index.login.username == findTheUserViaCurrentAccessToken[0].username;
  });

  let currentUser = currentUserArray[0];
  return currentUser;
};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync('./initial-data/brands.json'));
    users = JSON.parse(fs.readFileSync('./initial-data/users.json'));
    products = JSON.parse(fs.readFileSync('./initial-data/products.json'));
  });

myRouter.get('/products', function(request, response) {
  //is there a query param?
  const myURL = request.url;
  const myQuery = url.parse(myURL).query;
  //if there is, return the relevant products
  if (myQuery) {
    //-------------add toUppercase if you have time----------------
    //user querystring to turn the query into an object
    const queryObject = queryString.parse(myQuery);
    //get the array for the products matching the query param
    const productsMatchingQuery = products.filter(index =>
      index.title.includes(queryObject.query)
    );
    //check if search returned no results
    if (productsMatchingQuery.length === 0) {
      response.writeHead(404, 'No products match the search.');
      response.end();
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(productsMatchingQuery));
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(products));
});

myRouter.get('/brands', function(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:brandId/products', function(request, response) {
  //filter the products according to the brand argument
  const brandProductsByParam = products.filter(index => {
    return index.brandId === request.params.brandId;
  });
  //define variable to check if brand ID exists
  const doesBrandExist = brands.filter(index => {
    return index.brandId === request.params.brandId;
  });
  //check if brand exists
  if (doesBrandExist.length === 0) {
    response.writeHead(404, 'The brand ID is not valid');
    response.end();
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(brandProductsByParam));
});

myRouter.post('/login', function(request, response) {
  // Make sure there is a username and password in the request
  if (request.body.username && request.body.password) {
    // See if there is a user that has that username and password
    const user = users.find(user => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      //assign the user's acccess token to a variable if they have one
      let currentAccessToken = accessTokens.find(tokenObject => {
        return tokenObject.username == user.login.username;
      });
      //if there is a current token for the user, update the time
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
      } else {
        //create a new token with the user value
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        };
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
      }
    }
    response.writeHead(401, 'Invalid username or password');
    response.end();
  }
  //If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
  response.writeHead(400, 'Incorrectly formatted response');
  response.end();
});

myRouter.get('/me/cart', function(request, response) {
  //ensure user is logged in
  if (request.headers.xauth) {
    const findTheUserViaCurrentAccessToken = accessTokens.filter(index => {
      return index.token == request.headers.xauth;
    });
    if (findTheUserViaCurrentAccessToken.length == 0) {
      response.writeHead(400, 'The access token does not exist');
      response.end();
    }
    let currentUser = findTheUserOfTheCurrentAccessToken(request.headers.xauth);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(currentUser.cart));
  }
  response.writeHead(404, 'You must be logged in to view your cart');
  response.end();
});

myRouter.post('/me/cart', function(request, response) {
  //ensure user is logged in
  if (request.headers.xauth) {
    let currentUser = findTheUserOfTheCurrentAccessToken(request.headers.xauth);
    //find current user's index in users array
    const currentUserIndexInUsersArray = users.findIndex(
      index => index === currentUser
    );
    //extract the params
    const myURL = request.url;
    const myQuery = url.parse(myURL).query;
    const queryObject = queryString.parse(myQuery);
    const queryProductId = queryObject.productId;
    //is the item currenty in the cart?
    const isThisItemCurrentlyInTheCart = currentUser.cart.filter(index => {
      return index[queryProductId];
    });
    //if it is...
    if (isThisItemCurrentlyInTheCart.length > 0) {
      //find the cartItem and update the quantity in the users array
      users[currentUserIndexInUsersArray].cart.map(index => {
        let parsedQuant = parseInt(queryObject.quantity);
        index[queryProductId].quantity += parsedQuant;
      });

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(users[0].cart));
    }
    response.writeHead(
      405,
      'No item matching this ProductID is currently in the cart'
    );
    response.end();
  }
  response.writeHead(404, 'You must be logged in to edit your cart');
  response.end();
});

myRouter.post('/me/cart/:productId', function(request, response) {
  if (request.headers.xauth) {
    let currentUser = findTheUserOfTheCurrentAccessToken(request.headers.xauth);
    //find current user's index in users array
    const currentUserIndexInUsersArray = users.findIndex(
      index => index === currentUser
    );
    //assign productId param to a variable
    const productId = request.params.productId;
    //find out if the product is already in the cart
    const isProductAlreadyInCart = users[
      currentUserIndexInUsersArray
    ].cart.filter(index => {
      return index == productId;
    });
    //if it's not, add it
    if (isProductAlreadyInCart.length == 0) {
      //find the matching product object
      const targetProduct = products.find(index => {
        return index.productId == productId;
      });
      //create a new object to add to the cart
      const newCartItem = {};
      //format the new object with the product and quantity of 1
      newCartItem[productId] = {
        item: targetProduct,
        quantity: 1
      };
      //push the new item to the user's cart
      users[currentUserIndexInUsersArray].cart.push(newCartItem);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(users[currentUserIndexInUsersArray].cart));
    }
  }
  response.writeHead(404, 'You must be logged in to edit your cart');
  response.end();
});
//export http.createserver().listen() for testing
module.exports = server;
