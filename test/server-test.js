const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const should = chai.should();

chai.use(chaiHttp);

// Support a Get Request for Brands

describe('Brands', () => {
    describe('/GET /api/brands', () => {
        it('it should respond with all the brands located in the brands json file', done => {
            chai.request(server)
                .get('/api/brands')
                .end((err, res) => {
                    // Checks to make sure the status code is a successful one 
                    res.should.have.status(200);
                    // Checks to make sure we are recieving an array back from the api
                    res.body.should.be.an('array');
                    // Checks to make sure that our api is returning back 5 brands back in the array
                    res.body.length.should.be.eql(5);
                    done();
                })
        })
    })
})