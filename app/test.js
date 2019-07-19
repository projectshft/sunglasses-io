let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require ('./server');
let Products = require ('../initial-data/products');

let should = chai.should();

chai.use(chaiHttp);


// let assert = require('assert');


//set a test for a get request 
describe('/GET products', () => {
    it('should GET all the products', done => {
        chai
            .request(server)
            .get('/api/products')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');                
                done();
            })
    })
});


