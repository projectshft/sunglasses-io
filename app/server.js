const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];


const server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
})
server.listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
});

myRouter.get('/api/brands', function (req, res) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    if (brands.length === 0) {
        console.log("There are no brands in the database")
        return res.end()
    }
    let queryParams = queryString.parse(req._parsedUrl.query)
    //check if queryParams object is empty
    if (Object.keys(queryParams).length) {
        if (typeof queryParams.name === 'string') {
            //Account for spaces in queryParam string by splitting the string into an array with the (' ') separator.
            queryParams.name = queryParams.name.split(' ');
        }
        //filter brands array by search query brand names
        let filteredBrands = brands.filter(brand => queryParams.name.some(queryParam => brand.name.toLowerCase().includes(queryParam.toLowerCase())))
        return res.end(JSON.stringify(filteredBrands))
    }
    return res.end(JSON.stringify(brands))
})

module.exports = server