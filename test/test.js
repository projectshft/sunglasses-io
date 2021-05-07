let Store = require('../app/store');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('Store', () => {

  describe('/GET brands', () => {
    it('It should GET all the brands in the store', done => {
      chai
        .request(server)
        .get('/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object')
          done();
        });
    })
  })
})

