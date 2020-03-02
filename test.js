let chai = require('chai');
let chaiHttp = require('chai-http');
let { server, resetCart, setNumberOfFailedLoginRequestsForUsername } = require('./app/server');
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
    it('it should GET all the products with the same brand', done => {
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
    it('it should GET all the products when no keyword is searched', done => {
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
    it('it should GET products that include the keyword if it is in the product description or name', done => {
        chai
            .request(server)
            .get('/api/products?keyword=Black')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(1);
                done();
            });
    });
    it('it should GET products that include the keyword if the keyword is a brand', done => {
        chai
            .request(server)
            .get('/api/products?keyword=Ray+Ban')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(2);
                done();
            });
    });
    it('it should GET products that include the keyword if  it is the price', done => {
        chai
            .request(server)
            .get('/api/products?keyword=1500')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(2);
                done();
            });
    });
    it('it should not GET products when the keyword does not match', done => {
        chai
            .request(server)
            .get('/api/products?keyword=jskhsdhpasohgpo')
            .end((err, res) => {
                res.should.have.status(404);
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

    it('if user password is incorrect 3 times they should recieve a 401', done => {
        setNumberOfFailedLoginRequestsForUsername("greenlion235", 0)
        const user = {
            username: "greenlion235",
            password: "nottherightpassword"
        }
        chai
            .request(server)
            .post('/api/login')
            .send(user)
            .end((err, res) => {
                res.should.have.status(401);
                chai
                .request(server)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    chai
                    .request(server)
                    .post('/api/login')
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(401);
                        const user2 = {
                        username: "greenlion235",
                        password: "waters"
                        }
                        chai
                            .request(server)
                            .post('/api/login')
                            .send(user2)
                            .end((err, res) => {
                                res.should.have.status(404);
                                done();
                        });
                    })
                })
            })
    });    
});

//resets cart and failed number of logins before each test
describe('Cart', function() {
    beforeEach(function() {
        resetCart()
        setNumberOfFailedLoginRequestsForUsername("greenlion235", 0)
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

    it('it should NOT Post if quanity is not a number', done => {
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
                 quanity: 'fish'
            }
                chai
                .request(server)
                .post('/api/me/cart?accessToken='+ res.body)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
            });
        });
        
    });

    it('it should NOT Post if request is not an object', done => {
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
            let addProduct = [{
                product: {
                "id": "1",
                "categoryId": "1",
                "name": "Superglasses",
                "description": "The best glasses in the world",
                "price":150,
                "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                }},
                {quanity: 'fish'}
            ]
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
    
    it('if the same product is added twice, it should give back error that product is already in the cart', done => {
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
                        chai
                        .request(server)
                        .post('/api/me/cart?accessToken='+ token)
                        .send(addProduct)
                        .end((err, res) => {
                            res.should.have.status(405);
                            done();
                        });
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

    it('should not Delete item with no ID number ', done => {
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
                    .delete('/api/me/cart?accessToken='+ token)
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
                        .end((err, res) => {
                            res.should.have.status(401);
                            done();
                        });
                    });
        }); 
    });
 });

//editing quanity of item in cart cart
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
                    chai
                        .request(server)
                        .post('/api/me/cart/1?quanity=5&accessToken='+ token)
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

    it('should not edit quanity if quanity is not passed as a parameter', done => {
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
                            .post('/api/me/cart/1?&accessToken='+ token)
                            .end((err, res) => {
                                res.should.have.status(404);
                                done();
                            });
                    });
                })
    }); 

    it('should not edit quanity if quanity is a string', done => {
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
                .post('/api/me/cart?&accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai
                        .request(server)
                        .post('/api/me/cart/1?quanity=string&accessToken='+ token)
                        .end((err, res) => {
                            res.should.have.status(404);
                            done();
                        });
                });
            })
    }); 

    it('should not edit quanity if quanity is a negative number', done => {
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
                .post('/api/me/cart?&accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai
                        .request(server)
                        .post('/api/me/cart/1?quanity=-5&accessToken='+ token)
                        .end((err, res) => {
                            res.should.have.status(404);
                            done();
                        });
                });
            })
    }); 

    it('should not edit quanity if quanity is a decimal', done => {
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
                .post('/api/me/cart?&accessToken='+ token)
                .send(addProduct)
                .end((err, res) => {
                    res.should.have.status(200);
                    chai
                        .request(server)
                        .post('/api/me/cart/1?quanity=5.8&accessToken='+ token)
                        .end((err, res) => {
                            res.should.have.status(404);
                            done();
                        });
                });
            })
    });
})
});
