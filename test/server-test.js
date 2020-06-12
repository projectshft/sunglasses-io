let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server')
let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
    describe('/GET brands', () => {
      it('it should GET all the brands', done => {
        chai
          .request(server)
          .get('/api/brands')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
          });
      });
    });
  
    describe('/GET brands/:id/products', () => {
        it('it should GET all the products of a specific brand', done => {
          chai
            .request(server)
            .get('/api/brands/1/products')
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.length.should.be.eql(3);
              done();
            });
        });

        it('it should return a 404 if the ID does not exist', done => {
          chai
            .request(server)
            .get('/api/brands/8/products') 
            .end((err, res) => {
                res.should.have.status(404);
                done();
              });
        })
      });
    
  });