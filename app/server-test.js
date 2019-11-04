
//Routes to support!
// //GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId

//setting up the testing page with needed variables


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
chai.use(chaiHttp);

describe('/GET Brands', () => {
  it('it should GET all the brands', done => {
        chai
          .request(server)
          .get('/api/brands')
          .end((err, res) => {
            res.should.have.status(200);
            console.log(res.body);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
          })
      });
    });
   
    
    describe('/GET Products', () => {
      it('it should GET all the products', done => {
            chai
              .request(server)
              .get('/api/products')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(11);
                done();
              })
          });
        });
      it('it should get a 400 reponse if no query is given', done => {
        chai
        .request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(400);
          done();
       })
    })
    it('it should get a 400 response if query is in incorrect format (test below) or has spelling errors', done => {
      chai
      .request(server)
      .get('/api/products?!7*(#_')
      .end((err, res) => {
        res.should.have.status(400);
        done();
    })  
   
          

        describe('/POST login', () => {
          it('it should return object if credientials are verified', done => {
                chai
                  .request(server)
                  .post('/api/users')
                  //test email and password from the users.json file
                  .send({email: "susanna.richards@example.com", password: "jonjon"})
                  .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('string');
                    res.body.should.have.property('token');
                    done();
                  })
              });
            });
     it('it should return 401 if email is not correct', done => {
        chai
          .request(server)
            .post('/api/users')
                  //wrong email 
                  .send({email: "patrick.richards@example.com", password: "jonjon"})
                  .end((err, res) => {
                    res.should.have.status(401);
                    done();
                  })
              });
            });

      it('it should return 401 if password is not correct', done => {
              chai
                .request(server)
                  .post('/api/users')
                        //wrong password
                        .send({email: "susanna.richards@example.com", password: "patpat"})
                        .end((err, res) => {
                          res.should.have.status(401);
                          done();
                        })
                    });
                  
