const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const fs = require('fs');

const uid = require('rand-token').uid;
let accessToken = [];

//state variables
let brands = [];
let users = [];
let products = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(8090, () => {
  console.log("Node is running on 8090")
});

//Brands file
fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length}`)
});
//users file
fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
  console.log(`Server setup: ${users.length}`)
});
//products file
fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length}`)
});

//GET Brands OK
myRouter.get('/brands', function(request, response) {
  if(!brands) {
    response.writeHead(404, "Nothing to return");
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
});

//GET Products OK
myRouter.get('/products', function(request, response) {
  if(!products) {
    response.writeHead(404, "Nothing to return");
  };
response.writeHead(200, {"Content-Type": "application/json"});
return response.end(JSON.stringify(products));
});

//GET Products with filtered by brand OK
myRouter.get('/brands/:brandId/products', function(request, response) {
  let {brandId} = request.params;
  if (brandId > 5) {
    response.writeHead(400, "No parameter with that ID")
    return response.end("No brand with that id please choose 1 through 5")
  }

  let match = [];
  let getProduct = function (brand, product, parameter) {
    let myParam = parameter.toString();
    product.forEach(prod => {
     let myBrand = brand.find(e =>
       e.id === prod.categoryId);
       if (myBrand.id === myParam) {
         match.push(myBrand.name)
         match.push(prod.name)
         match.push(prod.price)
         match.push(prod.description)
         match.push(prod.imageUrls)
       }
   })
  }

  //For Test with id 2
  // getProduct(brands, products, "2")

  //disable  below for dummy test
   getProduct(brands, products, brandId);
  products = match;
  console.log(products)
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(products));


})

//POST login OK
myRouter.post('/login', function(request, response)  {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      let newUserAuth = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }
      accessToken.push(newUserAuth);
      console.log(JSON.stringify(accessToken));
      console.log(newUserAuth)
      console.log(accessToken[0])
      let match = users.find(user => user.username === accessToken.username)
      console.log(match.cart);
      response.writeHead(200, {"Content-Type": "application/json"});
      return response.end(JSON.stringify(accessToken));
    } else {
      response.writeHead(401, "Invalid Login");
      return response.end();
    }
  } else {
    response.writehead(400, "Incorrect format");
    return response.end();
  }
})

//GET Me/Cart OK
myRouter.get("/me/cart", function (request, response) {
  let authUser = users.find(user => user.username === accessToken.username)

  if (authUser) {
    response.writeHead(200, "Access granted")
    return response(JSON.stringify(authUser.cart))
  } else {
    response.writeHead(401, "Unauthorized to access shopping cart");
    return response.end();
  }
})

//POST Me/Cart OK
myRouter.post('/me/cart', function (request, response) {
  let authUser = users.find(user => user.username === accessToken.username)

  let product = products.find((p) => {
    return p.id && p.categoryId && p.price;
  })

  console.log(users)

  if (authUser) {
    let cart = authUser.cart;
    cart.push(product)
    response.writeHead(201, "Access granted")
    return response(JSON.stringify(cart))
  } else {
    response.writeHead(401, "Unauthorized to access shopping cart");
    return response.end();
  }
});

//DELETE Item OK
myRouter.delete('/me/cart/:productid', function (request, response) {
  let {productid} = request.params;
  let stringProduct = productid.toString();
  
  let authUser = users.find(user => user.username === accessToken.username)

  let cart = authUser.cart;
  let index = cart.indexOf(stringProduct);

  if (authUser) {
    let newCart = cart.splice(index);
    response.writeHead(200, "Access granted")
    return response(JSON.stringify(newCart))
    } else {
      response.writeHead(401, "Unauthorized to access shopping cart");
      return response.end();
    }
})

//POST Quantity OK
myRouter.post('/me/cart/:productid', function (request, response) {
  let {productid} = request.params;
  let stringProduct = productid.toString();

  let productToEdit = products.filter(p => {
    return p.id === stringProduct;
  })
  
  let authUser = users.find(user => user.username === accessToken.username)

  let cart = authUser.cart;


  if (authUser) {
    let addCart = cart.push(productToEdit);
    response.writeHead(200, "Access granted")
    return response(JSON.stringify(addCart))
    } else {
      response.writeHead(401, "Unauthorized to access shopping cart");
      return response.end();
    }
})

module.exports = server;