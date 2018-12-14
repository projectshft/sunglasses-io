let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
const fs = require('fs');
let should = chai.should();

chai.use(chaiHttp);

describe('GET /api/brands', () => {
    it('should GET all the brands', (done) => {
        let testBrands;
        fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
            if (error) throw error;
            testBrands = JSON.parse(data);
          });
        chai.request("http://localhost:3001")
       .get('/api/brands')
       .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.length.should.be.eql(testBrands.length);
       done();
     })
    })
  })

describe('GET /api/brands/:id/products', () => {
    it('should GET all the products of a given brand', (done) => {  
        let testProducts;
        fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
            if (error) throw error;
            testProducts = JSON.parse(data).filter(product => product.brandId == 1);
        });
        chai.request("http://localhost:3001")
       .get('/api/brands/1/products')
       .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.length.should.be.eql(testProducts.length);
       done();
     })
    })
})

// describe('GET /api/products', () => {
//     it('should GET all the products in order by decreasing price', (done) => {  

//     })
// })

// describe('POST /api/login', () => {
//     it('should POST a username and password and allow login if valid', (done) => {  

//     })
//     it('should reject an invalid user name and password', (done) => {  

//     })
// })

// describe('GET /api/me/cart', () => {
//     it('should GET all the products in the logged in user\'s cart with their quantities' , (done) => {  

//     })
// })


// describe('POST /api/me/cart', () => {
//     it('should POST a selected product and add it to the logged in user\'s cart' , (done) => {  

//     })

//     it('should allow multiples of the same product, each with their own quantity' , (done) => {  

//     })

//     it('should adjust the quanitity on that item to 1' , (done) => {  

//     })
// })

// describe('DELETE /api/me/cart/:productId', () => {
//     it('should DELETE a selected product from the logged in user\'s cart' , (done) => {  

//     })

//     it('should leave all other items in the cart untouched' , (done) => {  

//     })
// })

// describe('POST /api/me/cart/:productId', () => {
//     it('should POST a selected product\'s quantity to update it in the logged in user\'s cart' , (done) => {  

//     })

//     it('should leave all other items in the cart untouched' , (done) => {  

//     })
// })


