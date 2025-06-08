const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed

const expect = chai.expect;
chai.use(chaiHttp);

// TODO: Write tests for the server

describe('GET /api/products', () => {
  it("should return all products", (done) => {
    chai.request(server)
      .get('/api/products')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });
});

describe('GET /api/products/:id', () => {
  it('should return a single product for a valid ID', (done) => {
    chai.request(server)
      .get('/api/products/1') // assumes product with id "1" exists
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id', '1');
        done();
      });
  });

  it('should return 404 for a non-existent product ID', (done) => {
    chai.request(server)
      .get('/api/products/9999')
      .end((err, res) => {
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('error');
        done();
      });
  });
});