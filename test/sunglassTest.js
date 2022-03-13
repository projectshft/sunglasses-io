const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require('../app/server.js');

should = chai.should();


chai.use(chaiHttp);


//For route /api/brands
describe("Store brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          res.body[0].should.have.keys('id', 'name');
          done();
        });
    });
  });
});


// For route  /api/products
describe("Store products", () => {
  describe("/GET products", () => {
    it("it should GET all the products with just regular entry", (done) => {
      chai
        .request(server)
        .get("/api/products/")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          done();
        });
    });
  

    it("it should GET all the products when the query is blank", (done) => {
      chai
        .request(server)
        .get("/api/products?q=")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          done();
        });
    });


  it('If there is a valid search term entered, the relevant products should be returned', (done) => {
    chai
      .request(server)
      .get('/api/products?q=superglasses')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.be.eql(1);
        res.body.should.be.an('array');
        res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
        done();
      });
  });
  
  it('If the query search is unrelated to the store products, an error should be returned', (done) => {
    chai
      .request(server)
      .get('/api/products?q=handbag')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
});


//  For route /api/brands/:id/products
describe("Products by brand", () => {
  describe('/GET products by brand', () => {
    it('it should GET products by the given brand id', (done) => {
        chai
          .request(server)
          .get("/api/brands/5/products")
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an("array");
                res.body.length.should.be.eql(2)
                res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
                done();
          });
        });
    });


    it('it should give 404 error if the id is invalid (e.g. wrong number)', (done) => {
      chai
        .request(server)
        .get('/api/brands/42/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('it should give 404 error if the id is invalid (e.g. word)', (done) => {
      chai
        .request(server)
        .get('/api/brands/coffee/products')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });


//  POST /api/login
describe("Login", () => {
  describe("/POST login", () => {
    it('it should give an error if the username or password is missing', (done) => {
      chai
        .request(server)
        .post('/api/login/')
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it('it should give an error if the username is incorrect', (done) => {
      chai
        .request(server)
        .post('/api/login/')
        .send({username: 'billybobbo', password: 'waters'})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it('it should give an error if the password is incorrect', (done) => {
      chai
        .request(server)
        .post('/api/login/')
        .send({username: 'greenlion235', password: 'ismokecigars'})
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    
    it("it should POST login information to the server", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({username: 'greenlion235', password: "waters"})
        .end((err, res) => {
          if(err) done(err);
          res.should.have.status(200);
          res.body.should.be.a("string")
          res.body.length.should.be.eql(16);
          should.not.exist(res.body.password);
          done();
        });
    });
  });
});

// # GET /api/me/cart
describe("Consumer cart", () => {
  //Need to set the access token so that we can get into a cart - so first need to login using one of the user profiles
  let accessToken = '';
    before('login so we have a token', (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({username: "greenlion235", password: "waters" })
        .end((err, res) => {
         accessToken=res.body;
         done();
        })
    }) 

    let product =    {
      "id": "1",
      "categoryId": "1",
      "name": "Superglasses",
      "description": "The best glasses in the world",
      "price":150,
      "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
  }

 
  describe('/GET products in the cart', () => {
    it('it should GET products in the cart', (done) => {
        chai
          .request(server)
          .get("/api/me/cart/")
          .query({'accessToken': accessToken})
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an("array");
                done();
          })
        });

    it('it should give an error if there is a missing token', (done) => {
        chai
        .request(server)
        .get("/api/me/cart/")
        .query({'accessToken': ""})
        .end((err, res) => {
            res.should.have.status(401);
            done();
      })

      it('it should give an error if there is a bad token (e.g. expired/not valid)', (done) => {
        chai
        .request(server)
        .get("/api/me/cart/")
        .query({'accessToken': 'balloon'})
        .end((err, res) => {
            res.should.have.status(401);
            done();
      })
    });
  });
});
   
  //  POST /api/me/cart
    describe("/POST to the cart", () => {
      it('an empty post to the cart should come back with an error', (done) => {
        chai
          .request(server)
          .post('/api/me/cart')
          .query({'accessToken': accessToken})
          .send("")
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });

      it('an invalid access token should prevent posting to cart', (done) => {
        chai
          .request(server)
          .post('/api/me/cart')
          .query({'accessToken': "chopsticks"})
          .send(product)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      it('a missing access token should prevent posting to cart', (done) => {
        chai
          .request(server)
          .post('/api/me/cart')
          .query({'accessToken': ""})
          .send(product)
          .end((err, res) => {
            res.should.have.status(401);
            done();
          });
      });

      it('a valid item by a logged in user should post to the cart', (done) => {
        chai
          .request(server)
          .post('/api/me/cart')
          .query({'accessToken': accessToken})
          .send(product)
          .end((err, res) => {
            res.should.have.status(200);
            res.should.be.an('object');
            done();
          });
      });
  });


  // # POST /api/me/cart/:productId
describe('/POST update to a product quantity in cart ', () => {
  let updatedQuantity = {
    quantity: 4
  }

  let negativeQuantity = {
    quantity: -1
  }

  let stringQuantity = {
    quantity: "balloon"
  }

  let equalQuantity = {
    quantity: 1
  }

  describe('/api/me/cart/:productId', () => {
    it('it should give an error if access token is missing', (done) => {
      chai
      .request(server)
      .post('/api/me/cart/1')
      .send(updatedQuantity)
      .query({'accessToken': ''})
      .end((err, res) => {
            res.should.have.status(401);
        done();
      });
});

  it('it should give an error if access token is wrong', (done) => {
    chai
    .request(server)
    .post('/api/me/cart/1')
    .send(updatedQuantity)
    .query({'accessToken': 'marbles'})
    .end((err, res) => {
          res.should.have.status(401);
      done();
    });
});

 
it('it should give an error if no product is found', (done) => {
  chai
  .request(server)
  .post('/api/me/cart/7')
  .query({'accessToken': accessToken})
  .send(updatedQuantity)
  .end((err, res) => {
        res.should.have.status(404);
    done();
  });
});

  it('it return an error if an invalid quantity is entered (e.g negative number) ', (done) => {
    chai
      .request(server)
      .post('/api/me/cart/1')
      .query({'accessToken': accessToken})
      .send(negativeQuantity)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('it return an error if an invalid quantity is entered (e.g. string)', (done) => {
    chai
      .request(server)
      .post('/api/me/cart/1')
      .query({'accessToken': accessToken})
      .send(stringQuantity)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('it return an error if the quantity entered as an update is the same as that which already exists', (done) => {
    chai
      .request(server)
      .post('/api/me/cart/1')
      .query({'accessToken': accessToken})
      .send(equalQuantity)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('it should update quantity if logged in and product exists in cart', (done) => {
    chai
      .request(server)
      .post('/api/me/cart/1')
      .query({'accessToken': accessToken})
      .send(updatedQuantity)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array")
        done();
      });
  });
});

  // DELETE /api/me/cart/:productId
describe('/DELETE items from cart' , () => {
  it('it should DELETE a product given the user cart', (done) => {
            chai
            .request(server)
            .delete('/api/me/cart/1')
            .query({'accessToken': accessToken})
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.an('array');
              done();
            });
      })
  
    it('it should give an error if no product is found', (done) => {

              chai
              .request(server)
              .delete('/api/me/cart/7')
              .query({'accessToken': accessToken})
              .end((err, res) => {
                    res.should.have.status(404);
                done();
              });
        });

        it('it should give an error if access token is invalid', (done) => {
                  chai
                  .request(server)
                  .delete('/api/me/cart/7')
                  .query({'accessToken': 'bumblebee'})
                  .end((err, res) => {
                        res.should.have.status(401);
                    done();
                  });
            });

        it('it should give an error if access token is missing', (done) => {
              chai
              .request(server)
              .delete('/api/me/cart/7')
              .query({'accessToken': ''})
              .end((err, res) => {
                    res.should.have.status(401);
                done();
              });
        });
      });

});
});





