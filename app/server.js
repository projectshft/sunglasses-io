const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const PORT = 8080;

//state variables
let brands = [];
let products = [];
let users = [];
let currentUser={};



//test token
let accessToken = [{
    username: "carson.poe@gmail.com",
    lastUpdate: new Date(),
    token: "cgp6012"
}]

// router setup
const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) throw error;
    console.log(`server runnin on port ${PORT}`);
    //populate brands
    fs.readFile("initial-data/brands.json", "utf-8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
    });
    //populate products
    fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
      if (error) throw error;
      products = JSON.parse(data);
    });
     //populate users
     fs.readFileSync("./initial-data/users.json", "utf8", (error, data) =>{
    if (error) throw error;
     users = JSON.parse(data)
     //current user to test
     currentUser = users[0];
  });

  
  //helper functions
const getProductOrBrand = (objId, state) => {
    const item = state.find(obj => obj.id === objId);
    return !item ? null : item;
 };
 
 
 const getProductsFromSearch = (queryStringArray, products) => {
    let queryProductsArray = [];
    queryStringArray.forEach(queryTerm => {
       //array of products to for one query term
       let queryTermArray = products.filter(product => (product.name.includes(queryTerm) || product.description.includes(queryTerm)));
       
       //check to see if the item is already in the array
       queryTermArray.forEach(product =>{
          if (!queryProductsArray.includes(product)){
             queryProductsArray = [...queryProductsArray, product];
          }
       })
     })
     return queryProductsArray
  }


  const newValidToken = (request, accessToken) => {
    //15 min validity timeout
    const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; 
 
    var parsedUrl = require('url').parse(request.url,true)
    if (parsedUrl.query.accessToken) {
      // need to make sure running access token is valid and not expired
      let runningAccessToken = accessToken.find((accessTokenItem) => {
       return accessTokenItem.token == parsedUrl.query.accessTokenItem && ((new Date) - accessTokenItem.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
     });
      if (runningAccessToken) {
        return runningAccessToken;
      } else {
        return null;
      }
    } 

// have to configure routes

// get /api/brands 
myRouter.get("/api/brands", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
});



// get /api/products 
// need to have query search to return specific products
myRouter.get('/api/products', (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);
    let queryStringArray = [];
    let queryProductsArray = [];
    if (query) {
      queryStringArray = query.split(' ');
    }
    if (query !== undefined && query !== ""){
      queryProductsArray = getProductsFromSearch(queryStringArray, products);
    } else {
        queryProductsArray = products;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(queryProductsArray))
  });


// get /api/brands/:brandId/products 
// specific brand
myRouter.get("/api/brands/:brandId/products", (request, response) => {
    const { id } = request.params;
    const brand = getProductOrBrand(id, brands);
    if (!brand) {
        response.writeHead(404, "That brand does not exist");
        return response.end();
      }
    response.writeHead(200, { "Content-Type": "application/json" });
    const relatedProducts = products.filter(product => product.categoryId === id);
    response.end(JSON.stringify(relatedProducts));
});

// post /api/login
myRouter.post('/api/login', function(request,response) {
    //username and password in the request
    if (request.body.username && request.body.password) {
      // check if there is a user with that specific username and password 
      let user = users.find((user)=>{
        return user.email == request.body.username && user.login.password == request.body.password;
      });
      if (user) {
        // if the login works, search for existing access token for the user
        currentUser = user;
        response.writeHead(200, {'Content-Type': 'application/json'});
        let userAccessToken = accessToken.find((tokenObject) => {
          return tokenObject.username == user.email;
        });

        // need to update value to get another time period
      if (userAccessToken) {
        userAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(userAccessToken.token));
      } else {
          // need to create new token
        let newAccessToken = {
            username: user.email,
            lastUpdate: new Date(),
            token: uid(16)
          }
          accessToken.push(newAccessToken);
          response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
        response.writeHead(401, "Incorrect username or password");
        response.end();
        }
    } else {
    response.writeHead(400, "Incorrect format");
    response.end();
  }
    })
};

// get cart route
myRouter.get('/api/me/cart', (request, response) => {
    let runningAccessToken = newValidToken(request, accessToken);
    if (!runningAccessToken) {
      response.writeHead(401, "You don't have valid access for this action.");
      response.end();
    } else {
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end(JSON.stringify(currentUser.cart));
      }
  });
})

myRouter.post('/api/me/cart', function(request,response) {
    let currentAccessToken = newValidToken(request, accessToken);
    if (!currentAccessToken) {
      response.writeHead(401, "You don't have valid access for this action" );
      response.end();
    } else {
        const parsedUrl = url.parse(request.originalUrl);
        const { productId } = queryString.parse(parsedUrl.query);
        const addProduct = getProductOrBrand(productId, products);
        if (!addProduct) {
          response.writeHead(404, "Product was not found or does not exist");
          response.end();
        }
          let addItem = {
            id: addProduct.id,
            name: addProduct.name,
            price: addProduct.price,
            quantity: 1
          };
            const itemAdded = getProductOrBrand(productId, currentUser.cart);
        }
    });
  module.exports = server;