let Brands = require('./initial-data/brands.json')

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server.js');

let should = chai.should();

chai.use(chaiHttp);


describe('/GET brands', () => {
    it('should GET a list of all brands', done => {
      // act
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          // assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(5)
          done();
        });
    });
});






