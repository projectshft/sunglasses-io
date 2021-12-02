let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
  it('it should GET the brands', done => {
    chai
      .request(server)
      .get('api/brands')
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.an('array');
        done();
      });
  });
});