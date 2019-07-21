let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

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

//testing for endpoint 2
describe('/GET brands/:id/products', () => {
  //test for successful response given brand id 1
  it('it should GET all of the products by a given brand id', done => {
    chai
      .request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      });
  });
  //test for unsuccessful response when brand id isn't present
  it('it should get a 404 response when the id is not found', done => {
    chai
      .request(server)
      .get('/api/brands/8/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
})

//test for products endpoint
describe('/GET products', () => {
 //test for successful response based on search query provided
 it('it should GET matching pairs of sunglasses based upon provided query', done => {
   chai
    .request(server)
    .get('/api/products?query=sugar')
    .end((err, res) => {
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eql(1);
      done();

    })
 });
 it('it should get a 404 response if no matches to provided query are found', done => {
   chai
    .request(server)
    .get('/api/products?query=bananas')
    .end((err, res) => {
      res.should.have.status(404);
      done();
    })
 });
 it('it should get a 400 response if query is not provided', done => {
   chai
    .request(server)
    .get('/api/products')
    .end((err, res) => {
      res.should.have.status(400);
      done();
    })
 })
 it('it should get a 400 response if query is not formatted correctly', done => {
   chai
    .request(server)
    .get('/api/products?querysugar')
    .end((err, res) => {
      res.should.have.status(400);
      done();
    })
 });
});
 //tests for log in endpoint
 describe('/POST login', () => {
 it('it should get a token object returned if email and password are correct', done => {
   chai
   .request(server)
   .post('/api/login')
   .send({email: "salvador.jordan@example.com", password: "tucker"})
   .end((err, res) => {
     res.should.have.status(200);
     res.should.be.an('object');
     res.body.should.have.property('token');
     done();
   })
  });
  it('it should get a 401 response if email is invalid', done => {
    chai
      .request(server)
      .post('/api/login')
      .send({email: "salvado.jordan@example.com", password: "tucker"})
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
  it('it should get a 401 response if password is invalid', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tuker"})
    .end((err, res) => {
      res.should.have.status(401);
      done();
  })
 })
 it('it should get a 400 response if email is not supplied', done => {
   chai 
    .request(server)
    .post('/api/login')
    .send({password: "jonjon"})
    .end((err, res) => {
      res.should.have.status(400);
      done();
    })
 })
 it('it should get a 400 response if password is not supplied', done => {
  chai 
   .request(server)
   .post('/api/login')
   .send({email: "salvador.jordan@example.com"})
   .end((err, res) => {
     res.should.have.status(400);
     done();
   })
})
it('it should get a 400 response if neither email or password are provided', done => {
  chai 
   .request(server)
   .post('/api/login')
   .send({})
   .end((err, res) => {
     res.should.have.status(400);
     done();
   })
})
});

describe ('/GET me/cart', () => {
  it('it should GET the logged in users cart', done => {
   chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .get('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        })
    })
  })
  it('it should get a 400 response if no access token provided', done => {
    chai  
      .request(server)
      .get('/api/me/cart')
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
  })
  it('it should get a 401 response if access token is not found or expired', done => {
    chai  
      .request(server)
      .get('/api/me/cart')
      .set('authorization', 'Bearer 12dc56i9')
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
  })
})
//200 response test to add product to cart endpoint
describe('/POST /me/cart', () => {
  it('it should add a product to the logged in users cart', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          id: "3",
          quantity: 2
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('id');
          res.body.should.have.property('name');
          res.body.should.have.property('quantity');
          done();
        })
    })
  })
  //testing for 400 response conditions
  it('it should get a 400 response if quantity is less than 1', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          id: "3",
          quantity: 0
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  it('it should get a 400 response if quantity is not provided', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          id: "3",
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  it('it should get a 400 response if id is not provided', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  it('it should get a 400 response if neither quantity nor id are provided', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  it('it should get a 400 response if id is not a string', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          id: 2,
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  it('it should get a 400 response if quantity is not a number', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer '+ res.body.token)
        .send({
          id: '2',
          quantity: '3'
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        })
    })
  })
  //tests for 401 response
  it('it should get a 401 response if no access token is provided', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .send({
          id: '2',
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })
  })
  it('it should get a 401 response if an invalid access token is provided', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer ' + '12ert32145')
        .send({
          id: '2',
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
    })
  })
  it('it should get a 404 response if the product is not found', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer ' + res.body.token)
        .send({
          id: '22',
          quantity: 3
        })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
    })
  })
  it('it should get a 409 response if the product is already in cart', done => {
    chai
    .request(server)
    .post('/api/login')
    .send({email: "salvador.jordan@example.com", password: "tucker"})
    .end((err, res1) => {
      chai
        .request(server)
        .post('/api/me/cart')
        .set('authorization', 'Bearer ' + res1.body.token)
        .send({
          id: '2',
          quantity: 3
        })
        .end((err, res) => {
          chai
            .request(server)
            .post('/api/me/cart')
            .set('authorization', 'Bearer ' + res1.body.token)
            .send({id: '2', quantity: 3})
            .end((err, res) => {
              res.should.have.status(409);
              done();
            })

        })
    })
  })
});

describe('/DELETE /me/cart/{productId}', () => {
  // tests for 401 response
  it('it should get a 401 response if no access token provided', done => {
    chai
      .request(server)
      .post('/api/login')
      .send({email: "salvador.jordan@example.com", password: "tucker"})
      .end((err, res1) => {
            chai
              .request(server)
              .delete('/api/me/cart/2')
              .end((err, res) => {
                res.should.have.status(401);
                done();
              })
          })
      })
    it ('it should get a 401 response if the access token is invalid or expired', done => {
      chai
      .request(server)
      .post('/api/login')
      .send({email: "salvador.jordan@example.com", password: "tucker"})
      .end((err, res1) => {
            chai
              .request(server)
              .delete('/api/me/cart/2')
              .set('authorization', 'Bearer 123eryyffr')
              .end((err, res) => {
                res.should.have.status(401);
                done();
              })
          })
        })
    it ('it should get a 400 response if request is not formatted correctly', done => {
      chai
      .request(server)
      .post('/api/login')
      .send({email: "salvador.jordan@example.com", password: "tucker"})
      .end((err, res) => {
            chai
              .request(server)
              .delete('/api/me/cart/0')
              .set('authorization', 'Bearer ' + res.body.token)
              .end((err, res) => {
                res.should.have.status(400);
                done();
              })
          })
        })
  //tests for 404 item not found in cart error response
    it('it should get a 404 response if item is not found in users cart', done => {
      chai
      .request(server)
      .post('/api/login')
      .send({email: "salvador.jordan@example.com", password: "tucker"})
      .end((err, res) => {
            chai
              .request(server)
              .delete('/api/me/cart/1')
              .set('authorization', 'Bearer ' + res.body.token)
              .end((err, res) => {
                res.should.have.status(404);
                done();
              })
       })
      })
    });
