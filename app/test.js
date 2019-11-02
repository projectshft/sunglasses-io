let { expect } = require('chai');
let brands = require('./server.js');


//I want to test if brands is an array of objects

expect(brands._items).to.be.an('array');


describe('Brands', () => {
    describe('/GET brands', () => {
      it('it should GET all the books', done => {
        chai
          .request(server)
          .get('/book')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });
    });
  });