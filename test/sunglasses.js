// define our dependencies/required variables
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

// create a test for the brands endpoint
describe('Brands', () => {
    describe('/GET brands', () => {
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
        })
    })
})