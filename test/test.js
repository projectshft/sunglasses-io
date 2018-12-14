const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const fs = require('fs');
const querystring = require("querystring");

const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHttp);
//chai.use(require("chai-sorted"));

let testBrands, testProducts, testUsers;

beforeEach(function(done) {
    testBrands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
    testUsers = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    testProducts = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
    done();
    });


describe('GET /api/brands', () => {
    it('should GET all the brands', (done) => {
        chai.request(server)
       .get('/api/brands')
       .end((err, res) => {
        expect("Content-Type", "application/json");
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body.length.should.be.eql(testBrands.length);
       done();
     })
    })
  })

describe('GET /api/brands/:id/products', () => {
    it('should GET all the products of a given brand', (done) => {  
        const productsByBrand = testProducts.filter(product => product.brandId == 1);
        chai.request(server)
       .get('/api/brands/1/products')
       .end((err, res) => {
        res.should.have.status(200)
        expect("Content-Type", "application/json");
        res.body.should.be.an('array')
        res.body.length.should.be.eql(productsByBrand.length);
       done();
     })
    })

    it('shouldn\'t return any products if the brand id is invalid', (done) => {
        chai.request(server)
       .get('/api/brands/dsf/products')
       .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.empty;
       done();
     })

    })
})

describe('GET /api/products', () => {
    it('should GET all the products', (done) => {  
        chai.request(server)
        .get('/api/products')
        .end((err, res) => {
         res.should.have.status(200)
         expect("Content-Type", "application/json");
         res.body.should.be.an('array')
         res.body.length.should.be.eql(testProducts.length);
        done();
      })
    })
     it('should limit results to those with a query string', (done) => {
        chai.request(server)
        .get('/api/products?search=Black')
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(1)
            done();
        })
     })

    it('returns all products if query is empty', done => {
    chai.request(server)
    .get('/api/products?search=')
    .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.length.should.be.eql(testProducts.length)
        done();
    })
    })

    it('allows search to be made in different letter casing', done => {
        chai.request(server)
        .get('/api/products?search=BLAck')
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(1)
            done();
        })
        })
    })

describe('POST /api/login', () => {
    it('should POST a login given an accurate username and password', done => {
        
    })

    it('should require both username and password before attempting to log in', done => {
        
    })

    it('should not allow login with an inaccurate name and password', done => {
        
    })

})
    


// describe('GET /api/me/cart', () => {
//     it('should GET all the products in the logged in user\'s cart with their quantities' , (done) => {  

//     })
// })


// // describe('POST /api/me/cart', () => {
// //     it('should POST a selected product and add it to the logged in user\'s cart' , (done) => {  

// //     })

// //     it('should allow multiples of the same product, each with their own quantity' , (done) => {  

// //     })

// //     it('should adjust the quantity on that item to 1' , (done) => {  

// //     })
// // })

// // describe('DELETE /api/me/cart/:productId', () => {
// //     it('should DELETE a selected product from the logged in user\'s cart' , (done) => {  

// //     })

// //     it('should leave all other items in the cart untouched' , (done) => {  

// //     })
// // })

// // describe('POST /api/me/cart/:productId', () => {
// //     it('should POST a selected product\'s quantity to update it in the logged in user\'s cart' , (done) => {  

// //     })

// //     it('should leave all other items in the cart untouched' , (done) => {  

// //     })
// // })


