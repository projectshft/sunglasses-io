var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes


// State holding variables
var brands = [];
var users = [];
var accessTokens = [];
var products = {};


// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
      return console.log('Error on Server Startup: ', error)
    }
    //Reads the products.JSON file
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    //Reads the brands.JSON file
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    //Reads the users.JSON file
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    //console log so I know server is up and running
    console.log(`Server is listening on ${PORT}`);
  });  


// First route to the brands. Should return all brand names of sunglasses
myRouter.get('/api/brands', function(request,response) {
    response.writeHead(200, { "Content-Type": "application/json" });
	// Return all brands in the db
	return response.end(JSON.stringify(brands))
});

// Routes to products in specific brand. Should return all products with the brand name the user requested of sunglasses
myRouter.get('/api/brands/:id/products', function(request,response) {
    //finds the correct brand id requested
    const productsWithSearchedBrand = products.filter((product=>product.categoryId == request.params.id))
    //if array is empty the id did not exist
    if (productsWithSearchedBrand.length === 0) {
        // If there isn't a store with that id, then return a 404
        response.writeHead(404, "Brand ID could not be found");
        return response.end();
      }
    response.writeHead(200, { "Content-Type": "application/json" });
	// Return all products of specific brand
	return response.end(JSON.stringify(productsWithSearchedBrand))
});

// Routes to products in specific brand. Should return all products with the brand name the user requested of sunglasses
myRouter.post('/api/login', function(request,response) {

    //Check if both username and password were entered
    if (request.body.username && request.body.password) {
        
        //search to see if username and password match
        let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
        });

        //if user is found. We need to return current token or create new token
        if (user){
            
            //user successfully logged status
            response.writeHead(200, { "Content-Type": "application/json" });

            //creates new access token when login is successful
            let newAccessToken = {
                username: user.login.username,
                lastUpdated: new Date(),
                token: uid(16)
            }
            
            //pushes token to accessToken array to store current tokens
            accessTokens.push(newAccessToken);
            return response.end(JSON.stringify(newAccessToken.token));

        
        }else {

            // When incorrect username or password is entered
            response.writeHead(401, "Invalid username or password");
            return response.end();
        }
    }
    //when no username or password is entered
    else {
        response.writeHead(404, "invalid username or password");
        return response.end();
        }
});


module.exports = server

