let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("./app/server");

let should = chai.should();
chai.use(chaiHttp);


describe("Brands", () => {
  describe("GET app/brands", () => {
    it("should GET all the brands", (done) => {
      chai
      .request(server)
      .get("/app/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.forEach((brand) => {
          brand.should.have.property('id');
          brand.should.have.property('name');
        });
        done();
      });
    });
  })

  describe("GET app/brands/:id/products", () => {
    it("should GET products array of a specified brand", (done)=> {
      chai
      .request(server)
      .get("/app/brands/2/products")
      .end((err,res)=>{
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.forEach((product)=>{
          product.should.have.property('id');
          product.should.have.property('categoryId');
          product.should.have.property('name');
          product.should.have.property('description');
          product.should.have.property('price');
          product.should.have.property('imageUrls');
        })
        done();
      })
    })
    it("should GET an error if brand id is not found", (done)=>{
      chai
      .request(server)
      .get("/app/brands/546/products")
      .end((err,res)=>{
        res.should.have.status(404);
        done()
      })
    })
  })
})


describe("Products", () => {
  describe("GET app/products", () => {
    it("should GET all the products", (done) => {
      chai
        .request(server)
        .get("/app/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11)
          res.body.forEach((product) => {
            product.should.have.property('id');
            product.should.have.property('categoryId');
            product.should.have.property('name');
            product.should.have.property('description');
            product.should.have.property('price');
            product.should.have.property('imageUrls');
          });
          done();
        });
    });
  })
})


describe ("Login", () => {
  let token=""
  describe("POST login", () => {
    it('should return a token if valid username and password', (done) => {
      const validUserData={
        username: "lazywolf342",
        password: "tucker"
      }
      chai
      .request(server)
      .post("/app/login")
      .send(validUserData)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("string");
        token=res.body
        done();
      })
    })

    it('should return an error if not valid username and password', (done) => {
      let notValidUserData={
        username: "lazywlf342",
        password: "tucker"
      }
      chai
      .request(server)
      .post("/app/login")
      .send(notValidUserData)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      })
    })
    it('should return an error if no user and/or username', (done) => {
      chai
      .request(server)
      .post("/app/login")
      .end((err, res) => {
        res.should.have.status(400);
        done();
      })
    })
  })
  
  describe ("Cart", ()=>{      
    let productIdNotValid='123'      
    let productId='5'
    let idForDelete='2'
    let productIdForChangeQuant='1'
    
    describe("GET app/me/cart", ()=>{
      it('should return an array of products of logged in user', (done) => {
        chai
        .request(server)
        .get(`/app/me/cart?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(2)
          done();
        })
      })

      it('should return an error 401 if the user is not logged in', (done)=>{
        chai
        .request(server)
        .get("/app/me/cart")
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
      })

    })

    describe("POST app/me/cart", ()=>{
      it('should return an error 401 if the user is not logged in', (done) => {
        chai
        .request(server)
        .post('/app/me/cart')
        .send(productId)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
      })

      it('should return error 404 if no products with this id were found', (done) => {
        chai
        .request(server)
        .post(`/app/me/cart?accessToken=${token}`)
        .send(productIdNotValid)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
      })
      
      it('should post a product to a cart', (done) => {
        chai
        .request(server)
        .post(`/app/me/cart?accessToken=${token}`)
        .send('5')
        .end((err, res) => {
          res.should.have.status(200);
          // res.body.should.not.be.eql([])
          done();
        })
      })

      it('should increase quantity of the product if it is already in cart', (done) => {
        chai
        .request(server)
        .post(`/app/me/cart?accessToken=${token}`)
        .send(productId)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.eql([])
          done();
        })
      })

    })


    describe("DELETE app/me/cart/:productId", ()=>{
      it('should DELETE an existing product (based on its id) from the cart of logged in user', (done)=>{    

        chai
        .request(server)
        .delete(`/app/me/cart/${idForDelete}?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.length.should.be.eql(1)
          done();
        })
      })
  
      it('should return an error 401 if the user is not logged in', (done) => {
        chai
        .request(server)
        .delete(`/app/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
      })

      it('should return an error 404 if product id us not found', (done) => {
        chai
        .request(server)
        .delete(`/app/me/cart/${productIdNotValid}?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.eql([])
          done();
        })
      })
    })


    describe("POST app/me/cart/:productId", ()=>{

      it('should cahnge quantity of an existing product (based on its id) from the cart of logged in user', (done)=>{
        chai
        .request(server)
        .post(`/app/me/cart/${productIdForChangeQuant}?accessToken=${token}`)
        .send('8')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.be.eql([])
          done();
          })
      })

      it('should return an error 401 if the user is not logged in', (done) => {
        chai
        .request(server)
        .post(`/app/me/cart/${productId}`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        })
      })

      it('should return an error 404 if product id us not found', (done) => {
        chai
        .request(server)
        .post(`/app/me/cart/${productIdNotValid}?accessToken=${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        })
      })
    })  
  })
})