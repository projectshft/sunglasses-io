const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const Cart = require('./Cart')

const PORT = 3001;
let brands = [];
let products = [];
let users = [];
const newAccessToken = uid(16);
let accessTokens = [];

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
})

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"))
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));
  });


router.get("/app/brands", (request, response) => {
  if (!brands) {
    response.writeHead(404, "That brands do not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

router.get("/app/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product =>
      product.name.includes(query)
    );

    if (!productsToReturn) {
      response.writeHead(404, "There aren't any products to return");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  if (sort !== undefined) {
    productsToReturn.sort((a, b) => a[sort] - b[sort]);
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

router.get('/app/brands/:id/products', (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id == id);
  if (!brand) {
    response.writeHead(404, "No products of this brand found");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    product => product.categoryId === id
  );
  return response.end(JSON.stringify(relatedProducts));

})

router.get("/app/cart", (request, response) => {
// is this correct ? 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(Cart.getAll()));
});

router.post("/app/cart", (request, response) => {
// is this correct ? 
	const updatedCart = Cart.addCart(request.body)
  
	response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(updatedCart));
});

router.delete("/app/cart/:productId", (request, response) => {
  const { productId } = request.params;
  const product = cart.find(product => product.id == productId)
  if (!product) {
    response.writeHead(404, "That product doesn't exist");
    return response.end();
  }
  const cartToReturn=Cart.remove(product.id)
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(cartToReturn));
});

router.put("/app/cart/:productId", (request, response) => {
  const foundProduct = Cart.getProduct(request.params.productId)
// how could I get access to a new quantity that user is supposed to input? is it in request.body ? 
  const quantityToChange= request.body
  if (!foundProduct) {
    response.writeHead(404, "That product doesn't exist");
    return response.end();
  }
  const updatedCart=Cart.updateCart(foundProduct,quantityToChange)
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(updatedCart));
});

router.post('/api/login', (request,response)=>{
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

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
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


module.exports = server;