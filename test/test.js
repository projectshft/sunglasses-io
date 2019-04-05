//**models(brands, products, users) USE EXISTING?** 
//let Book = require('../app/models/book');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
//let { expect } = require('chai');
let should = chai.should();

let Brands = require('../initial-data/brands.json');

chai.use(chaiHttp);


// /api/brands:
// get:
describe('Brands', () => {
    describe('/Get brands', () => {
        it('it should GET all the brands', done => {
            chai
            .request(server)
            .get('/api/brands')
            // assert
            .end((err, res) => {
                res.should.have.status(200);
                //console.log(res)
                res.body.should.be.an('array');       
                done();
            });        
        });
    });
});

// /api/brands/{id}/products:
// get:
describe('Products', () => {
    describe('/Get products', () => {
        it('it should GET all products under a given brand ', done => {
        // act
        chai
            .request(server)
            .get('/api/brands/1/products')
            // assert
            .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eq(3);
            done();
            });
        });
    });
});


// /api/products:
// get:

// /api/login:
// post:

// /api/me/cart:
// get:
// post:

// /api/me/cart/{productId}:
// post:
// delete: