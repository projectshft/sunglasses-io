let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

let token = '';

describe('The sunglasses store', () => {
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
    });
    
    describe('/GET api/brands empty', () => {
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

    describe('/GET api/products empty', () => {
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
    });

    describe('/POST api/login invalid', () => {
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

  });