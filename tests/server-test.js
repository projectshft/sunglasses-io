let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

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

//testing for endpoint 2
describe('/GET brands/:id/products', () => {
  //test for successful response given brand id 1
  it('it should GET all of the products by a given brand id', done => {
    chai
      .request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        console.log(res.body);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(3);
        done();
      })
  })
})
