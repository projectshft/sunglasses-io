let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('The sunglasses store', () => {
    //variable token to hold the token of the current user after login to pass for validation
    let token = '';

    describe('/GET api/brands', () => {
        it('it should GET all the brands', done => {
          chai
            .request(server)
            .get('/api/brands')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(5);
              done();
            });
        });

        it('it should not GET the brands', done => {
            let brands = []
            chai
                .request(server)
                .get('/api/'+ brands)
                .end((err, res) => {
                res.should.have.status(404);
                done();
                });
        });
    });

    describe('/GET api/brands/:id/products', () => {
        it('it should GET all the products of specific brand by brand id', done => {
                let testId = 2
                chai
                .request(server)
                .get('/api/brands/'+ testId + '/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(testId);
                    done();
                });
        });

        it('it should fail because we do not have brand with id=8 ', done => {
            let wrongId = 8
            chai
            .request(server)
            .get('/api/brands/'+ wrongId + '/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });

        it('it should fail because we do not have brand with id not a number ', done => {
            let notNum = 'word'
            chai
            .request(server)
            .get('/api/brands/'+ notNum + '/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
        });

    });

    describe('/GET api/products', () => {
        it('it should GET all the products with a query string Sugar', done => {
          chai
            .request(server)
            .get('/api/products?query=Sugar')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(1);
              done();
            });
        });

        it('it should not GET any products', done => {
            let products = []
            chai
                .request(server)
                .get('/api/'+ products)
                .end((err, res) => {
                res.should.have.status(404);
                done();
                });
        });

        it('it should GET all the products', done => {
            chai
              .request(server)
              .get('/api/products')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(11);
                done();
              });
          });
    });

    describe('/POST api/login', () => {
        it('it should login a valid user', done => {
            // arrange
            let user = {
                'username': 'yellowleopard753',
                "password": "jonjon"
            }

            chai
                .request(server)
                .post('/api/login')
                .send(user)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('string');
                token = res.body;
                done();
            });
        });

        it('it should not login an invalid user', done => {
            // arrange
            let user = {
                "username": "test",
                "password": "jonjon"
            }

            chai
                .request(server)
                .post('/api/login')
                .send(user)
                // assert
                .end((err, res) => {
                res.should.have.status(401);
                done();
            });
        });
    });

    describe('/POST api/me/cart', () => {
        it('it should add product to the user cart', done => {
            // arrange
            let cartItem = {
                    product: {
                        "id": "2",
                        "categoryId": "1",
                        "name": "Black Sunglasses",
                        "description": "The best glasses in the world",
                        "price":100,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: 1
                }
            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
                });
        });

        it('it should not post without the price field', done => {
            // arrange
            let cartItem = {
                product: {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                quantity: 1
            }

            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(500);
                done();
                });
        });
    
        it('it should increment quantity of the product in the user cart', done => {
            // arrange
            let cartItem = {
                    product: {
                        "id": "2",
                        "categoryId": "1",
                        "name": "Black Sunglasses",
                        "description": "The best glasses in the world",
                        "price":100,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: 1
                }
            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body[0].should.have.property('quantity');
                done();
                });
        });

        it('it should add product to the user cart not the same category', done => {
            // arrange
            let cartItem = {
                    product:     {
                        "id": "3",
                        "categoryId": "1",
                        "name": "Brown Sunglasses",
                        "description": "The best glasses in the world",
                        "price":50,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: 1
                }
            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body[0].should.have.property('quantity');
                done();
                });
        });

        it('it should fail to add product with negative quantity', done => {
            // arrange
            let cartItem = {
                    product:     {
                        "id": "3",
                        "categoryId": "1",
                        "name": "Brown Sunglasses",
                        "description": "The best glasses in the world",
                        "price":50,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: -20
                }
            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(404);
                done();
                });
        });

        it('it should fail to add product with not a number quantity', done => {
            // arrange
            let cartItem = {
                    product:     {
                        "id": "3",
                        "categoryId": "1",
                        "name": "Brown Sunglasses",
                        "description": "The best glasses in the world",
                        "price":50,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: 'k'
                }
            chai
                .request(server)
                .post('/api/me/cart?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(404);
                done();
                });
        });
    });

    describe('/GET api/me/cart', () => {
        it('it should GET all the products in the cart for the user', done => {

            chai
                .request(server)
                .get('/api/me/cart?accessToken=' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
                });
        });

        it('it should let know the token is missing ', done => {
            
            chai
                .request(server)
                .get('/api/me/cart?accessToken=' )
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });
    //update product properties
    describe('/POST api/me/cart/:productId', () => {
        it('it should update product properties in the cart, changed price for the test', done => {
            // arrange
            let cartItem = {
                product: {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "price":150,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                quantity: 1
            }

            chai
                .request(server)
                .post('/api/me/cart/2?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
                });
        });
    });   
  
    describe('/DELETE api/me/cart/:productId', () => {
        it('it should delete product from the cart', done => {
            // arrange
            let cartItem = {
                    product:     {
                        "id": "3",
                        "categoryId": "1",
                        "name": "Brown Sunglasses",
                        "description": "The best glasses in the world",
                        "price":50,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    },
                    quantity: 1
                }
            chai
                .request(server)
                .delete('/api/me/cart/3?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body[0].should.have.property('quantity');
                done();
                });
        });

        it('it should decrement quantity for the product we need to delete from the cart', done => {
            // arrange
            let cartItem = {
                product: {
                    "id": "2",
                    "categoryId": "1",
                    "name": "Black Sunglasses",
                    "description": "The best glasses in the world",
                    "price":100,
                    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                quantity: 1
            }
            chai
                .request(server)
                .delete('/api/me/cart/2?accessToken=' + token)
                .send(cartItem)
                // assert
                .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body[0].should.have.property('quantity');
                done();
                });
        });
    });

  });