let chai = require('chai');
let chaiHttp = require('chai-http');
let server = 'http://localhost:3001';
let expect = require('chai').expect
let should = chai.should();

chai.use(chaiHttp);

  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array')
          done();
        });
    });
  });

  describe('/GET/brandId/products', () => {
    it('it should GET all brandId products', done => {
      chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.an('array')
          res.body[0].should.have.deep.property('categoryId', '1');
          done();
        });
    });
  });