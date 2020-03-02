let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();

chai.use(chaiHttp);

// Support a Get Request for Brands

describe('Brands', () => {
    describe('/GET /api/brands', () => {
        it('it should GET all the brands in initial-data', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    // Checks to make sure the status code is a successful one 
                    res.should.have.status(200);
                    // Checks to make sure we are recieving an array back from the api
                    res.body.should.be.an('array');
                    // Checks to make sure that our api is returning back 5 brands back in the array
                    res.body.length.should.be.eql(5);
                    done();
                })
        })
    })

    describe('/GET /api/brands/:id/products', () => {
        it('it should GET all the products associated with that brand id', done => {
            chai
                .request(server)
                .get('/api/brands/1/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    // There are 3 products that have the brand id of 1
                    res.body.length.should.be.eql(3);
                    res.body[0].name.should.be.eql('Superglasses');
                    res.body[1].name.should.be.eql('Black Sunglasses');
                    res.body[2].name.should.be.eql('Brown Sunglasses');
                    done();
                })
        })
        //We want to to return 404 because it the ID may not be there now but could eventually exist in the future
        it('it should return a status of 404 if the categoryID was not found', done => {
            chai
                .request(server)
                .get('/api/brands/6//products')
                .end((err, res) => {
                    res.should.have.status(404);
                    res.text.should.be.a('string');
                    done();
                })
        })
    })
})

describe('Products', () => {
    describe('/GET /api/products', () => {
        it('it should GET all the products', done => {
            chai
                .request(server)
                .get('/api/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(11);
                    done();
                })
        })
    })

    describe('/GET /api/products', () => {
        it('it should GET all the products with the name that matches the query', done => {
            chai
                .request(server)
                .get('/api/products')
                .query({name: "Superglasses"})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(1);
                    done();
                })
        })
    }) 

    describe('/GET /api/products', () => {
        it('it should GET all the products with the description that matches the query', done => {
            chai
                .request(server)
                .get('/api/products')
                .query({description: "The sweetest glasses in the world"})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(1);
                    done();
                })
        })
    }) 
})

