const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];
let accessTokens = []


const getValidTokenFromRequest = function(request) {
    const parsedUrl = require('url').parse(request.url, true);
    if (parsedUrl.query.accessToken) {
      let currentAccessToken = accessTokens.find(accessToken => {
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
  }


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
        let paramName = queryParams.name
        let filteredBrands = brands.filter(brand => queryParams.name.some(queryParam => brand.name.toLowerCase().includes(queryParam.toLowerCase())))
        return res.end(JSON.stringify(filteredBrands))
    }
    return res.end(JSON.stringify(brands))
})

myRouter.get('/api/brands/:id/products', (req, res) => {
    let brandId = req.params.id;
    let filteredProducts= products.filter(product => {
        return product.categoryId == brandId
    })
    if (filteredProducts.length) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(filteredProducts))
    }
    res.writeHead(400, 'No Products Match have that Brand Category Id')
    return res.end();
}); 

myRouter.get('/api/products', (req, res) => {
    let filteredProducts = products
    let queryParams = []
    if (req._parsedUrl.query) {
        queryParams = queryString.parse(req._parsedUrl.query).name
    } 
    if (queryParams.length) {
        if (typeof queryParams === "string") {
            queryParams.includes(' ') ? 
            queryParams = queryParams.split(' ') :
            queryParams = queryParams.split('%20')
        }
    
       filteredProducts = products.filter(product => 
        queryParams.some(queryParam => product.name.toLowerCase().includes(queryParam.toLowerCase()))
       )
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(filteredProducts))
})


myRouter.post('/api/login', (req, res) => {
    if(req.body.email && req.body.password) {
        if (req.body.email.includes('@') && req.body.email.includes('.')) {
            let user = users.find(user => {
                return user.email === req.body.email && user.login.password === req.body.password 
            })
            if (user) {
                res.writeHead(200, {'Content-Type': 'application/json'})
                let currentAccessToken = accessTokens.find(tokenObject => tokenObject.username === user.login.username)
                if(currentAccessToken) {
                    currentAccessToken.lastUpdated = new Date();
                    return response.end(JSON.stringify(currentAccessToken.token))
                } else {
                    let newAccessToken = {
                        username: user.login.username,
                        lastUpdated: new Date(),
                        token: uid(16)
                    }
                    accessTokens.push(newAccessToken);
                    return res.end(JSON.stringify(newAccessToken.token))
                }
            } else {
                res.writeHead(400, 'Invalid Email and Password', {'Content-Type': 'application/json'})
                return res.end()
            }   
        } else {
            res.writeHead(400, "You must enter a properly formatted email address")
            return res.end()
        }
    } else {
        res.writeHead(400, 'You must enter an email and password')
        return res.end()
    }
    
})

myRouter.get('/api/me/cart', (req, res) => {
    let currentAccessToken = getValidTokenFromRequest(req)
    if (currentAccessToken) {
        let user = users.find(user => currentAccessToken.username == user.login.username)
        res.writeHead(200, {'Content-Type': 'application/json'})
        return res.end(JSON.stringify(user.cart))

    } else {
        res.writeHead(400, "Login to View Cart")
       return res.end()
    }
})
 
myRouter.post('/api/me/cart', (req, res) => {
    let currentAccessToken = getValidTokenFromRequest(req)
    if (currentAccessToken) {
        let user = users.find(user => currentAccessToken.username == user.login.username)
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify(user))
    } else {
        res.writeHead(400, "Login to modify cart")
        return res.end()
    }
})

module.exports = server