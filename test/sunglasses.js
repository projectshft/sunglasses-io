let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let should = chai.should();
let expect = chai.expect;
chai.use(chaiHttp);

describe("Sunglasses", () => {
  it("Client should have a valid API Key", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200)
        done();
      })
  })
  describe("Brands", () => {
    describe("/GET brand", () => {
      it("it should GET all the brands", (done) => {
        chai
          .request(server)
          .get("/api/brands")
          .end((err, res) => {
            // console.log(res.body)
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(5)
            done();
          })
      })
    })
    describe("/GET products by brand ID", () => {
      it("it should GET all products with the given brand id (categoryId)", function (done) {
        let testCategoryId = '1';
        chai
          .request(server)
          .get('/api/brands/' + testCategoryId +'/products')
          .end((err, res) => {
            if(!res.body) throw err;
            // console.log(res.body);
            res.should.have.status(200);
            res.body.should.be.an("array");
            //Counted products.json and should be 3 products with catId of '1'
            res.body.length.should.be.eql(3);
            res.body[0].should.have.property('categoryId').eql('1');
            res.body[1].should.have.property('categoryId').eql('1');
            res.body[2].should.have.property('categoryId').eql('1');
            done();
          })
      })
    })
  })

  describe("Products", () => {
    describe("/GET products", () => {
      it("it should GET all the products", (done) => {
        chai
          .request(server)
          .get("/api/products")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");
            res.body.length.should.be.eql(11);
            // console.log(res.body);
            done();
          })
      })
    })
  })

  describe("User", () => {
    describe('/POST Login', () => {
      it("User should enter both a username/password to request access token", (done) => {
        let credentials = {
          username: 'abcd', 
          password: ''
        }
        chai
          .request(server)
          .post('/api/login')
          .send(credentials)
          .end((err, res) =>{
            res.should.have.status(400);
            done();
          })
      })
      it("User should enter a valid username and password", (done) => {
        let credentials = {
          username: 'abcd',
          password: 'wxyz'
        }
        chai
          .request(server)
          .post('/api/login')
          .send(credentials)
          .end((err, res) => {
            res.should.have.status(401)
            done();
          })
      })
      it("User should be granted access token if credentials are valid and they don't already have one", (done) => {
        let credentials = {
          username: 'lazywolf342',
          password: 'tucker'
        }
        chai
          .request(server)
          .post('/api/login')
          .send(credentials)
          .end((err,res) => {            
            res.should.have.status(200);
            res.text.should.be.a('string')            
            done();
          })
      })
    })
    describe("/GET user's cart", () => {
      it("The cart data should be retrieved for the current User", (done) => {
        let credentials = {
          username: 'lazywolf342',
          password: 'tucker'
        }
        chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err,res) => {          
          res.should.have.status(200);
          res.text.should.be.a('string')         
          chai
          .request(server)
          .get('/api/me/cart')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            done();
          })
        })
      })
    })
    describe('/POST to user\'s cart', () => {
      it('Users should be able to add a product to their cart', (done) => {
        let product = {
          name: 'Peanut Butter',
          id: '10'
        }
        let credentials = {
          username: 'lazywolf342',
          password: 'tucker'
        }
        chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err,res) => {          
          res.should.have.status(200);
          res.text.should.be.a('string')
          chai
          .request(server)
          .post('/api/me/cart')
          .send(product)
          .end((err, res) => {
            res.should.have.status(200);
            chai
              .request(server)
              .get('/api/me/cart')
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.eql([{
                  id: "10",
                  categoryId: "5",
                  name: "Peanut Butter",
                  description: "The stickiest glasses in the world",
                  price: 103,
                  imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
              }])
                done();
              })
          })
        })
      })
    })
    describe('/DELETE from user\'s cart', () => {
      it('Users should be able to remove a product from a cart', (done) => {
        let product = {
          name: 'Peanut Butter',
          id: '10'
        }
        let credentials = {
          username: 'lazywolf342',
          password: 'tucker'
        }
        chai
        .request(server)
        .post('/api/login')
        .send(credentials)
        .end((err,res) => {          
          res.should.have.status(200);
          res.text.should.be.a('string')
          chai
          .request(server)
          .post('/api/me/cart')
          .send(product)
          .end((err, res) => {
            res.should.have.status(200);
            chai
              .request(server)
              .delete('/api/me/cart/'+ product.id)
              .end((err, res) => {
                should.exist(res);
                res.should.have.status(200);
                done();
              })
          })
        })
      })
    })
  })
})