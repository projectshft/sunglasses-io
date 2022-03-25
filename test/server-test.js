let chai = require("chai");
const should = chai.should();
const expect = chai.expect;
let chaiHttp = require("chai-http");
const server = require('../app/server');
const users = require('../initial-data/users.json');

chai.use(chaiHttp);

describe("brands", function(){
  describe("/GET brands", function(){
    it("should GET all the brands", function(done){
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("sunglasses-search", function(){
  describe("/GET sunglasses/search", function(){
    it("should Get all of the sunglasses that match the search query", function(done){
      chai
        .request(server)
        .get("/sunglasses/search?name=Superglasses")
        .end(function(err, res){
          res.body.should.be.an("array");
          done();
        })
    })
  })
})

describe("add-to-cart", function(done){
  describe("POST /store/add-to-cart", function(){
    it("should add selected products to the shopping cart", function(done){
      let items = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      chai 
        .request(server)
        .post('/store/add-to-cart')
        .send(items)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('id');
          res.body.should.have.property('categoryId');
          res.body.should.have.property('name');
          res.body.should.have.property('description');
          res.body.should.have.property('price');
          res.body.should.have.property('imageUrls');
          done();
        }).catch(done);
    });
  });
});

