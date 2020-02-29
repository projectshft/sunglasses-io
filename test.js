let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');
let should = chai.should();

chai.use(chaiHttp);

//testing to see that all the initial 5 brands are returned when ran
describe('/GET brands', () => {
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
});

//test to get all the products in a specific brand
describe('/GET brands/:id/products', () => {
    it('it should GET all the products with ', done => {
        //act
        chai
            .request(server)
            .get('/api/brands/1/products')
            //assert
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(3);
                //maybe add more specifics
                done();
            });
    });

    it('it should not GET all the products with an invalid ID', done => {
        chai
            .request(server)
            .get('/api/brands/6/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });

    it('it should not GET all the products if ID is not a number', done => {
        chai
            .request(server)
            .get('/api/brands/hello/products')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});

//testing to see that all the initial 11 products are returned when ran
describe('/GET products', () => {
    it('it should GET all the brands', done => {
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

//testing posting login in
describe('/POST login', () => {
    it('it should POST users login', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('string')
                done();
            });
    });

    it('it should return error if users password is incorrect', done => {
        const user = {
            username: "hello",
            password: "waters"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('it should return error if username is invalid', done => {
        const user = {
            username: "greenlion235",
            password: "hello"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                done();
            });
    });

    it('if user did not pass any username or password', done => {
        chai
            .request(server)
            .post('/api/login')
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
});

//testing to get an empty cart when cart is first recieved
describe('/GET me/cart', () => {
    it('it should GET current users cart', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
                chai
                .request(server)
                .get('/api/me/cart?accessToken='+res.body)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array')
                    res.body.length.should.be.eql(0);
                    done();
            });
        });
        
    });

    it('it should NOT GET current users cart without accessToken', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
                chai
                .request(server)
                .get('/api/me/cart')
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
            });
        });
        
    });
});

//testing to add an item to cart
describe('/POST me/cart', () => {
    it('it should Post an item to the current users cart', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = { 
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
                chai
                .request(server)
                .post('/api/me/cart?accessToken='+ res.body)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array')
                    res.body[0].should.be.an('object')
                    res.body.length.should.be.eql(1);
                    res.body[0].should.have.property('product');
                    res.body[0].should.have.property('quanity')
                    done();
            });
        });
        
    });

    it('it should NOT Post an item to the current users cart without access token', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = { 
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
                chai
                .request(server)
                .post('/api/me/cart')
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
            });
        });
    });    

    it('it should NOT Post cart item if missing quanity', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct =  { 
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }
            }
                chai
                .request(server)
                .post('/api/me/cart?accessToken='+ res.body)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
            });
        });
        
    });

    it('it should NOT Post cart item if missing product', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct =  { 
                quanity: 1
            }
                chai
                .request(server)
                .post('/api/me/cart?accessToken='+res.body)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
            });
        });
        
    });

    it('if the same product is added twice, it should not Post cart item again but increase the quanity', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = {
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
            let token = res.body
                chai
                    .request(server)
                    .post('/api/me/cart?accessToken='+ token)
                    .send(addProduct)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('array')
                        res.body[0].should.be.an('object')
                        res.body.length.should.be.eql(1);
                        res.body[0].should.have.property('product');
                        res.body[0].should.have.property('quanity');
                        done();
                    });
        }); 
    });
});

//deleting item from cart
describe('/DELETE me/cart/:productId', () => {
    it('should Delete item from cart', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = {
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
            const token = res.body
            chai
                .request(server)
                .post('/api/me/cart?accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai
                    .request(server)
                    .delete('/api/me/cart/1?accessToken='+ token)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.an('array')
                        res.body.length.should.be.eql(0);
                        done();
                        });
                });
            })
    }); 

    it('should not Delete item from cart with invalid productID ', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = {
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
            const token = res.body
            chai
                .request(server)
                .post('/api/me/cart?accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai
                    .request(server)
                    .delete('/api/me/cart/6?accessToken='+ token)
                    .end((err, res) => {
                        res.should.have.status(404);
                        done();
                        });
                });
            })
    }); 

    it('should NOT delete item without access token', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = {
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
                chai
                    .request(server)
                    .post('/api/me/cart?accessToken='+ res.body)
                    .send(addProduct)
                    .end((err, res) => {
                        res.should.have.status(200);
                        chai
                        .request(server)
                        .delete('/api/me/cart/1')
                        .send(addProduct)
                        .end((err, res) => {
                            res.should.have.status(401);
                            done();
                        });
                    });
        }); 
    });
});

//deleting item from cart
describe('/POST me/cart/:productId', () => {
    it('should edit quanity of specific product in cart', done => {
        const user = {
            username: "greenlion235",
            password: "waters"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('string')
            let addProduct = {
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                },
                 quanity: 1
            }
            const token = res.body
            chai
                .request(server)
                .post('/api/me/cart?accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    let editProduct = {
                        product: {
                        "id": "1",
                        "categoryId": "1",
                        "name": "Superglasses",
                        "description": "The best glasses in the world",
                        "price":150,
                        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                        },
                         quanity: 2
                    }
                    chai
                        .request(server)
                        .put('/api/me/cart/1?accessToken='+ token)
                        .send(editProduct)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.an('array')
                            res.body.length.should.be.eql(1);
                            res.body[0].should.be.an('object')
                            res.body[0].should.have.property('product');
                            res.body[0].should.have.property('quanity')
                            done();
                        });
                });
            })
    }); 
})
