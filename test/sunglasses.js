// define our dependencies/required variables
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

// tests for the brands GET endpoint 
describe('/GET brands', () => {
    // check for the correct array of all brands
    it('it should GET all the brands', done => {
        chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            // 5 brand objects in our array
            res.body.length.should.be.eql(5);
            done();
        });
    });
});

//tests for brands/:id/products GET endpoint
describe('/GET brands/:id/products', () => {
    // check for an array
    it('it should GET an array', done => {
        chai
        .request(server)
        .get('/api/brands/3/products')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
        });
    });
    //check for a correct error to be thrown
    it('it should GET an error if the brand does not exist', done => {
        chai
        .request(server)
        .get('/api/brands/7/products')
        .end((err, res) => {
            res.should.have.status(404);
            done();
        });       
    });
});

//tests for products GET endpoint
describe('/GET products', () => {
    // check for an array 
    it('it should GET an array', done => {
        chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
        });
    });
    //check for all 11 product objects within the array
    it('it should GET all products if no search query is inputted', done => {
        chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.length.should.be.eql(11);
            done();
        });
    });
    // check for the correct product to return when that search is done
    it('it should GET the products that contain the search query given', done => {
        chai
        .request(server)
        .get('/api/products?search=Habanero')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.lengthOf(1);
            done();
        });
    });
    // throw error if no product matchs seach query
    it('it should throw error if search query does not match any products', done => {
        chai
        .request(server)
        .get('/api/products?search=nothing')
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });
    });
});

// tests for the login POST endpoint 
describe('/POST login', () => {
    //successfully logs in an existing user
    it('it should log a user in if valid credentials are given', done => {
        let login = {
            username: "lazywolf342",
            password: "tucker",
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });  
    });
    //throw error if username/password are incorrect
    it('it should NOT log a user in and send an error if login credentials are incorrect', done => {
        let login = {
            username: "lazywolf342",
            password: "nottucker",
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            res.should.have.status(401);
            done();
        });  
    });
    //throw error if password and username are missing
    it('it should NOT log a user in and send an error if username and password are blank', done => {
        let login = {
            username: "",
            password: "",
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });  
    });
    //throw error if username is missing
    it('it should NOT log a user in and send an error if username is missing', done => {
        let login = {
            username: "",
            password: "tucker",
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });  
    });
    //throw error if password is missing
    it('it should NOT log a user in and send an error if password is missing', done => {
        let login = {
            username: "lazywolf342",
            password: "",
        }
        chai
        .request(server)
        .post('/api/login')
        .send(login)
        .end((err, res) => {
            res.should.have.status(400);
            done();
        });  
    });
});

// tests for the users cart GET endpoint 
describe('/GET me/cart', () => {
     // check for items in the cart
     it('it should GET items in the cart', done => {
        chai
        .request(server)
        .get('/api/me/cart?token=atoken32')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(0);
            done();
        });
    });
    // throw error if user does not have access token
    it('it should not GET cart if user is without an access token', done => {
        chai
        .request(server)
        .get('/api/me/cart')
        .end((err, res) => {
            res.should.have.status(401);
            done();
        });
    });
});

// tests for the users cart POST endpoint 
describe('/POST me/cart', () => {
    //testable data
    let product = {
        "id": "6",
        "categoryId": "3",
        "name": "glas",
        "description": "Pretty awful glasses",
        "price":10,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    };
    let fakeProduct = {};
    // add a product to the cart
    it('it should add a product to the cart', done => {
       chai
       .request(server)
       .post('/api/me/cart?token=atoken32')
       .send(product)
       .end((err, res) => {
           res.should.have.status(200);
           done();
       });
   });
   // throw error if user does not have access token
   it('it should not  add a product to the cart if user is without an access token', done => {
       chai
       .request(server)
       .post('/api/me/cart')
       .end((err, res) => {
           res.should.have.status(401);
           done();
       });
   });
   // throw an error if that product doesn't exist
   it('should not add a non existent product to the cart', done => {
      chai
      .request(server)
      .post('/api/me/cart?token=atoken32')
      .send(fakeProduct)
      .end((err, res) => {
          res.should.have.status(404);
          done();
       });
   });
});


// tests for the users cart POST endpoint 
describe('/POST me/cart/:productId', () => {
    // add a product to the cart
    it('it should add a product to the cart', done => {
       chai
       .request(server)
       .post('/api/me/cart/10?token=atoken32')
       .end((err, res) => {
           res.should.have.status(200);
           done();
       });
   });
   // throw error if user does not have access token
   it('it should not  add a product to the cart if user is without an access token', done => {
       chai
       .request(server)
       .post('/api/me/cart/10')
       .end((err, res) => {
           res.should.have.status(401);
           done();
       });
   });
   // throw an error if that product doesn't exist
   it('should not add a non existent product to the cart', done => {
      chai
      .request(server)
      .post('/api/me/cart/69?token=atoken32')
      .end((err, res) => {
          res.should.have.status(404);
          done();
       });
   });
});

// tests for the users cart DELETE endpoint 
describe('/DELETE me/cart/:productId', () => {
    // delete a product from the cart
    it('it should delete a product in the cart', done => {
        // add an item first
       chai
       .request(server)
       .post('/api/me/cart/10?token=atoken32')
       .end((err, res) => {
           //delete that item from the cart
           chai
           .request(server)
           .delete('/api/me/cart/10?token=atoken32')
           .end((err, res) => {
           res.should.have.status(200);
           done();
           });
        });
    });
   // throw error if user does not have access token
   it('it should not  add a product to the cart if user is without an access token', done => {
       // add an item first
       chai
       .request(server)
       .post('/api/me/cart/10?token=atoken32')
       .end((err, res) => {
           chai
           .request(server)
           .delete('/api/me/cart/10?token=atoken31')
           .end((err, res) => {
           res.should.have.status(401);
           done();
           });
        });
    });
   // throw an error if that product doesn't exist
   it('should not delete a non existent product from the cart', done => {
        chai
        .request(server)
        .post('/api/me/cart/10?token=atoken32')
        .end((err, res) => {
            chai
            .request(server)
            .delete('/api/me/cart/69?token=atoken31')
            .end((err, res) => {
            res.should.have.status(401);
            done();
            });
        });
    });
});