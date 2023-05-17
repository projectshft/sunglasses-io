const expect = require('chai');

const chai = require("chai");

const chaiHttp = require("chai-http");

const server = require("../server");

const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET Brands', () => {
    it('Should return an array of brands', (done) => {
      //arrange
      //act
      chai
        .request(server)
        .get('/brands')
      //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eq(5);
          done();
        });
    });
  });

  describe('/GET Brand Products', () => {
    it('Should get the products of a given brand', (done) => {
      //arrange
      let categoryId = 1
      //act
      chai
        .request(server)
        .get(`/brand/${id}/products`)
      //assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.forEach((product) => {
            expect(product).to.be.an("object");
            expect(product).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          });
          done();
        })
    });

    it('Should return an error if incorrect id', (done) => {
      let id = 'a'

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('error');
        res.body.error.should.equal('Invalid brand ID');
        done();
      })
    });

    it('Should return an error if brand Id does not exist', (done) => {
      let id = 0

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('error');
        res.body.error.should.equal('Brand not Found');
        done();
      })
    });

    it('Should not return an eror if no content to return', (done) => {
      //clear all the products
      Sunglasses.clearAllProducts();

      let id = 1;

      chai  
      .request(server)
      .get(`/brand/${id}/products`)
      .end((err, res) => {
        res.should.have.status(204);
        res.body.should.be.an("array")
        res.body.length.should.be.eq(0);
        done();
      })
    });
  });

  describe('/GET Products', () => {
    it('Should get all the products available', (done) => {

      chai
        .request(server)
        .get('/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array")
          res.body.forEach((product) => {
            expect(product).to.be.an("object");
            expect(product).to.include.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          });
          done();
        })
    });
  });

  
})