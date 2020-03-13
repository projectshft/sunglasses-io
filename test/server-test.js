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
                .query({
                    name: "Superglasses"
                })
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
                .query({
                    description: "The sweetest glasses in the world"
                })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(1);
                    done();
                })
        })
    })
})

describe('Login', () => {
    describe('/POST /api/login', () => {
        it('should return status 200 and return an access token', done => {
            chai
                .request(server)
                .post('/api/login')
                .set({
                    'Content-Type': 'application/json'
                })
                .send({
                    email: "salvador.jordan@example.com",
                    password: "tucker"
                })
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('string')
                    res.body.length.should.be.eql(16)
                    done()
                })
        })
        it('should return status 400 if the email or password was empty', done => {
            chai
                .request(server)
                .post('/api/login')
                .set({
                    'Content-Type': 'application/json'
                })
                .send({
                    email: "salvador.jordan@example.com",
                    password: ""
                })
                .end((err, res) => {
                    res.should.have.status(400)
                    done()
                })
        })
        it('should return status 401 if the email or password was incorrect', done => {
            chai
                .request(server)
                .post('/api/login')
                .set({
                    'Content-Type': 'application/json'
                })
                .send({
                    email: "salvador.jordan@example.com",
                    password: "aaaaaaa"
                })
                .end((err, res) => {
                    res.should.have.status(401)
                    done()
                })
        })
    })
})

describe('Me', () => {
    describe('/GET api/me/cart', () => {
        it("Should return the products in the current user's cart", done => {
            let currentUser = {
                email: "salvador.jordan@example.com",
                password: "tucker"
            }
            chai
                .request(server)
                .post('/api/login')
                .set({
                    'Content-Type': 'application/json'
                })
                .send(currentUser)
                .end((err, res) => {
                    let validToken = res.body
                    chai
                        .request(server)
                        .get(`/api/me/cart/?accessToken=${validToken}`)
                        .send()
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.be.an('array')
                            res.body.length.should.be.eql(0)
                            done()
                        })


                })
        })
    })
    describe('/POST api/me/cart', () => {
        it("Should add a product to the current user's cart", done => {
            let currentUser = {
                email: "salvador.jordan@example.com",
                password: "tucker"
            }
            chai
                .request(server)
                .post('/api/login')
                .set({
                    'Content-Type': 'application/json'
                })
                .send(currentUser)
                .end((err, res) => {
                    let validToken = res.body
                    let newProduct = {
                        "id": "1",
                        "categoryId": "1",
                        "name": "Superglasses",
                        "description": "The best glasses in the world",
                        "price": 150,
                        "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
                    }
                    chai
                        .request(server)
                        .post(`/api/me/cart/?accessToken=${validToken}`)
                        .send(newProduct)
                        .end((err, res) => {
                            res.should.have.status(200)
                            res.body.should.be.an('array')
                            res.body.length.should.be.eql(1)
                            console.log(res.body)
                            done()
                        })


                })
        })
    })
})