const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require('../app/server.js');

should = chai.should();


chai.use(chaiHttp);


// beforeEach(() => {
//   Book.removeAll();
// });


//For route /api/brands
describe("Store brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          res.body[0].should.have.keys('id', 'name');
          done();
        });
    });
  });
});



// For route  /api/products
describe("Store products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/api/products?q=")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
          done();
        });
    });
  

  it('If there is a valid search term entered, the relevant products should be returned', (done) => {
    chai
      .request(server)
      .get('/api/products?q=superglasses')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.length.should.be.eql(1);
        res.body.should.be.an('array');
        res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
        done();
      });
  });
  
  it('If the query search is unrelated to the store products, an error should be returned', (done) => {
    chai
      .request(server)
      .get('/api/products?q=handbag')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });
});
});





// // For route /api/brands/:id/products
describe("Products by brand", () => {
  describe('/GET products by brand', () => {
    it('it should GET products by the given brand id', (done) => {
        chai
          .request(server)
          .get("/api/brands/5/products")
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an("array");
                res.body.length.should.be.eql(2)
                res.body[0].should.have.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
                done();
          });
        });
    });


    it('it should give 404 error if the id is invalid', (done) => {
      chai
        .request(server)
        .get('/api/brands/42/products')
        .end((err, res) => {
          res.should.have.status(404);
          done(err);
        });
    });
  });


//   //  # POST /api/login
// describe("Login", () => {
//   describe("/POST login", () => {
//     // it('it should give an error if the username or password is missing', (done) => {
//     //   chai
//     //     .request(server)
//     //     .post('/api/login/')
//     //     .end((err, res) => {
//     //       res.should.have.status(404);
//     //       res.body.should.have.property('message').eql('Missing information');
//     //       done(err);
//     //     });
//     // });
//     it("it should POST login information to the server", (done) => {
//       chai
//         .request(server)
//         .post("/api/login")
//         .end((err, res) => {
//           if(err) done(err);
//           res.should.have.status(200);
//           res.body.should.be.an("object");
//           res.body.should.have.property('username')
//           res.body.should.have.property('password')
//           done();
//         });
//     });
//   });
// });

// // # GET /api/me/cart
// // # POST /api/me/cart

// // # DELETE /api/me/cart/:productId

// describe('/DELETE items from cart' , () => {
//   it('it should DELETE a product given the user cart', (done) => {
//       let product = {title: "The Chronicles of Narnia", author: "C.S. Lewis", year: 1948, pages: 778}

//       product.save((err, book) => {
//             chai.request(server)
//             .delete('/book/' + book.id)
//             .end((err, res) => {
//                   res.should.have.status(200);
//                   res.body.should.be.a('object');
//                   res.body.should.have.property('message').eql('Product successfully deleted!');
//                   res.body.result.should.have.property('ok').eql(1);
//                   res.body.result.should.have.property('n').eql(1);
//               done();
//             });
//       });
//     }
// )});


// // # POST /api/me/cart/:productId

// describe('/POST update to a product id ', () => {
//   it('it should POST an update to a product', done => {
//     // arrange
//     let product = {
//       title: 'The Hunger Games',
//       author: 'Suzanne Collins',
//       year: 2008,
//       pages: 301
//     };
//     //act
//     chai
//       .request(server)
//       .post('/book')
//       .send(book)
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.body.should.be.a('object');
//         res.body.should.have.property('title');
//         res.body.should.have.property('author');
//         res.body.should.have.property('pages');
//         res.body.should.have.property('year');
//         done();
//       });
//   });
// });





