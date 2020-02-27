let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');


let should = chai.should();

chai.use(chaiHttp);

//testing to see that all the initial 5 brands are returned when ran
describe('/GET brands', () => {
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
describe('/GET brands/:id/products', () => {
    it('it should GET all the products with ', done => {
        //act
        chai
            .request(server)
            .get('/api/brands/1/products')
            //assert
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                done();
            });
    });
});