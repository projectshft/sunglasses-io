const fs = require('fs');
const request = require("request");

const apiKey = '88312679-04c9-4351-85ce-3ed75293b449'
const base_url = "http://localhost:3001/api"

let fullBrands = [];
let fullProducts = [];
let fullUsers = [];
let token='pony';

let goodLogin = {
    url: base_url+"/login",
    headers: {
        'x-authentication': apiKey,
        'content-type': "application/json"
    },
    body:JSON.stringify({
        "username":"greenlion235",
        "password":"waters"
    })
};

// Reading brands.json file and pushing it to products array.
fs.readFile('./initial-data/brands.json', 'utf8', function (error, data) {
    if (error) throw error;
    fullBrands = JSON.parse(data);
});

// Reading products.json file and pushing it to products array.
fs.readFile('./initial-data/products.json', 'utf8', function (error, data) {
    if (error) throw error;
    fullProducts = JSON.parse(data);
});

// Reads Users.json and pushing it to user array.
fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
    if (error) throw error;
    fullUsers = JSON.parse(data);
});

// This test make sures the server is working
// 401 without API key, and 200 with API key.
describe("SunGlasses Server", function() {
    describe("GET /", function() {
        // Returns 401 if Api key not included
        it("returns status code 401", function(done) {
            request.get(base_url, function(error, response, body) {
                expect(response.statusCode).toBe(401);
                done();
            });
        });
        
        // Returns 200 if Api key is included
        it("returns status code 200", function(done) {
            let options = {
                url: base_url,
                headers: {
                    'x-authentication': apiKey
                }
            };
            request.get(options, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });
});

// /brands
describe("Brands", function() {
    let options = {
        url: base_url+"/brands",
        headers: {
            'x-authentication': apiKey
        },
    };

    describe("GET /brands", function() {
        // Returns 200 if Api key is included, url is to get brands.
        it("returns status code 200", function(done) {
            request.get(options, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        
        // checks if all brand is in the response
        it("returns an array of brands", function(done) {
            request.get(options, function(error, response, body) {
                let parsed = JSON.parse(response.body);
                expect(parsed).toEqual(fullBrands);
                done();
            });
        });
    });

    describe("GET /brands/{id}/products", function() {
        let knownBrand1 = {
            url: base_url+"/brands/1/products",
            headers: {
                'x-authentication': apiKey
            }
        };
        let unknownBrand = {
            url: base_url+"/brands/10/products",
            headers: {
                'x-authentication': apiKey,
                'content-type': "application/json"
            },
            // body:JSON.stringify({
            //     "username":"greenlion235",
            //     "password":"waters"
            // })
        };

        // Returns 200 if brand exist
        it("returns status code 200", function(done) {
            request.get(knownBrand1, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        // Returns 404 if brand doesn't exist
        it("returns status code 404", function(done) {
            request.get(unknownBrand, function(error, response, body) {
                expect(response.statusCode).toBe(404);
                done();
            });
        });
        
        // checks if brandId 1 products is in the response
        it("returns an array", function(done) {
            request.get(knownBrand1, function(error, response, body) {
                let parsed = JSON.parse(response.body);
                let filteredProducts = fullProducts.filter(product => product.categoryId == 1)

                expect(parsed).toEqual(filteredProducts);
                done();
            });
        });
    });
});

// /products with optional Query
describe("Products", function() {
    let productQuery = {
        url: base_url+"/products?query=sunglasses",
        headers: {
            'x-authentication': apiKey
        }
    };
    let brandQuery = {
        url: base_url+"/products?query=dkny",
        headers: {
            'x-authentication': apiKey
        },
    };
    let emptyQuery = {
        url: base_url+"/products/",
        headers: {
            'x-authentication': apiKey
        }
    };

    describe("GET /products", function() {
        // Returns 200 for any query.
        it("returns status code 200", function(done) {
            request.get(emptyQuery, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        // Return full list if empty array sent.
        it("returns all products", function(done) {
            request.get(emptyQuery, function(error, response, body) {
                expect(JSON.parse(response.body)).toEqual(fullProducts);
                done();
            });
        });
    });

    describe("GET /products/query?", function() {
        // Returns 200 for any query.
        it("returns status code 200", function(done) {
            request.get(emptyQuery, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });

        // Return queried list if query (sunglasses) sent, regardless of upper/lower cases.
        it("returns queried products (case insensitive)", function(done) {
            request.get(productQuery, function(error, response, body) {
                let filteredProducts = [];
                filteredProducts = fullProducts.filter(product => product.name.toLowerCase().includes('sunglasses'));
                expect(JSON.parse(response.body)).toEqual(filteredProducts);
                done();
            });
        });
        
        // Return queried brand product list if query (dkny) sent, regardless of upper/lower cases.
        it("returns queried brand products (case insensitive)", function(done) {
            request.get(brandQuery, function(error, response, body) {
                let filteredProducts = [];
                let brand = fullBrands.find(brand => brand.name.toLowerCase() == "dkny")
                filteredProducts = fullProducts.filter(product => product.categoryId == brand.id);
                expect(JSON.parse(response.body)).toEqual(filteredProducts);
                done();
            });
        });
    });
});

// /login API calls
describe("Login", function() {
    let  badLogin = {
        url: base_url+"/login",
        headers: {
            'x-authentication': apiKey,
            'content-type': "application/json"
        },
        body:JSON.stringify({
            "username":"bad",
            "password":"login"
        })
    };

    describe("POST /login", function() {
        // Returns 200 if Api key and valid login entered
        it("returns status code 200", function(done) {
            request.post(goodLogin, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
        // Returns 401 if Api key with bad login
        it("returns status code 401", function(done) {
            request.post(badLogin, function(error, response, body) {
                expect(response.statusCode).toBe(401);
                done();
            });
        });
        
        // Returns a token if login successful
        it("returns a token ", function(done) {
            request.post(goodLogin, function(error, response, body) {
                expect(response.body).toEqual(jasmine.any(String));
                done();
            });
        });
    });
});

// /me/cart API calls
// probably better idea to seperate these calls into individual tests.
describe("Cart", function() {
    let badTokenLogin = {
        url: base_url+"/me/cart",
        headers: {
            'x-authentication': apiKey,
            'content-type': "application/json",
            'token': "token"
        }
    };

    describe("get /me/cart", function() {
        beforeEach(function(done) {
            request.post(goodLogin, function(error, response, body) {
                token = JSON.parse(response.body);
            done();
            });
        });

        // Returns 401 with bad token
        it("returns status code 401 when invalid token", function(done) {
            request.get(badTokenLogin, function(error, response, body) {
                expect(response.statusCode).toBe(401);
                done();
            });
        });

        // then GET me/cart with the new token
        it("returns array of products with valid token", function(done) {        
            let tokenLogin = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                }
            }
            request.get(tokenLogin, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).toEqual(jasmine.any(Array));
                done();
            });
        });

        // add/remove/update the me/cart with the new token
        it("changes the cart and returns array of products in cart", function(done) {        
            let Product1 = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "1"
                })
            }
            let Product2 = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "2"
                })
            }
            let BadProduct = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "100"
                })
            }
            let updateProduct = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "2",
                    'amount': "50"
                })
            }
            let updateProduct2 = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "2",
                    'amount': "-50"
                })
            }
            let updateProduct3 = {
                url: base_url+"/me/cart",
                headers: {
                    'x-authentication': apiKey,
                    'content-type': "application/json",
                    'token': token
                },
                body: JSON.stringify({
                    'productId': "2",
                    'amount': "5.5"
                })
            }
            // User's Cart containing 1 item
            request.post(Product1, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).toEqual(jasmine.arrayContaining([{
                    "id": "1",
                    "categoryId": "1",
                    "name": "Superglasses",
                    "description": "The best glasses in the world",
                    "price":150,
                    "amount":1,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }]));
            });
            // User's Cart containing 2 items
            request.post(Product2, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).toEqual(jasmine.arrayContaining([{
                    "id": "1",
                    "categoryId": "1",
                    "name": "Superglasses",
                    "description": "The best glasses in the world",
                    "price":150,
                    "amount":1,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "price":100,
                    "amount":1,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }
                ]));
            });
            // Add Bad product, expect status code to be 500
            request.post(BadProduct, function(error, response, body) {
                expect(response.statusCode).toBe(401);
            });

            // Remove Existing product from cart. while keeping the others in.
            request.delete(Product1, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).not.toEqual(jasmine.arrayContaining([{
                    "id": "1",
                    "categoryId": "1",
                    "name": "Superglasses",
                    "description": "The best glasses in the world",
                    "price":150,
                    "amount":1,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }]));
            });

            // Remove non existent product, status 401;
            request.delete(BadProduct, function(error, response, body) {
                expect(response.statusCode).toBe(401);
            });

            request.post(updateProduct, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).toEqual(jasmine.arrayContaining([
                {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "price":100,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                    "amount": 50
                }]));
            });

            request.post(updateProduct2, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                expect(JSON.parse(response.body)).not.toEqual(jasmine.arrayContaining([
                {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "price":100,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                    "amount": 50
                }]));
            });

            request.post(updateProduct3, function(error, response, body) {
                expect(response.statusCode).toBe(400);
            });


            // clears all items in cart.
            request.delete(Product1, function(error, response, body) {
                expect(response.statusCode).toBe(200);
            });
            request.delete(Product2, function(error, response, body) {
                expect(response.statusCode).toBe(200);
                done();
            });
        });
    });
});



