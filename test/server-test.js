const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require('../app/server.js');

const should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  describe('/GET, brands', () => {
    it ('should GET all brands', (done) => {
      chai.request(server)
      .get('/api/brands')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(5);
        done();
      })
    })

    it ("should GET all of a brand's products by id", (done) => {

      const oakley = [
        {
          id: "1",
          categoryId: "1",
          name: "Superglasses",
          description: "The best glasses in the world",
          price:150,
          imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
            id: "2",
            categoryId: "1",
            name: "Black Sunglasses",
            description: "The best glasses in the world",
            price:100,
            imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
        {
            id: "3",
            categoryId: "1",
            name: "Brown Sunglasses",
            description: "The best glasses in the world",
            price:50,
            imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        },
      ]

      chai.request(server)
      .get('/api/brands/1/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.should.be.eql(oakley);
        done();
      })
    })

    it ("should be 404 if an invalid id is passed", (done) => {
      chai.request(server)
      .get('/api/brands/6/products')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      })
    })
  })    
})

describe('Products', () => {
  describe('/GET, products', () => {
    it ('should GET all products', (done) => {
      chai.request(server)
      .get('/api/products')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(11);
        done();
      })
    })
  })
})