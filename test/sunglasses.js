let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {

  describe('/GET products', () => {
    it('it should GET all the products', done => {
      //arrange

      //act
      chai
        .request(server)
        .get('/products')
        //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('Array');
          done();
        })
    })
  })
})