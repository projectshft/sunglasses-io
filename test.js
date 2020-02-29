let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/GET brands', () => {
    it('it should GET all the brands', done => {
        chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
        done();
        })
    })
})

describe('/GET products by brand ID', () => {
    it('it should GET all the products by brand ID', done => {
        chai
        .request(server)
        .get('/api/brands/5/products')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
        done();  
        })
    })
})

describe('/GET products', () => {
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

describe('/POST login', () => {
    it('it should allow user to login', done => {
        let user = {
            username: "yellowleopard753",
            password: "jonjon"
        }
        // act
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        // assert
        .end((err, res) => {
            res.should.have.status(200);
            res.should.be.an('object');
            res.body.should.be.a('string');
            done();
        })
    })
})


describe('/GET /me/cart', () => {
    it('it should GET the cart status for the user', done => {

        let user = {
            username: "yellowleopard753",
            password: "jonjon"
        }
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            chai
            .request(server)
            .get('/api/me/cart')
            .send({token: res.body})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(0);
                done();
            })
        })
    })
})

describe('/POST /me/cart', () => {
    it('it should POST new item to users cart', done => {
        //arrange
        let user = {
            username: "yellowleopard753",
            password: "jonjon"
        }
        let product = {
            "id": "10",
            "categoryId": "5",
            "name": "Peanut Butter",
            "description": "The stickiest glasses in the world",
            "price":103,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        //act
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            let token = res.body
            res.should.have.status(200);
            chai
            .request(server)
            .post('/api/me/cart')
            .send({product: product, token: token})
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(1);
                done();
            })    
        })
    })
})

describe('/DELETE me/cart/:productId', () => {
    it('it should DELETE an item from the users cart', done => {
        // arrange
        
        let user = {
            username: "yellowleopard753",
            password: "jonjon"
        }
        let product = {
            "id": "10",
            "categoryId": "5",
            "name": "Peanut Butter",
            "description": "The stickiest glasses in the world",
            "price":103,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        //act
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            let token = res.body
            res.should.have.status(200);
            chai
            .request(server)
            .post('/api/me/cart')
            .send({product: product, token: token})
            .end((err, res) => {
                res.should.have.status(200);
                chai
                .request(server)
                .delete('/api/me/cart/10')
                .send({token: token})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(0);
                    done();
                })
            })
        })
    })
})

describe('/PUT me/cart/:productId', () => {
    it('it should update a book by the given id', done => {
        //arrange
        let user = {
            username: "yellowleopard753",
            password: "jonjon"
        }
        let product = {
            "id": "10",
            "categoryId": "5",
            "name": "Peanut Butter",
            "description": "The stickiest glasses in the world",
            "price":103,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        //act
        chai
        .request(server)
        .post('/api/login')
        .send(user)
        .end((err, res) => {
            let token = res.body
            res.should.have.status(200);
            chai
            .request(server)
            .post('/api/me/cart')
            .send({product: product, token: token})
            .end((err, res) => {
                res.should.have.status(200);
                chai
                .request(server)
                .put('/api/me/cart/10')
                .send({token: token})
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.length.should.be.eql(1);
                    done();
                })
            })
        })
    })
})

describe('/GET search?q=:query', () => {
    it('it should search for product description and product name matching query', done => {
        //act
        chai
        .request(server)
        .get('/api/search?q=spiciest')
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(1);
            done();
        })
    })
})