// define our dependencies/required variables
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

// tests for the brands GET endpoint 
describe('/GET brands', () => {
    // check for the correct array returned
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
})

//tests for brands/:id/products GET endpoint
describe('GET brands/:id/products', () => {
    // check for an array
    it('it should return an array', done => {
        chai.request(server)
        .get('/api/brands/3/products')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
        })
    })

})
