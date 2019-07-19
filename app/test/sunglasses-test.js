let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);
describe('Brands', () => {
  describe('/GET brands', () =>{
    it('it should GET all the brands', done => {
      //arrange
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        })
    });
  });
});