let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
    it('it should GET all of the brands', done => {
        chai
            .request(server)
            .get('/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(5);
                done();
            });
    });
});



/*
describe('/GET brands/:id/products', () => {
    it('it should GET a single product', done => {
        chai
            .request(server)
            .get('/brands/:id/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.length.should.be.eql(1);
                done();
            });
    });
});

describe('/GET products', () => {
    it('it should GET all products', done => {
        chai    
            .request(server)
            .get('/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(11);
                done();
            });
    });
});

describe('/GET me/cart', () => {
    it('it should return the users cart', done => {
        chai    
            .request(server)
            .get('/me/cart')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });
});
 */


