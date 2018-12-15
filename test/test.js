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

let testBrands, testProducts, testUsers, accessToken;

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
        testUsername = testUsers[0].login.username;
        testPassword = testUsers[0].login.password;
        chai.request(server)
        .post('/api/login')
        .send({username: testUsername, password: testPassword})
        .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.username.should.be.a('string');
            res.body.token.should.be.a('string');
            res.body.lastUpdated.should.be.a('string')
            res.body.token.length.should.be.eql(16);
            done();
        })
    })

    it('should require both username and password before attempting to log in', done => {
        chai.request(server)
        .post('/api/login')
        .send({username: testUsername})
        .end((err,res) => {
            res.should.have.status(400);
            res.body.should.be.empty;
            done();
        })
    })

    it('should not allow login with an inaccurate password', done => {
        testUsername = testUsers[0].login.username;
        chai.request(server)
        .post('/api/login')
        .send({username: testUsername, password: "Iwillfail"})
        .end((err,res) => {
            res.should.have.status(401);
            res.body.should.be.empty;
            done();
        })
    })

    it('should not allow login with an inaccurate username', done => {
        testPassword = testUsers[0].login.password;
        chai.request(server)
        .post('/api/login')
        .send({username: "Notauser", password: testPassword})
        .end((err,res) => {
            res.should.have.status(401);
            res.body.should.be.empty;
            done();
        })
    })

    it('works if user has already gotten an access token previously', done => {
        testUsername = testUsers[0].login.username;
        testPassword = testUsers[0].login.password;
        chai.request(server)
        .post('/api/login')
        .send({username: testUsername, password: testPassword})
        .end();
        chai.request(server)
        .post('/api/login')
        .send({username: testUsername, password: testPassword})
        .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.username.should.be.a('string');
            res.body.token.should.be.a('string');
            res.body.lastUpdated.should.be.a('string')
            res.body.token.length.should.be.eql(16);
            done();
        })
    })

})

describe('route requiring an authenticated user', () => {

    describe('POST /api/me/cart', () => {

        it('should fail to post if the request does not send a token in the headers' , (done) => {  
            chai.request(server)
            .post('/api/me/cart?productId=1')
            .end((err,res) => {
                expect(err).to.be.null;
                res.should.have.status(401);
                res.body.should.be.empty;
                done();
            })
        })

        it('should fail to post if the request sends an inaccurate access token' , (done) => {  
            chai.request(server)
            .post('/api/me/cart?productId=1')
            .set("x-authentication", 'Iamafailingtoken')
            .end((err,res) => {
                expect(err).to.be.null;
                res.should.have.status(401);
                res.body.should.be.empty;
                done();
            })
        })

        beforeEach(function(done) {
            testUsername = testUsers[0].login.username;
            testPassword = testUsers[0].login.password;
            chai.request(server)
            .post('/api/login')
            .send({username: testUsername, password: testPassword})
            .end((err,res) => {
                accessToken = res.body.token;
                done();
            })
            
        })
    

        it('should POST a selected product to the cart with quantity 1', done => {  
            chai.request(server)
            .post('/api/me/cart?productId=1')
            .set("x-authentication", accessToken)
            .end((err,res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.cartId.should.not.be.null;
                res.body.quantity.should.be.eql(1);
                done();
            })
        })
 

    //ensure that 2 identical products can be sent and that they both have quantity 1 and unique IDs
    it('should allow multiples of the same product, each with their own quantity' , (done) => {  
        let firstCartId;
        chai.request(server)
        .post('/api/me/cart?productId=1')
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            firstCartId = res.body.cartId;
        })
        chai.request(server)
        .post('/api/me/cart?productId=1')
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.cartId.should.not.eql(firstCartId)
            res.body.quantity.should.be.eql(1);
            done();
        })
    })

    it('should fail if the product ID cannot be found' , (done) => {  
        chai.request(server)
        .post('/api/me/cart?productId=NotAProductId')
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(404);
            res.body.should.be.empty;
            done();
        })
    })

    it('should fail if no productID is sent as a query' , (done) => {  
        chai.request(server)
        .post('/api/me/cart')
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(404);
            res.body.should.be.empty;
            done();
        })
    })
})


// describe('GET /api/me/cart', () => {
//     it('should return an empty cart if no products have been added', done => {
//         chai.request(server)
//         .get('/api/me/cart')
//         .end((err,res) => {
//             res.should.have.status(200);
//             res.body.should.be.an('array')
//             res.body.length.should.be.eql(0)
//             done();
//         })
//     })

//     it('should GET all the products in the logged in user\'s cart' , done => {  
//         chai.request(server)
//         .get('/api/me/cart')
//         .end((err,res) => {
//             res.should.have.status(200);

//             done();
//         })
//     })

//     it('should fail if the user is not properly authenticated' , (done) => {  
//         chai.request(server)
//         .post('/api/me/cart')
//         .send(testProducts[0])
//         .end((err,res) => {
//             res.should.have.status(200);
//             res.body[0].quantity.should.be.eql(1);
//             done();
//         })
//     })
// })



// describe('DELETE /api/me/cart/:productId', () => {
//     it('should DELETE a selected product from the logged in user\'s cart' , done => {  

//     })

//     it('should leave all other items in the cart untouched' , done => {  

//     })
// })

// // describe('POST /api/me/cart/:productId', () => {
// //     it('should POST a selected product\'s quantity to update it in the logged in user\'s cart' , (done) => {  

// //     })

// //     it('should leave all other items in the cart untouched' , (done) => {  

// //     })
// // })

})
