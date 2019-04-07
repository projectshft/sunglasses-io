var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
var url = require("url");
const header = { "Content-Type": "application/json" }
const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

//Returning all brands
myRouter.get("/api/brands", function(request, response) {
		response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(brands));
});

//Returning all products based on brandId
myRouter.get("/api/brands/:brandId/products", function(request, response) {
	requestedId = parseInt(request.params.brandId); 
	//All valid ids should be capable of being parsed to an int. If the input is NaN we know it's bad input.
	if (isNaN(requestedId) || requestedId < 1) { 
		response.writeHead(400, "Invalid brandId supplied");
    response.end();
  }
  //Checking brands data to see if brandId exists.
  requestedBrandProducts = products.filter(
  product => product.categoryId === request.params.brandId
  );
  if (requestedBrandProducts.length != 0) {
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(requestedBrandProducts));
  } else {
    response.writeHead(404, "Brand id not found");
    response.end();
  }
});

//Returning all products if no query string. If query exists then we search brands and products for a match.
myRouter.get("/api/products", function(request, response) {
	const queryData = url.parse(request.url).query;
	searchString = queryString.parse(queryData);
	if (Object.keys(searchString).length === 0) {
		response.writeHead(200, "Successful operation", header);
		response.end(JSON.stringify(products));
	} 
	//Since call has query data, check to see if length is as specified.
	if (searchString.query.length >= 1 && searchString.query.length <= 50) {
		//Search brands to get relevant brandId
		brandId = brands.find(brand => brand.name.toLowerCase() == searchString.query.toLowerCase() )
		//Search products for results
		if (brandId) {
			results =	products.filter(product => product.categoryId == brandId.id)
			response.writeHead(200, "successful operation", header);
			response.end(JSON.stringify(results));
		} else {
			results = products.filter(product => product.name.toLowerCase() == searchString.query.toLowerCase())
			if (results.length > 0) {
			response.writeHead(200, "successful operation", header);
			response.end(JSON.stringify(results));
			} else {
				response.writeHead(404, "No results found.");
				response.end();
			}
		}
		//query length was not valid
	} else {
		response.writeHead(400, "Invalid search");
		response.end();
	}
	
});