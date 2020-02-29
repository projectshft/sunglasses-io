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
});