// products[i].categoryId = brands[i].id

let Sunglasses = require('../app/models/sunglasses');


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
const { expect } = require('chai');

let should = chai.should();

// chai.use(chaiHttp);
// beforeEach(() => {
//   Sunglasses.removeAll();
// });

//test1
describe('Brands', () => {
  describe('/GET brands', () => {
    it('it should GET all the sunglasses brands', (done) => {
      // act
      chai
        .request(server)
        .get('/brands')
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });
  });
});