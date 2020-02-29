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

let brands = [];

const PORT = 3001;

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    //    brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'))
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



// export to test file for Chai
module.exports = server