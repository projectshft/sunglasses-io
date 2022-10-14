const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser  = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');

const PORT = 3001;
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (req, res) {
  res.writeHead(200);
  router(req, res, finalHandler(req, res))
})

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"))
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
})
//GET all brands
router.get("/app/brands", (request, response) => {
  if (!brands) {
    response.writeHead(404, "That brands do not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});
//GET all products
router.get("/app/products", (request, response) => {
  // const parsedUrl = url.parse(request.originalUrl);
  // const { query } = querystring.parse(parsedUrl.query);
  // let productsToReturn = [];
  // if (query !== undefined) {
  //   productsToReturn = products.filter(product =>
  //     product.name.toLowerCase().includes(query)
  //   );

  //   if (!productsToReturn) {
  //     response.writeHead(404, "There aren't any products to return");
  //     return response.end();
  //   }
  // } else {
  //   productsToReturn = products;
  // }
  // response.writeHead(200, { "Content-Type": "application/json" });
  // return response.end(JSON.stringify(productsToReturn));
  if (!products) {
    response.writeHead(404, "No products found");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

//GET products of specified brand
router.get('/app/brands/:id/products', (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id == id);
  if (!brand) {
    response.writeHead(404, "No products of this brand found");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    product => product.categoryId == id
  );
  return response.end(JSON.stringify(relatedProducts));

})

//POST login user
router.post('/app/login', (request,response)=>{
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, {'Content-Type': 'application/json'});
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

//helper func
var getValidTokenFromRequest = function(request) {
  var parsedUrl = url.parse(request.url, true);
  if (parsedUrl.query.accessToken) {
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

//GET cart of logged in user
router.get('/app/me/cart', function(request, response){
  const currentAccessToken = getValidTokenFromRequest(request)
  if(currentAccessToken){
      const currentUser = users.find(
        (user) => user.login.username === currentAccessToken.username
      );
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(currentUser.cart))
  } else {
    response.writeHead(401, "You need to log in to see this page")
    return response.end()
  }
})

//POST product to cart of logged in user
router.post("/app/me/cart", (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request)
  if(currentAccessToken){
    const { productId } = request.body
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );
    const productToAdd = products.find(
      (product) => product.id === productId
    );
    if (!productId){
      response.writeHead(404, "No products with this id found");
      return response.end();
    }
    const checkIfProductInCart=currentUser.cart.find(product=>product.id===productId)
    if(!checkIfProductInCart){
        currentUser.cart.push({
        product: productToAdd,
        quantity: 1,
        id: productToAdd.id
      })
    }
    else {
      const index=currentUser.cart.indexOf(checkIfProductInCart)
      currentUser.cart[index].quantity++
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(currentUser.cart));
  }
  else {
    response.writeHead(401, "You need to log in to see this page")
    return response.end()
  }
});

//DELETE product (based on its id placed in path) from cart of logged in user
router.delete("/app/me/cart/:productId", (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request)
  if(currentAccessToken){
    const { productId } = request.params;
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );
    const productToDelete = currentUser.cart.find(product => product.id === productId)
    if (!productToDelete) {
      response.writeHead(404, "That product doesn't exist");
      return response.end();
    }
    const cartToReturn=currentUser.cart.filter(product=>product.id !== productToDelete.id)
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cartToReturn));
  }
  else {
    response.writeHead(401, "You need to log in to see this page")
    return response.end()
  }
});

//POST change quantity of product (based on its id placed in path) from cart of logged in user
router.post("/app/me/cart/:productId", (request, response) => {
  const currentAccessToken = getValidTokenFromRequest(request)
  if(currentAccessToken){
    const { productId } = request.params;
    const currentUser = users.find(
      (user) => user.login.username === currentAccessToken.username
    );
    const productToUpdate = currentUser.cart.find(product => product.id === productId)
    if (!productToUpdate) {
      response.writeHead(404, "That product doesn't exist for being updated");
      return response.end();
    }
    productToUpdate.quantity = request.body.quantity;
    const cartToReturn=currentUser.cart
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cartToReturn));
  }
  else {
    response.writeHead(401, "You need to log in to see this page")
    return response.end()
  }
});

module.exports = server