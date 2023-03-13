let Brands = require("../app/models/brands");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe('Brands', () => {
  beforeEach(() => {
    Brands.removeAll();
  });

  describe('/GET brand', () => {
    it("it should GET all of the brands", done => {
      chai
      .request(server)
      .get('/brand')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(0);
        done();
      });
    });
  });

  describe('/GET brand and products', () => {
    it("it should match the brands id with product category id", done => {
      let brandList = [
        {
          name: "o",
          id: 1
        },
        {
          name: "b",
          id: 2
        }
      ]
      let productList = [
        {
          name: "glass1",
          categoryId: 2
        },
        {
          name: "glass2",
          categoryId: 4
        },
        {
          name: "extraGlass",
          categoryId: 2
        }
      ]

      var requester = chai.request(server).keepOpen()
      Promise.all([
        requester.get('/brand'),
        requester.get('/products')
      ])
      .then
    })
  })
});