var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var url = require('url');
var SUCCESS_HEADER = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication", 'Content-Type':'application/json'}
var FAILURE_HEADER = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication", 'Content-Type':'application/json'}
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;
var brands = [];
var users = [];
var failedLogins = {};
var accessTokens = [];
var products = [];
var tokenChecker = (accessToken) => {
  let validToken = accessTokens.find((token) => {
    return token.token == accessToken && ((new Date()) - token.lastRenewed) < TOKEN_VALIDITY_TIMEOUT;
  })
  return validToken
}



const PORT = 3001;

var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
        return console.log('Error on Server Startup: ', error)
      }
      fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
      });
      fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
      });
      fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
      });
      console.log(`Server is listening on ${PORT}`);    
});

myRouter.get('/api/brands', function(request, response){
  response.writeHead(200, SUCCESS_HEADER);
  return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function(request,response){
//get the requested ID from request object
  var requestedId = request.params.id;
//check to see if an ID was sent
  if(requestedId){
    var requestedBrand = brands.find((brand) => {
      return brand.id == requestedId;
    })
    //Check to make sure that the ID corresponds with a brand
    if(requestedBrand){
    //end response and send the products associated with that brand
      var requestedProducts = products.filter((product) =>{
        return product.categoryId == requestedBrand.id;
      });
      response.writeHead(200, SUCCESS_HEADER);
      return response.end(JSON.stringify(requestedProducts));
    }
    //if ID does not match up with brand respond with error and say no brand found
    else {
      response.writeHead(400, FAILURE_HEADER);
      return response.end(JSON.stringify({code: 400, message: 'Brand associated with ID not found'}))
    }
  }
  //if ID was not sent, respond with error and say ID not sent. Not sure how this would even happen.
  else {
    response.writeHead(400, FAILURE_HEADER);
    return response.end(JSON.stringify({code: 400, message: 'No ID was sent, please refer to Swagger'}))
  }
});
//search bar
myRouter.get('/api/products', function(request, response){
  let urlParts = url.parse(request.url, true).query;
  let search = urlParts.query;
  //See if query was sent
  if(search){
    let searchedProducts = products.filter((product) =>{
      return product.name.toUpperCase().includes(search.toUpperCase());
    });
    let searchedBrands = brands.filter((brand) => {
      return brand.name.toUpperCase().includes(search.toUpperCase());
    });
     //see if query corresponds to any products or to any brands
    if(searchedProducts.length !== 0 || searchedBrands.length !== 0){
      //send back products and brands if at least one of them has data
      response.writeHead(200, SUCCESS_HEADER);
      return response.end(JSON.stringify({products: searchedProducts, brands: searchedBrands}))

    }
    else {
      //send error back if no products or brands correspond to the query
      response.writeHead('400', FAILURE_HEADER);
      return response.end(JSON.stringify({code: 400, message: 'No products or brands match that query'}));
    }
  }
  else {
  //send error back if query not sent
    response.writeHead(400, FAILURE_HEADER);
    return response.end(JSON.stringify({code: 400, message: "Query not sent"}));
  }
});

myRouter.post('/api/login', function(request, response){
  //create failed login username property init at 0
  if(request.body.username && !failedLogins[request.body.username]){
    failedLogins[request.body.username] = 0
  }
  //check if username and password are provided and failed login is less than 3 
  if(request.body.username && request.body.password && failedLogins[request.body.username] < 3){
    let submittedUsername = request.body.username;
    let submittedPassword = request.body.password;
    let matchedUser = users.find((user) => {
      return user.login.username == submittedUsername && user.login.password == submittedPassword
    });
    //see if username and password match one of the users
      if(matchedUser){
        failedLogins[submittedUsername] = 0;
        let loginToken = accessTokens.find((token) => {
          return token.username == matchedUser.login.username;
        });
        //see if user already has access token
        if(loginToken){
          
      //if they have access token refresh the time on the token and return token
          loginToken.lastRenewed = new Date();
          response.writeHead(200, SUCCESS_HEADER);
          return response.end(JSON.stringify(loginToken.token));
        }
        //if user does not have token create a new token
        else {
          let newToken = {
            username: matchedUser.login.username,
            lastRenewed : new Date(),
            token: uid(16)
          }
          accessTokens.push(newToken);
          response.writeHead(200, SUCCESS_HEADER);
           return response.end(JSON.stringify(newToken.token));
        }
      }
      //return error if the username or password do not match
      else {
        failedLogins[submittedUsername] ++
        response.writeHead(400, FAILURE_HEADER);
        return response.end(JSON.stringify({code: 400, message: 'Username or password invalid'}));
      }
  }
  //return error if username and password are not provided
  else {
    response.writeHead(400, FAILURE_HEADER);
      return response.end(JSON.stringify({code: 400, message: 'Username or password not provided'}));
  }
});

myRouter.get('/api/me/cart', function(request, response){
  let urlParts = url.parse(request.url, true).query;
  let accessToken = urlParts.accessToken;
  //See if accessToken was sent
  if(accessToken){
    //see if token is valid and not expired
    let validToken = tokenChecker(accessToken)
    if(validToken){
      //find user that the token is associated with
      let currentUser = users.find((user) => {
        return validToken.username == user.login.username
      });
      //see if user exists
      if(currentUser){
        response.writeHead(200, SUCCESS_HEADER);
        return response.end(JSON.stringify(currentUser.cart));
      }
      else {
        //if user cannot be found return error user not found 
        response.writeHead(400, FAILURE_HEADER);
        //does this header bad for security?
        return response.end(JSON.stringify({code: 400, message:'Associated User cannot be found'}));
      }
    }
    else {
      //tell user they must log back in if invalid token
      response.writeHead(400, FAILURE_HEADER)
        return response.end(JSON.stringify({code: 400, message:'Token not valid or expired. Please sign in again'}));
    }
  }
  //send back error that accessToken was not sent 
  else {
    response.writeHead(400, FAILURE_HEADER);
    return response.end(JSON.stringify({code: 400, message: "Access Token not sent"}));
  }
});

myRouter.post('/api/me/cart', function(request, response){
  let urlParts = url.parse(request.url, true).query;
  let accessToken = urlParts.accessToken;
  let requestedId = request.body.id;
  //See if accessToken and product Id were sent
  if(accessToken && requestedId){
    let validToken = tokenChecker(accessToken)
    //see if token is valid and not expired
    if(validToken){
      //find user that the token is associated with
      let currentUser = users.find((user) => {
        return validToken.username == user.login.username
      });
      //see if user exists
      if(currentUser){
        //see if the product id matches a product in data
        let requestedProduct = products.find((product) => {
          return product.id == requestedId
        });
        if(requestedProduct){
          //add that product to users cart
          let foundProduct = currentUser.cart.find((product) =>{
             return product.name == requestedProduct.name
          });
          // if the product is not already in the cart, create copy of product and add quantity 1 to it and return the updated obj
          if(!foundProduct){
            let productCopy = Object.assign({}, requestedProduct);
            productCopy.quantity = 1
            currentUser.cart.push(productCopy);
            response.writeHead(200, SUCCESS_HEADER)
            return response.end(JSON.stringify(productCopy));
          }
          //if the product is already in the cart add 1 to the quantity and return the updated object
          foundProduct.quantity ++;
          response.writeHead(200, SUCCESS_HEADER);
          return response.end(JSON.stringify(foundProduct));
        }
        //if product id does not match send back error that product does not exist
        else{
          response.writeHead(400, FAILURE_HEADER)
            return response.end(JSON.stringify({code: 400, message: 'Product does not exist'}));
        }
      }
      else {
        //if user cannot be found return error user not found 
        response.writeHead(400, FAILURE_HEADER);
        //does this header bad for security?
        return response.end(JSON.stringify({code: 400, message:'Associated User cannot be found'}))
      }
    }
    else {
      //tell user they must log back in if invalid token
      response.writeHead(400, FAILURE_HEADER)
        return response.end(JSON.stringify({code: 400, message:'Token not valid or expired. Please sign in again'}));
    }
  }
  //send back error that product Id or accessToken was not sent 
  else {
    response.writeHead(400, FAILURE_HEADER);
    return response.end(JSON.stringify({code: 400, message:"Product Id or Token not sent"}));
  }
});

myRouter.post('/api/me/cart/:cartIndex', function(request, response){
  let urlParts = url.parse(request.url, true).query;
  let accessToken = urlParts.accessToken;
  let cartIndex = request.params.cartIndex;
  let indexInt = parseInt(cartIndex, 10);
  let requestedQuantity = request.body.quantity;
  //see if accessToken and CartIndex and Quantity were sent
  if(accessToken && cartIndex && requestedQuantity){
    //see if accessToken is a valid and not expired token
    let validToken = tokenChecker(accessToken)
    let currentUser = users.find((user) =>{
      return user.login.username == validToken.username;
    });
    if(validToken && currentUser){
      //see if quantity is not negative or 0 and whole
      if(requestedQuantity > 1 && Number.isInteger(requestedQuantity)){
        //make sure product at that index exists
        let foundProduct = currentUser.cart[indexInt];
        if(foundProduct){
          foundProduct.quantity = requestedQuantity;
          response.writeHead(200, SUCCESS_HEADER);
            return response.end(JSON.stringify(foundProduct));
        }
        else {
          response.writeHead(400, FAILURE_HEADER);
          return response.end(JSON.stringify({code: 400, message: 'product not found in users cart'}));
        }

      }
      //if negative or not int send back error
      else{
        response.writeHead(400, FAILURE_HEADER)
        return response.end(JSON.stringify({code: 400, message: "quantity is a negative number or not an integer"}));
      }
    }
    //if not valid send back error
    else{
      response.writeHead(400, FAILURE_HEADER)
      return response.end(JSON.stringify({code: 400, message: 'token not valid please sign in again'}));
    }
  }
  //if accessToken and CartIndex and Quantity were not sent send back error
  else {
    response.writeHead(400, FAILURE_HEADER)
    return response.end(JSON.stringify({code: 400, message: 'Token, productId, or quantity not sent'}));
  }

});

myRouter.delete('/api/me/cart/:cartIndex', function(request, response){
  let indexInt = parseInt(request.params.cartIndex, 10);
  let urlParts = url.parse(request.url, true).query;
  let accessToken = urlParts.accessToken;
//check if cartIndex and accessToken were sent
  if(indexInt || indexInt == 0 && accessToken){
    //check that accessToken is valid
    let validToken = tokenChecker(accessToken);
    let currentUser = users.find((user) =>{
      return user.login.username == validToken.username
    });
    if(validToken && currentUser){
      //check there is a product at the given index
      let foundProduct = currentUser.cart[indexInt];
      if(foundProduct){  
      //delete the product at the provided cart index
        currentUser.cart.splice(indexInt, 1);
        response.writeHead(200, SUCCESS_HEADER);
        return response.end(JSON.stringify(currentUser.cart));
      }
      else{     
      //if there is no product at the index return error
      response.writeHead(400, FAILURE_HEADER)
      return response.end(JSON.stringify({code: 400, message: 'Product in cart was not found'}));
      }
    }
    else {
      //if token not valid send error
      response.writeHead(400, FAILURE_HEADER)
      return response.end(JSON.stringify({code: 400, message:'Token invalid please sign in again'}));
    }
  }
  else {
    //if not send respond back an error
    response.writeHead(400, FAILURE_HEADER)
      return response.end(JSON.stringify({code: 400, message: 'cartIndex or token not sent'}));
  }
});



