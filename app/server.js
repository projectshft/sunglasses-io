var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);


const PORT = 3001;

//  helper functions & variables  ************************

let brands = [];
let accessTokens = [];

// A variable to limit validity of access tokens to 30 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

var getValidTokenFromRequest = function(request) {
    var parsedUrl = require('url').parse(request.url,true)
    if (parsedUrl.query.accessToken) {
      // Verify the access token to make sure its valid and not expired
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

  const getValidUserFromToken = function(token) {
    if (token) {
      const currentUser = users.find(user => user.login.username === token.username);
      return currentUser;
    }
    return null;
  };



// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    // setting up Brands, Products and Users
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
});

//****************************************************************************/
// All users of API can access --- public
myRouter.get("/api/brands", (request, response) => {
    if (!brands) {
        response.writeHead(404, 'No brands found', {
            "Content-Type": "application/json"
        });
        response.end();
    }
    response.writeHead(200, 'Retrieved all brands', {
        "Content-Type": "application/json"
    });
    response.end(JSON.stringify(brands));

});

//****************************************************************************/
// products by brand-ID  --- public
myRouter.get('/api/brands/:id/products', (request, response) => {

    const {id} = request.params;
    let findBrandId = brands.find(brand => {
        return brand.id === request.params.id;
    });
    if (!findBrandId) {
        response.writeHead(404, 'Brand not found with this ID', {
            "Content-Type": "application/json"
        });
        response.end();
    }
    const brandAfterFilter = products.filter(filteredBrand => filteredBrand.categoryId === id);
    response.writeHead(200, 'All products with this brand ID', {
        "Content-Type": "application/json"
    });
    response.end(JSON.stringify(brandAfterFilter));
});

//****************************************************************************/
// GET all products /api/products    --- public
myRouter.get("/api/products", (request, response) => {
    if (!products) {
        response.writeHead(404, 'No products found', {
            "Content-Type": "application/json"
        });
        response.end();
    }
    response.writeHead(200, {
        'Content-Type': 'application/json'
    });
    response.end(JSON.stringify(products));
});

//****************************************************************************/
// POST /api/login rout
myRouter.post('/api/login', (request, response) => {
    //check for password and username was included in request
    if (request.body.username && request.body.password) {
      //verify that request is matching user in database
      let user = users.find(user => {
        return (
          user.login.username == request.body.username &&
          user.login.password == request.body.password
        )
      })
      if (user) {
        //when successful, return json header
        response.writeHead(
          200,
          Object.assign({
            'Content-Type': 'application/json'
          })
        )
        // We have a successful login, if we already have an existing access token, use that
        let currentAccessToken = accessTokens.find(accessToken => {
          return (
            accessToken.token == new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
          )
        })
        // Update the last updated value so we get another time period
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date()
          response.end(JSON.stringify(currentAccessToken.token))
          return
        } else {
          // Create a new token with the user value and a "random" token
          let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }
          accessTokens.push(newAccessToken)
          response.end(JSON.stringify(newAccessToken.token))
          return
        }
      } else {
        // When a login fails, tell the client in a generic way that either the username or password was wrong
        response.writeHead(406, 'Invalid username or password.')
        response.end()
        return
      }
    } else {
      //if there was no username or password in the request, throw a 405
      response.writeHead(405, 'You must enter your username and password.')
      response.end()
      return
    }
  })
    //****************************************************************************/
    // GET /api/me/cart
  myRouter.get('/api/me/cart', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)
    if (!currentAccessToken) {
      response.writeHead(400, 'Access not authorized')
      response.end()
      return
    } else {
      // search for user by username parameters 
      let user = users.find(user => {
        return user.login.username == currentAccessToken.username
      })
      response.writeHead(
        200,
        Object.assign({
          'Content-Type': 'application/json'
        })
      )
      //show cart if the user is logged in
      response.end(JSON.stringify(user.cart))
      return
    }
  })
  //****************************************************************************/
  // POST api/me/cart
  myRouter.post('/api/me/cart/:id', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)
    
    if (!currentAccessToken) {
      response.writeHead(
        409,
        'no access, log-in failed'
      )
      response.end()
      return
    } else {
      // find user if logged in
      let user = users.find(user => {
        return user.login.username == currentAccessToken.username
      })
  
      //filter for the products with the appropriate product Id
      let productToAdd = products.find(product => {
          console.log(request.params)
          console.log(product.id)
        return product.id == request.params.id
      })
  
      //see if the product in already in the cart by productId
      let searchForProduct = user.cart.find(item => {
        return item.product.id == request.params.id
      })
      //if there are no products with the brand Id, a 409 error should be thrown
      if (!productToAdd) {
        response.writeHead(409, 'not found')
        response.end()
        return
      } else if (searchForProduct) {
        // if the product is already in the cart, increase the quantity
        searchForProduct.quantity += 1
        response.writeHead(201, 'item already in the cart, increased quantity by 1')
        response.end()
        return
      } else {
        //if the product is not in the cart, create a new cartItem
        let cartItem = {}
        cartItem.quantity = 1
        cartItem.product = productToAdd
        user.cart.push(cartItem)
        response.writeHead(
          200,
          Object.assign({
            'Content-Type': 'application/json'
          })
        )
        response.end(JSON.stringify(user.cart))
        return
      }
    }
  })
  
  
  


// export to test file for Chai
module.exports = server


