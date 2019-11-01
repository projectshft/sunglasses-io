var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
let brands = [];
let users = [];
let user = {};
let products = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

//Server Data Setup and Router
http.createServer( (request, response) => {
    myRouter(request, response, finalHandler(request, response))
})
    .listen(PORT,error => {
        if (error) {
            return console.log("Error on Server Startup: ", error);
        }
        //brands = JSON.parse(fs.readFile('initial-data/brands.json','utf-8'));
        
        fs.readFile('initial-data/brands.json','utf-8', (error, data) => {
            if (error) throw error;
            brands = JSON.parse(data);
            console.log(`Server setup: ${brands.length} brands loaded`);
        });
        //users = JSON.parse(fs.readFileSync('initial-data/users.json','utf-8'));
        
        fs.readFile('initial-data/users.json','utf-8', (error, data) => {
            if (error) throw error;
            users = JSON.parse(data);
            user = users[0];
            console.log(`Server setup: ${users.length} users loaded`);
        });

        
        // products = JSON.parse(fs.readFileSync('initial-data/products.json','utf-8'));
        
        fs.readFile('initial-data/products.json','utf-8', (error, data) => {
            if (error) throw error;
            products = JSON.parse(data);
            console.log(`Server setup: ${products.length} products loaded`);
        });
    });

myRouter.get('/api/brands', (request,response) => {
//should return all brands
});

myRouter.get('/api/brands/:id/products', (request,response) => {
//should return all products of a certain brand
});

myRouter.get('/api/products', (request,response)=>{
//should return all products
});

myRouter.post('/api/login', (request,response)=>{
//authentication    
});

myRouter.get('/api/me/cart', (request,response)=>{
//cart content of authenticated user    
});

myRouter.post('/api/me/cart', (request,response)=>{
//add item(s) to cart of authenticated user    
});

myRouter.delete('/api/me/cart/:productId', (request,response)=>{
//removes item(s) from cart    
});

myRouter.post('/api/me/cart/productId', (request,response)=>{
//update quantity of item(s) in cart 
});