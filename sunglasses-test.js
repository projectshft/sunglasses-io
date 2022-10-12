let Cart = require("./app/Cart");
let server = require("./app/server");

let chai = require("chai");
let chaiHttp = require("chai-http");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe('/POST cart', () => {
  it('it should POST an order in a cart ', done => {
    // arrange
    let book = {
      title: 'The Hunger Games',
      author: 'Suzanne Collins',
      year: 2008,
      pages: 301
    };
    //act
    chai
      .request(server)
      .post('/book')
      .send(book)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('title');
        res.body.should.have.property('author');
        res.body.should.have.property('pages');
        res.body.should.have.property('year');
        done();
      });
  });
});