let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');

let should = chai.should();

chai.use(chaiHttp)

describe('Sunglasses API', () => {
    describe('/GET brands', () => {
        it('it should get a 200 response', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
        it('it should get all the brands', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array')
                    res.body.length.should.be.eql(5)
                    done();
                })
        })
    })
})