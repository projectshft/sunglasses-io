const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server'); // Adjust the path as needed
const products = require('../api/products');

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

describe('Brands', () => {
  describe('/api/brands', () => {
    it('should retrieve all brands in the store', (done) => {
      chai.request(server)
        .get('/api/brands')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          if (res.body.length === 0) {
            console.log("There are no brands in the database.")
          } else {
            res.body.forEach((brand) => {
              brand.should.have.property('id');
              brand.should.have.property('name');
              brand.id.should.be.a('string');
              brand.name.should.be.a('string');
            });
          }
          done();
        });
    });
  });

  describe('/api/brands/{brandId}/products', () => {
    it('should retrieve all products specific to brand ID', (done) => {
  
      const brandId = "1";

      chai.request(server)
        .get(`/api/brands/${brandId}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          if (res.body.length === 0) {
            console.log("There are no products associated with this brand.")
          } else {
            res.body.forEach((product) => {
              product.should.have.property('id');
              product.should.have.property('categoryId');
              product.should.have.property('name');
              product.should.have.property('description');
              product.should.have.property('price');
              product.should.have.property('imageUrls');
              product.id.should.be.a('string');
              product.categoryId.should.be.a('string');
              product.name.should.be.a('string');
              product.description.should.be.a('string');
              product.price.should.be.a('number');
              product.imageUrls.should.be.an('array');
            });
          }
          done();
        });
    });
  });
  describe('/api/products', () => {
    it('should retrieve all products in the store', (done) => {
      chai.request(server)
        .get('/api/products')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          if (res.body.length === 0) {
            console.log("There are no products in the database.")
          } else {
            res.body.forEach((product) => {
              product.should.have.property('id');
              product.should.have.property('categoryId');
              product.should.have.property('name');
              product.should.have.property('description');
              product.should.have.property('price');
              product.should.have.property('imageUrls');
              product.id.should.be.a('string');
              product.categoryId.should.be.a('string');
              product.name.should.be.a('string');
              product.description.should.be.a('string');
              product.price.should.be.a('number');
              product.imageUrls.should.be.an('array');
            });
          }
          done();
        });
    });
  });
});
