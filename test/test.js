let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should()
let expect = chai.expect

chai.use(chaiHttp)

// ********  testing /api/brands  
describe('Brands', () => {
    describe('/GET brands', () => {
        it('GET all the brands', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.an('array')
                    done()
                })
        })
        it('it should return an error if no brands returned', done => {
            let brands = [];
            chai
                .request(server)
                .get(brands)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.not.be.an('array')
                    done()
                })
        })
    })
    // GET brands by ID
    describe('GET /api/brands/:brandId/products', () => {
        it('should return an array of products with the given brandId', done => {
            // arrange: "brandId = 1"
            // act
            chai
                .request(server)
                .get('/api/brands/1/products')
                .end((error, response) => {
                    // assert
                    response.status.should.equal(200);
                    response.body.should.be.an('array');
                    response.body.should.have.length(3);
                    done();
                });
        });
        it('should return an error if no products are found with that brandId', done => {
            chai
                .request(server)
                .get('/api/brands/bob/products')
                .end((error, response) => {
                    response.status.should.equal(404);
                    done();
                });
        });
    })
    // Gets all products
    describe('Products', () => {
        describe('/GET products', () => {
            it('GET all the products', done => {
                chai
                    .request(server)
                    .get('/api/products')
                    .end((error, response) => {
                        response.should.have.status(200)
                        response.body.should.be.an('array')
                        done()
                    })
            })
            it('it should return an error if no products returned', done => {
                let products = [];
                chai
                    .request(server)
                    .get(products)
                    .end((error, response) => {
                        response.should.have.status(404)
                        response.body.should.not.be.an('array')
                        done()
                    })
            })
        })
    })

//  log in test  
    describe('Login', () => {
        describe('/POST login', () => {
          it('it should return error without username or password was submitted', done => {
            chai
              .request(server)
              .post('/api/login')
              .send({ username: '', password: '' })
              .end((error, response) => {
                response.should.have.status(405)
                response.should.not.have.property('password')
                response.should.not.have.property('username')
                done()
              })
          })
          it('it should return error if incorrect password or username', done => {
            chai
              .request(server)
              .post('/api/login')
              .send({ username: 'madeline', password: '342623q' })
              .end((error, response) => {
                response.should.have.status(406)
                response.should.not.have.property('password')
                response.should.not.have.property('username')
                done()
              })
          })
          it('it should return access token if valid username and password was submitted', done => {
            chai
              .request(server)
              .post('/api/login')
              .send({ username: 'greenlion235', password: 'waters' })
              .end((error, response) => {
                response.should.have.status(200)
                response.type.should.equal('application/json')
                accessToken = response.body
                should.not.exist(error)
                done()
              })
          })
        })
    })
    //  GET cart test
    describe('GET/api/me/cart', () => {
            describe('/GET cart', () => {
              it('it should return error if not logged in', done => {
                chai
                  .request(server)
                  .get('/api/me/cart')
                  .end((error, response) => {
                    response.should.have.status(400)
                    response.body.should.be.an('object')
                    done()
                  })
              })
            })

            describe('/GET get cart', () => {
                it('it should get the cart for a user after they log in', done => {
                  // log user in
                  
                    let user = { username: 'greenlion235', password: 'waters' }
                    
                      chai
                        .request(server)
                        .post('/api/login')
                        .send(user)
                        .end((err, res) => {
                            chai
                            .request(server)
                            .get(`/api/me/cart?token=${res.body.token}`)
                            .end((err, res) => {
                          res.should.have.status(200);
                          res.body.should.be.a('array');
                          res.body.length.should.be.eql(0);
                          done();
                        })
                    });
                })
              });
    })

            // describe('GET/api/me/cart', () => {
            //   it('it should let user access cart if valid access token', done => {
            //     chai
            //     .request(server)
            //     .post('/api/login')
            //     .send({ username: 'greenlion235', password: 'waters' })
            //     .end((err, res) => {
            //       // add product to cart  
            //     chai
            //       .request(server)
            //       .get(`/api/me/cart?token=${res.body.token}`)
            //       .end((error, response) => {
            //         res.should.have.status(200);
            //         res.body.should.be.a('array');
            //        // res.body.length.should.be.eql(0);
            //         done();
            //       })
            //     })
            //   })
            // })

            describe('/POST /api/me/cart/:productId', () => {
                it('if a user is not logged in, they should not be allowed to add a product to their cart', done => {
                  chai
                    .request(server)
                    .post('/api/me/cart/3')
                    .end((error, response) => {
                      response.should.have.status(408)
                      response.body.should.be.an('object')
                      done()
                    })
                })
                it('it should not allow a logged in user to add a product to their cart if the product doesnt exist', done => {
                  chai
                    .request(server)
                    .post('/api/me/cart/20')
                    .set('token', accessToken)
                    .end((error, response) => {
                      response.should.have.status(409)
                      response.body.should.be.an('object')
                      done()
                    })
                })
                it('it should allow a user to add a product their cart if they are logged in', done => {
                  chai
                    .request(server)
                    .post('/api/me/cart/3')
                    .set('token', accessToken)
                    .end((error, response) => {
                      response.should.have.status(200)
                      response.body.should.be.an('array')
                      cart = response.body
                      response.body.should.have.deep.members([
                        {
                          quantity: 1,
                          product: {
                            productId: '3',
                            brandId: '1',
                            productName: 'Brown Sunglasses',
                            description: 'The best glasses in the world',
                            price: 50,
                            imageUrls: [
                              'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                              'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                              'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
                            ]
                          }
                        }
                      ])
            
                      done()
                    })
                })
              })

});