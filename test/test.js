let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
const fs = require('fs');
let should = chai.should();

chai.use(chaiHttp);

let brands, products, users;

describe('/api/brands', () => {
    it('should GET all the brands', (done) => {
        let fileBrands;
        fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
            if (error) throw error;
            fileBrands = JSON.parse(data);
            console.log(`Server setup: ${fileBrands.length} brands loaded`);
          });
        chai.request("http://localhost:3001")
       .get('/api/brands')
       .end((err, res) => {
        res.should.have.status(200)
        console.log(res.body.length);
        res.body.should.be.an('array')
        res.body.length.should.be.eql(fileBrands.length);
       done();
     })
    })
  })

// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId