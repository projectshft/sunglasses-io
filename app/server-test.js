let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let { expect } = require('chai');

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
                    res.body.should.be.an('array')
                    res.body.should.have.length(5)
                    done();
                })
        })
        it('it should filter results by brand name', done => {
            chai
                .request(server)
                .get('/api/brands')
                .query({name: ['Oakley', "Levi's"]})
                .end((err, res) => {
                    expect(res.body).to.have.deep.members([ 
                    {
                        "id": "1",
                        "name" : "Oakley"
                    }, {
                        "id": "3",
                        "name" : "Levi's"
                    }])
                    done();
                })
        })
    })
})