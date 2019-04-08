let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
//let { expect } = require('chai');
let should = chai.should();

let Brands = require('../initial-data/brands.json');

chai.use(chaiHttp);


// GET /api/brands:
describe('Brands', () => {
    describe('/Get all brands', () => {
        it('it should GET all the brands', done => {
            // act
            chai
                .request(server)
                .get('/api/brands')
            // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');    
                done();
            });        
        });
    });
});

// GET /api/brands/{id}/products:
describe('Products', () => {
    describe('/Get products under a brand', () => {
        it('it should GET all products under a given brand ', done => {
            // act
            chai
                .request(server)
                .get('/api/brands/1/products') // {id} = 1
            // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eq(3);
                done();
                });
        });
        it('it should GET return 404 status error for "Brand not found"', done => {
            // act
            chai
                .request(server)
                .get('/api/brands/99/products')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
            });
        it('it should GET return 404 status error for missing id', done => {
            // act
            chai
                .request(server)
                .get('/api/brands/products')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
            });
        });
    });
});


// GET /api/products:
describe('Products', () => {
    describe('/Get products with search', () => {
        it('it should GET a product matching the given query', done => {
            // act
            chai
                .request(server)
                .get('/api/products?query=Superglasses')
            // assert
                .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('array');
                        res.body.length.should.be.eq(1);
                    done();
                    });
                });
        it('it should GET return 404 status error for "Product not found"', done => {
            // act
            chai
                .request(server)
                .get('/api/products?query=Aviator')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
            }); 
        it('it should GET return 404 status error for missing query', done => {
            // act
            chai
                .request(server)
                .get('/api/products?query=')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
            });  
    });
});


// POST /api/login:
describe('User', () => {
    describe('/Post login', () => {
        it('it should POST user email and password for login', done => {
            //arrange
            let user = {
                email: 'susanna.richards@example.com',
                password: 'jonjon'
            };
            // act
            chai
                .request(server)
                .post('/api/login')
                .send(user)
            // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                    res.body.length.should.be.eq(16);
                done();
                });
            });  

        it('it should not POST invalid user email and password for login', done => {
            //arrange
            let user = {
                email: 'myemail@email.com',
                password: 'myVerySecurePW'
            };
            // act
            chai
                .request(server)
                .post('/api/login')
                .send(user)
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
            });  

        it('it should not POST incorrectly formatted fields for login', done => {
            //arrange
            let user = {
                email: 'myemail@email.com',
                password: ''
            };
            // act
            chai
                .request(server)
                .post('/api/login')
                .send(user)
            // assert
                .end((err, res) => {
                    res.should.have.status(400);
                done();
                });
        });  
    });
});


// GET /api/me/cart:
describe('User', () => {
    describe('/Get user cart', () => {
        it('it should GET the shopping cart contents of authorized user', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart?token=5KOhhid8ejSRJ0zL') // make a login call, and pass in token within 15 min
            // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array'); // user.cart
                    res.body.length.should.be.eq(1);
                done();
                });
        });
        it('it should not GET cart contents if no access token submitted in request', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart')
            // assert
                .end((err, res) => {
                    res.should.have.status(401);
                done();
                });
        });
        it('it should not GET cart contents if no cart exists for user', done => {
            // arrange
                // make new user object without a cart in users.json 
            // act
            chai
                .request(server)
                .get('/api/me/cart?token=qibLiJddvXLPRUqW')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
        });
    });
});


// POST /api/me/cart:
describe('User', () => {
    describe('/Post user cart', () => {
        it('it should UPDATE the shopping cart contents of authorized user', done => {
            //arrange
                let product = {
                    id: "12",
                    categoryId: "5",
                    name: "The Aviator",
                    description : "The coolest glasses in the world",
                    price: 185,
                    imageUrls :["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }
            // act
            chai
                .request(server)
                .post('/api/me/cart')
                .send(product)
                // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should not UPDATE user cart if no access token submitted in request', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart')
            // assert
                .end((err, res) => {
                    res.should.have.status(401);
                done();
                });
        });
        it('it should not UPDATE cart contents if no cart exists for user', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart?token=qibLiJddvXLPRUqW')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
        });
    });
});

// POST /api/me/cart/{productId}:
describe('User', () => {
    describe('/Post product to user cart', () => {
        it('it should ADD a product to the cart of authorized user', done => {
            // act
            chai
                .request(server)
                .post('/api/me/cart/4?token=qibLiJddvXLPRUqW')
                // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should not ADD a product to the cart if no access token submitted in request', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart/4?token=')
            // assert
                .end((err, res) => {
                    res.should.have.status(401);
                done();
                });
        });
        it('it should not ADD a product to the cart if no cart exists for user', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart?token=qibLiJddvXLPRUqW')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
        });
    });
});

// DELETE /api/me/cart/{productId}:
describe('User', () => {
    describe('/Delete product from user cart', () => {
        it('it should DELETE a product from the cart of authorized user', done => {
            // act
            chai
                .request(server)
                .post('/api/me/cart/1?token=qibLiJddvXLPRUqW')
                // assert
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should not DELETE a product from the cart if no access token submitted in request', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart/1?token=')
            // assert
                .end((err, res) => {
                    res.should.have.status(401);
                done();
                });
        });
        it('it should not DELETE a product from the cart if no cart exists for user', done => {
            // act
            chai
                .request(server)
                .get('/api/me/cart?token=qibLiJddvXLPRUqW')
            // assert
                .end((err, res) => {
                    res.should.have.status(404);
                done();
                });
        });
    });
});
