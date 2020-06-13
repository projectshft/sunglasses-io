let Brands = require('../app/models/brands-model');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

// beforeEach(() => {
//   Brands.removeAll();
// });

describe('Brands', () => {
  describe('/GET Brands', () => {
    it('it should GET an empty array if there are no brands available', done => {
      Brands.removeAll();
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it('it should GET full array of brands with ids and names', done => {
      let brandsTestArray = [
        {
            "id": "1",
            "name" : "Oakley"
        },
        {
            "id": "2",
            "name" : "Ray Ban"
        },
        {
            "id": "3",
            "name" : "Levi's"
        },
        {
            "id": "4",
            "name" : "DKNY"
        },
        {
            "id": "5",
            "name" : "Burberry"
        }
      ]
      chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.be.eql(brandsTestArray);
          done();
        });
    });
  });
});