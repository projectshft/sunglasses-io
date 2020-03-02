let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);

//GET brands tests
describe('/GET /api/brands', () => {
  //positive tests 
    it('it should GET all the brands', done => {
        //act
      chai
        .request(server)
        .get('/api/brands')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          // add more details
          done();
        });
    });
    //negative tests 

    it('it should return a 404 because there no brands', done => {
      //arrange

      let brands = [];
      //act 
      chai
          .request(server)
          .get('/api/' + brands)
          //assert
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });
  });
  it('it should return a 404 because there no brands', done => {
    //act 
    chai
        .request(server)
        //below might be wrong 
        .get('/api/bogus/')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
  });
})

//Get Products by brand Id 
describe('/GET /api/brands/:id/products', () => {
    it('it should GET all the products from a specific brand by brand id', done => {
        //arrange

        //act
      chai
        .request(server)
        .get('/api/brands/1/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array');
          res.body.length.should.be.eql(3);
          res.body[0].should.be.a('object');
          res.body[0].should.have.property('categoryId');
          res.body[0].should.have.property('description')
          res.body[0].should.have.property('id');
          res.body[0].imageUrls.should.be.an('array');
          res.body[0].imageUrls.length.should.eql(3);
          res.body[0].should.have.property('imageUrls');
          res.body[0].should.have.property('name');
          res.body[0].should.have.property('price');
          done();
        });
    });
    it('it should return a 404 error and the brand was not found', done => {
        //arrange
        //act
      chai
        .request(server)
        .get('/api/brands/7/products')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
    it('it should return a 404 error and the brand was not found', done => {
        //arrange
        //act
      chai
        .request(server)
        .get('/api/brands/a/products')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
      });
      it('it should return a 404 error and the product was not found', done => {
          //arrange
          let brands = [
            {
                "id": "1",
                "name" : "Oakley"
            },
            {
                "id": "2",
                "name" : "Ray Ban"
            },
            {
                "id": "3",
                "name" : "Levi's"
            },
            {
                "id": "4",
                "name" : "DKNY"
            },
            {
                "id": "5",
                "name" : "Burberry"
            },
            {
              "id":"6",
              "name": "Chanel"
            }
        ]
          //act
        chai
          .request(server)
          .get('/api/brands/6/products')
          //assert
          .end((err, res) => {
            res.should.have.status(404);
            done();
          });

        })
  });

  //GET products tests
  describe('/GET /api/products', () => {
    //positive tests
    it('it should GET all the products', done => {
        //arrange
 
        //act
      chai
        .request(server)
        .get('/api/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array');
          res.body.length.should.be.eql(11);
          res.body[0].should.be.a('object')
          done();
        });
    });
    //negative tests
    it('it should return a 404 because there are no products', done => {
      let products = [];
      chai
          .request(server) 
          .get('/api/' + products)
          .end((err, res) => {
          res.should.have.status(404);
          done();
          });
  });
  it('it should return a 404 because there are no products', done => {
    //act 
    chai
        .request(server)
        //below might be wrong 
        .get('/api/bogus/')
        //assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });

//POST login tests
describe ('/POST /api/login', () =>{
  //positive test to get the accessToken
    it('it should POST user login', done =>{
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        } 
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('string');
            done();
        })
    })
    //negative tests
    //username field cannot be empty
    it('the login username cannot be empty', done =>{
        //arrange
        let user = {
          username: '',
          password: 'waters'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(400);
            done();
        })
    })
    it('the login password cannot be empty', done =>{
      //arrange
      let user = {
        username: 'greenlion235',
        password: ''
      }
      //act
      chai 
      .request(server)
      .post('/api/login')
      .send(user)
      //assert
      .end((err, res) => {
          res.should.have.status(400);
          done();
      })
  })
    it('the login username is invalid', done =>{
        //arrange
        let user ={
            username: 'greenlion23',
            password: 'waters'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(401);
            done();
        })
    })
    it('the login password is invalid', done =>{
        //arrange
        let user ={
            username: 'greenlion235',
            password: 'water'
        }
        //act
        chai 
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            res.should.have.status(401);
            done();
        })
    })
    it('it should not let the user login after 3 failed login attempts', done =>{
      //arrange
      let user ={
          username: 'greenlion235',
          password: 'water'
      }
      //act
      chai 
      .request(server)
      .post('/api/login')
      .send(user)
          // .send(user)
          // .send(user)
          // .send(user)
      //assert
      .end((err, res) => {
          res.should.have.status(401);
          done();
      })
  })
 
});

//tests for GET the status of your cart
describe('/GET /api/me/cart', () => {
  //positive test 
    it('it should GET the status of the cart', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        }
        //act
      chai
      //
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            let token = res.body 
            res.should.have.status(200);
            res.should.be.json;
            
            chai 
            .request(server)
            .get('/api/me/cart?accessToken=' + token)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                done();
            })
        })
    });
    //negative tests
    it ( 'it should have a valid access token', done => {
      //arrange
      //act
      
      chai 
      .request(server)
      //no access token in the request
      .get('/api/me/cart')
      
      //assert
      .end((err, res) => {
          res.should.have.status(401);
          done();
      })
  })
  });

  //tests for updating cart 
  describe('/POST /api/me/cart', () => {
    it('it should update the items in the cart', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {
          product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            
            res.should.have.status(200);
            res.should.be.json;

            let token = res.body; 
            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + token)
            .send({product: product})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                done();
            })
        })
    });
    it ( 'it should have a valid access token', done => {
      //arrange

      //act
      
      chai 
      .request(server)
      //no access token in the request
      .post('/api/me/cart')
      
      //assert
      .end((err, res) => {
          res.should.have.status(401);
          done();
      })
  });
  });

  //tests for Deleting items by product Id in cart 
  describe('/DELETE /api/me/cart/:productId', () => {
    it('it should DELETE items in the cart by product Id', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {
          product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            let token = res.body;
            res.should.have.status(200);
            res.should.be.json;
           
            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + token)
            .send({product:product})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                //assert
                chai 
                .request(server)
                .delete('/api/me/cart/1?accessToken=' + token)
               
                .end((err, res)=>{
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.an('array');
                    done();
                }) 
              
            })
        })
    });
  //negative tests
//test for valid accessToken 
it ( 'it should have a valid access token', done => {
  //arrange

  //act
  
  chai 
  .request(server)
  //no access token in the request
  .delete('/api/me/cart/1')
  
  //assert
  .end((err, res) => {
      res.should.have.status(401);
      done();
  })
});
});

//tests for updating quantity of product by productId in cart 
  describe('/POST /api/me/cart/:productId', () => {
    it('it should update items in the cart by product Id', done => {
        //arrange
        let user = {
            username: 'greenlion235',
            password: 'waters'
        };
        let product = {product:{ 
            "id": "1",
            "categoryId": "1",
            "name": "Superglasses",
            "description": "The best glasses in the world",
            "price":150,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }, 
        quantity: 1}
        //act
      chai
        .request(server)
        .post('/api/login')
        .send(user)
        //assert
        .end((err, res) => {
            let token = res.body;
            res.should.have.status(200);
            res.should.be.json;

            chai 
            .request(server)
            .post('/api/me/cart?accessToken=' + token)
            .send({product:product})
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.an('array');
                //assert
                chai 
                .request(server)
                .post('/api/me/cart/1?accessToken=' + token)
                //
                .end((err, res)=>{
                    res.should.have.status(200);
                    res.should.be.json;
                    res.body.should.be.an('array')
                    done();
                }) 
              
            })
        })
    });
    //test for valid accessToken 
  it ( 'it should return a 404 and the user needs to have a valid access token', done => {
    //arrange

    //act
    
    chai 
    .request(server)
    //no access token in the request
    .post('/api/me/cart/1')
    
    //assert
    .end((err, res) => {
        res.should.have.status(401);
        done();
    })
  });
  });

  //tests for the search bar 
describe('/GET /api/search', () => {
  it('it should GET the product back with a query string Habanero', done => {
    chai
      .request(server)
      .get('/api/search?query=Habanero')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        res.body.length.should.be.eql(1);
        res.body[0].should.be.a('object');
        res.body[0].should.have.property('id');
        res.body[0].id.should.be.a('string');
        res.body[0].id.should.equal('11');
        res.body[0].should.have.property('categoryId');
        res.body[0].categoryId.should.be.a('string');
        res.body[0].categoryId.should.equal('5');
        res.body[0].should.have.property('description');
        res.body[0].description.should.be.a('string');
        res.body[0].description.should.equal('The spiciest glasses in the world');
        res.body[0].should.have.property('name');
        res.body[0].name.should.be.a('string');
        res.body[0].name.should.equal('Habanero');
        res.body[0].should.have.property('price');
        res.body[0].price.should.be.a('number');
        res.body[0].price.should.equal(153);
        res.body[0].should.have.property('imageUrls');
        res.body[0].imageUrls.should.be.an('array')
        done();
      });
  });
  //negative tests
  it('it should not return a product name or description', done => {
    chai
      .request(server)
      .get('/api/search?query=2')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
  it('it should not return a product name or description ', done => {
    chai
      .request(server)
      //case sensitive 
      .get('/api/search?query=Russia')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});