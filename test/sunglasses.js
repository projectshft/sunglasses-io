let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
let should = chai.should();
let brand = require('../initial-data/brands')


chai.use(chaiHttp);

// Gets all brands
describe('Brands', () => {
    describe('/GET brand', () => {
        it('it should GET all the brands', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(5);
                    done();
            });
        });
    });
});

// Gets all products
describe('Products', () => {
    describe('/GET products', () => {
        it('it should GET all the products', done => {
            chai
                .request(server)
                .get('/api/products')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    //returning 11 because that is the total number of products
                    res.body.length.should.be.eql(11);
                    done(); 
            });
        });
    });
});




// 404 for logins
describe('Login', () => {
    describe('/POST login', () => {
        // 404 for login
        it('it should have a login and password', done => {
            chai
                .request(server)
                .post('/api/login')
                .send({username: '', password: ''})
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
// login succes
        it ('it should pass if you pass in correct login info', done => {
            let user = {
                email: 'susanna.richards@example.com',
                password: 'jonjon'
            };
            chai
                .request(server)
                .post('/api/login')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('string');
                done();
            });
          });
        })
});


// Gets all items in cart (does not work)
describe('Cart', () => {
    describe('/GET cart', () => {
        it('it should GET all items in cart', done => {
            chai
                .request(server)
                .get('/api/me/cart')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    // because cart is empty?
                    res.body.length.should.be.eql(0);
                    done();
            });
        });
    });
});

// Update all items in cart (does not work)
describe('Cart', () => {
    describe('/POST cart', () => {
        it('it should update quantity of items in cart', done => {
            chai
                .request(server)
                .post('/api/me/cart')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
            });
        });
    });
});

// Add items to cart (does not work)
describe('Cart', () => {
    describe('/POST cart', () => {
        it('it should add items to your cart', done => {
            chai
                .request(server)
                .post('/api/me/cart/:productId')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
            });
        });
    });
});

// Delete item in cart (does not work)
describe('Cart', () => {
    describe('/DELETE cart', () => {
        it('it should delete items to your cart', done => {
            chai
                .request(server)
                .delete('/api/me/cart/:productId')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    done();
            });
        });
    });
});





// arrange act assert