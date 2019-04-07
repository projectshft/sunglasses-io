let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
let brand = require('../initial-data/brands')


chai.use(chaiHttp);

// Gets all brands
describe('Brands', () => {
    describe('/GET brand', () => {
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
});

// Gets all products
describe('Products', () => {
    describe('/GET products', () => {
        it('it should GET all the products', done => {
            chai
                .request(server)
                .get('/api/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    //returning 11 because that is the total number of products
                    res.body.length.should.be.eql(11);
                    done();
            });
        });
    });
});

// arrange act assert