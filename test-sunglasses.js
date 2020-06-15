const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = require('chai');
const chaiEach = require('chai-each');
const chaiThings = require('chai-things');
const chaiFuzzy = require('chai-fuzzy');

const server = require('./app/server');
const fs = require('fs');
const path = require("path");

//chai plugins
chai.use(chaiHttp);
chai.use(chaiEach);
chai.use(chaiThings);
chai.use(chaiFuzzy);

//data for testing
const products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
const users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
const brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));

let userToken = '';


//test for api/brands GET request
describe('/GET brands', () => {
    //check for array
    it('should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
                done();
            });
    });

    //check that all results returned
    it('it should GET all brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(brands);
                done();
            });
    });

    //check that error is returned if parameters sent
    it('should return error if parameters are sent with request', done => {
        chai
            .request(server)
            .get('/api/brands?query=bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });
});

//test for api/brands/:id/products GET request
describe('/GET brands/:id/products', () => {

    //check for array
    it('should GET an array', done => {
        chai
            .request(server)
            .get('/api/brands/2/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
                done();
            });
    });

    //check if each product's category matches brand id
    it('should GET only products of specified brand', done => {
        chai
            .request(server)
            .get('/api/brands/2/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.each.have.property('categoryId').that.equals('2');
                done();
            });
    });

    //expect empty array if no brands found
    it('should return empty array if no product matches found', done => {

        chai
            .request(server)
            .get('/api/brands/6/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.empty;
                done();
            });
    });

    //check if all products with brand are returned
    it('should GET all products with specified brand', done => {
        chai
            .request(server)
            .get('/api/brands/1/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                let productsFound = products.filter(product => {
                    return product.categoryId === "1";
                });
                expect(response.body).to.deep.equal(productsFound);
                done();
            });
    });

    //should return error if brand does not exist
    it('should return error if brand id does not exist', done => {
        chai
            .request(server)
            .get('/api/brands/bananas/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                expect(response.body).to.be.empty
                done();
            });
    });

    //check that error is returned if parameters sent
    it('should return error if parameters are sent with request', done => {
        chai
            .request(server)
            .get('/api/brands/1/products?query=bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });
});

//test for api/products GET request
describe('/GET products', () => {
    //check for array 
    it('should GET an array', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
                done();
            });
    });

    //check that all products are returned if no query
    it('should GET all products if no parameters sent', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(products);
                done();
            });
    });

    //check that search query returns array of products
    it('should GET an array when search query sent', done => {
        chai
            .request(server)
            .get('/api/products?query=bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
                done();
            });
    });

    //check that search query will search product name
    it('should GET products whose name includes search term', done => {
        const brownSunglasses = [{
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price": 50,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }]

        chai
            .request(server)
            .get('/api/products?query=brown')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(brownSunglasses);
                done();
            });
    });

    //check that search query will search product description
    it('should GET products whose description includes search term', done => {
        const awfulGlasses = [{
            "id": "6",
            "categoryId": "3",
            "name": "glas",
            "description": "Pretty awful glasses",
            "price": 10,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }]

        chai
            .request(server)
            .get('/api/products?query=awful')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(awfulGlasses);
                done();
            });
    });

    //check that search query returns only products containing search term
    it('should GET only products that contain search term', done => {
        chai
            .request(server)
            .get('/api/products?query=best')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                const allResultsContainSearchTerm = response.body.every(product => {
                    return product.name.includes('best') || product.description.includes('best');
                });
                expect(allResultsContainSearchTerm).to.equal(true);
                done();
            });
    });

    //check that search query returns all products containing search term
    it('should GET every product that contains search query', done => {
        chai
            .request(server)
            .get('/api/products?query=best')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);

                //filter products array to find products with search term
                const productsContainingSearchTerm = products.filter(product => {
                    return product.name.includes('best') || product.description.includes('best');
                });

                //check that filtered results match request results
                expect(response.body).to.deep.equal(productsContainingSearchTerm);
                done();
            });
    });

    //check that error is returned on invalid request
    it('should return error if request parameters are invalid', done => {
        chai
            .request(server)
            .get('/api/products?banana=bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });
});

//test for api/products/:productId
describe('/GET products/:productId', () => {
    //check for an object 
    it('should GET an object', done => {
        chai
            .request(server)
            .get('/api/products/1')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('object');
                done();
            });
    });

    //check that it returns only a product containing productId
    it('should GET only products that contain product id', done => {
        chai
            .request(server)
            .get('/api/products/2')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.property('id').that.equals('2');
                done();
            });
    });

    //check that it gets matching product if it exists
    it('should find product with matching id if it exists', done => {
        const productWithId7 = {
            "id": "7",
            "categoryId": "3",
            "name": "QDogs Glasses",
            "description": "They bark",
            "price": 1500,
            "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        chai
            .request(server)
            .get('/api/products/7')
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.deep.equal(productWithId7);
                done();
            });
    });

    //check that it returns error if product doesnt exist
    it('should return error if product with specified id does not exist', done => {
        chai
            .request(server)
            .get('/api/products/bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
    });

    //check that no parameters are sent
    it('should return error if parameters are sent with request', done => {
        chai
            .request(server)
            .get('/api/products/3/?banana=bananas')
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });
});

// //test for api/login POST request
describe('/POST login', () => {
    //response should be successful if username and password exist
    it('should return successful response username and password match existing user', done => {
        const userLogin = {
            password: 'tucker',
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
    });

    //should throw error if parameters are missing
    it('should return error if no parameters are sent', done => {
        const userLogin = {}

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //login should require username parameter
    it('should return error if username parameter is missing', done => {
        const userLogin = {
            password: 'tucker',
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //login should require password parameter
    it('should return error if username parameter is missing', done => {
        const userLogin = {
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //should throw error if password is empty
    it('should return error if password is empty', done => {
        const userLogin = {
            password: '',
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //should throw error if username is empty
    it('should return error if username is empty', done => {
        const userLogin = {
            password: 'tucker',
            username: ''
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    // should throw error if username doesn't exist
    it('should return error if username not found', done => {
        const userLogin = {
            password: 'tucker',
            username: 'banana'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
    });

    // should throw error if password incorrect
    it('should return error if password is incorrect', done => {
        const userLogin = {
            password: 'bananas',
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
    });

    // should create token if login successful
    it('should return access token if login successful', done => {
        const userLogin = {
            password: 'tucker',
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('object').with.property('accessToken');
                done();
            });
    });


    // should throw error if query parameters are sent
    it('should return error if query parameters are sent', done => {
        const userLogin = {
            password: 'tucker',
            username: 'lazywolf342'
        }

        chai
            .request(server)
            .post('/api/login?banana=bananas')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    // should throw error if invalid parameters are sent
    it('should return error if invalid parameters are sent', done => {
        const userLogin = {
            password: 'tucker',
            username: 'lazywolf342',
            banana: 'bananas'
        }

        chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });
});

// //test for api/me/cart GET request
describe('/GET cart', () => {

    //login before each test
    beforeEach(async function () {
        const userLogin = {
                    password: 'tucker',
                    username: 'lazywolf342'
                }
        
        const res = await chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
      
        userToken = res.body;
      });

    // //check for array 
    it('should GET an array', done => {
        chai
            .request(server)
            .get(`/api/me/cart?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.an('array');
                done();
            });
    });

    //should only allow access if valid token is sent
    it('should only allow access if token is sent in request', done => {
        chai
            .request(server)
            .get(`/api/me/cart`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //array should be empty if cart is empty
    it('should return empty array if user cart is empty', done => {
        chai
            .request(server)
            .get(`/api/me/cart?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
    });

    //cart should belong to user
    it('should return cart of logged in user', done => {
        chai
            .request(server)
            .get(`/api/me/cart?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                loggedInUser = users.find(user => {
                    return user.login.username === userToken.username;
                });
                expect(response.statusCode).to.equal(200);
                const isUserCart = () => {
                    return response.body.length === 0 ? response.body.length === loggedInUser.cart.length : response.body.length === loggedInUser.cart.length && response.body.includes(...loggedInUser.cart);
                }
                expect(isUserCart()).to.equal(true);
                done();
            });
    });

    //return error if invalid parameters sent
    it('should only allow access if token is sent in request', done => {
        chai
            .request(server)
            .get(`/api/me/cart?banana=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //should only allow access if token is valid
    it('should only allow access if token is valid', done => {
        chai
            .request(server)
            .get(`/api/me/cart?accessToken=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
    });

});

// //test for api/me/cart POST request
describe('/POST cart', () => {
    //login before each test && get cart
    beforeEach(async function () {
        const userLogin = {
                    password: 'tucker',
                    username: 'lazywolf342'
                }
        
        const res = await chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
      
        userToken = res.body;
      });

// should only allow access if token is sent
it('should return error if no token sent in request', done => {
    chai
        .request(server)
        .post(`/api/me/cart?productId=1`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(400);
            done();
        });
});
    //token must be valid
    it('should return error if token is invalid', done => {
        chai
            .request(server)
            .post(`/api/me/cart?productId=1&accessToken=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
    });

    //product id must be sent
    it('should return error if product id is not sent in request', done => {
        chai
            .request(server)
            .post(`/api/me/cart?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //product id must be valid
    it('should return error if product id is not found', done => {
        chai
            .request(server)
            .post(`/api/me/cart?accessToken=${userToken.accessToken}&productId=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
    });

    //return error if invalid parameters sent
    it('should return error if invalid parameters sent', done => {
        chai
            .request(server)
            .post(`/api/me/cart?banana=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //should return 200 on success
    it('should return 200 if request valid', done => {
        chai
            .request(server)
            .post(`/api/me/cart?productId=1&accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
    });

    //should send error if item already in cart
    it('should update quantity if product already in cart and not duplicate', done => {
        //get item in cart to test
        const cartTestItem = userToken.cart[0].product;
        const cartStartingLength = userToken.cart.length;
       
        chai
            .request(server)
            .post(`/api/me/cart?productId=${cartTestItem.id}&accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body.length).to.equal(cartStartingLength);
                done();
            });
    });

    //should add object to cart array
    it('should add object to cart array with product info and quantity', done => {
        //find user
        const loggedInUser = users.find(user => {
            return user.login.username === userToken.username;
        });

        //find product
        const productToAdd = products.find(product => {
            product.id === "3";
        });

        //empty cart
        loggedInUser.cart = [];
        
        chai
            .request(server)
            .post(`/api/me/cart?productId=3&accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(loggedInUser.cart[0]).to.deep.equal(productToAdd);
                done();
            });
            
    });

});

// //test for api/me/cart/:productId DELETE request
describe('/DELETE cart/:productId', () => {
    //login before each test
    beforeEach(async function () {
        const userLogin = {
                    password: 'tucker',
                    username: 'lazywolf342'
                }
        
        const loginRes = await chai
            .request(server)
            .post('/api/login')
            .send(userLogin)
            
      
        userToken = loginRes.body;

        const postRes = await chai
            .request(server)
            .post(`/api/me/cart?productId=4&accessToken=${userToken.accessToken}`)
      
        userToken.cart = postRes.body;
        });

// should only allow access if token is sent
it('should return error if no token sent in request', done => {
    chai
        .request(server)
        .delete(`/api/me/cart/4`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(400);
            done();
        });
});
    //token must be valid
    it('should return error if token is invalid', done => {
        chai
            .request(server)
            .delete(`/api/me/cart/4?accessToken=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(401);
                done();
            });
    });

    //product id must be valid
    it('should return error if product is not in cart', done => {
        chai
            .request(server)
            .delete(`/api/me/cart/bananas?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(404);
                done();
            });
    });

    //return error if invalid parameters sent
    it('should return error if invalid parameters sent', done => {
        chai
            .request(server)
            .delete(`/api/me/cart/4?accessToken=${userToken.accessToken}&banana=bananas`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(400);
                done();
            });
    });

    //should return 200 on success
    it('should return 200 if request valid', done => {
        chai
            .request(server)
            .delete(`/api/me/cart/4?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                done();
            });
    });

    //delete item from cart
    it('should remove product from cart', done => {
        chai
            .request(server)
            .delete(`/api/me/cart/4?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                //check for item in updated cart
                const isItemInCart = response.body.find(cartItem => {
                    return cartItem.product.id === '4';
                })
                expect(response.statusCode).to.equal(200);
                expect(isItemInCart).to.equal(undefined);
                done();
            });
    });

    //delete no other items from cart
    it('should remove only selected product from cart', done => {
        //get cart length
        startingCartLength = userToken.cart.length;

        chai
            .request(server)
            .delete(`/api/me/cart/4?accessToken=${userToken.accessToken}`)
            .end((error, response) => {
                expect(response.statusCode).to.equal(200);
                expect(response.body.length).to.equal(startingCartLength - 1);
                done();
            });
    });

});

// //test for /api/me/cart/:productId POST request
describe('/POST cart/:productId', () => {
 //login before each test
 beforeEach(async function () {
    const userLogin = {
                password: 'tucker',
                username: 'lazywolf342'
            }
    
    const loginRes = await chai
        .request(server)
        .post('/api/login')
        .send(userLogin)
        
  
    userToken = loginRes.body;

    //add an item to the cart
    const postRes = await chai
        .request(server)
        .post(`/api/me/cart?productId=5&accessToken=${userToken.accessToken}`)
  
    userToken.cart = postRes.body;
    });

// should only allow access if token is sent
it('should return error if no token sent in request', done => {
chai
    .request(server)
    .post(`/api/me/cart/5?quantity=7`)
    .end((error, response) => {
        expect(response.statusCode).to.equal(400);
        done();
    });
});

// should require quantity
it('should return error if no quantity sent in request', done => {
    chai
        .request(server)
        .post(`/api/me/cart/5?quantity=7`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(400);
            done();
        });
    });

//token must be valid
it('should return error if token is invalid', done => {
    chai
        .request(server)
        .post(`/api/me/cart/5?quantity=7accessToken=bananas`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(401);
            done();
        });
});

//product id must be valid
it('should return error if product is not in cart', done => {
    chai
        .request(server)
        .post(`/api/me/cart/bananas?quantity=7&accessToken=${userToken.accessToken}`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(404);
            done();
        });
});

//return error if invalid parameters sent
it('should return error if invalid parameters sent', done => {
    chai
        .request(server)
        .post(`/api/me/cart/5?quantity=7&accessToken=${userToken.accessToken}&banana=bananas`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(400);
            done();
        });
});

//should return 200 on success
it('should return 200 if request valid', done => {
    chai
        .request(server)
        .post(`/api/me/cart/5?quantity=7&accessToken=${userToken.accessToken}`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(200);
            done();
        });
});

//update quantity
it('should update quantity of selected item in cart', done => {
    //get starting quantity
    const productStartingQuantity = userToken.cart.find(cartItem => {
        return cartItem.product.id === "5"
    }).quantity

    chai
        .request(server)
        .post(`/api/me/cart/4?accessToken=${userToken.accessToken}`)
        .end((error, response) => {
            //check for item in updated cart
            const isItemInCart = response.body.find(cartItem => {
                return cartItem.product.id === '4';
            })
            expect(response.statusCode).to.equal(200);
            expect(isItemInCart).to.equal(undefined);
            done();
        });
});

//delete no other items from cart
it('should remove only selected product from cart', done => {
    //get cart length
    startingCartLength = userToken.cart.length;

    chai
        .request(server)
        .post(`/api/me/cart/4?accessToken=${userToken.accessToken}`)
        .end((error, response) => {
            expect(response.statusCode).to.equal(200);
            expect(response.body.length).to.equal(startingCartLength - 1);
            done();
        });
});


//should only allow access if valid token is sent
// it('should only allow access if token is sent in request', done => {
//     chai
//         .request(server)
//         .get(`/api/me/cart`)
//         .end((error, response) => {
//             expect(response.statusCode).to.equal(400);
//             done();
//         });
// });
//     //
    //change quantity of product in cart

    //change only product selected

    //return success on update

    //return error if product not found in cart

    //return error if no product by id exists

    //return error if invalid parameters sent

//     it('it should', done => {
//         chai
//             .request(server)
//             .post('/api/me/cart/:productId')
//             .end((error, response) => {
//                 expect(response.body).to.be.an();
//         done();
//             });
//     });
});




