let Brands = require('../app/modules/brands-module');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();
chai.use(require('chai-things'));
chai.use(chaiHttp);



describe('Brands', () => {
  describe('/GET Brands', () => {
    it('it should GET an array of the length of 5', done => {
      chai
        .request(server)
        .get('/api/brands')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5);
          done();
        });
    });

    it('it should GET an array of objects with properties of id and name', done => {
      chai
        .request(server)
        .get('/api/brands')
        .set('x-authentication', '88312679-04c9-4351-85ce-3ed75293b449')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.all.have.property('id');
          res.body.should.all.have.property('name');
          done();
        });
    });

    it('it should fail if api-key is not provided in header', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
});
});