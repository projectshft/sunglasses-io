let Brand = require('../models/brand');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
  it('should GET all the brands', async function () {
    chai
      .request(server)
      .get('/brand')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      });

  describe('/GET productsByBrand', () => {
    it('should GET products by brand', async function () {
      chai
      .request(server)
      .get('/brand')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.have.property('categoryId')
        res.body.property.should.be.eql(Brand.id)
        done();
      })
    })
  })
  })
});
  


  

