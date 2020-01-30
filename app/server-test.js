let chai = require('chai');
let SunglassesServer = require('./server');
let chaiHttp = require('chai-http');
let should = chai.should();
chai.use(chaiHttp);

describe('/GET brands', () => {
    it('it should GET all the brands', done => {
        chai
        .request(SunglassesServer)
        .get('/api/brands')
        .end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
        });
    });
});

describe('/GET products', ()=>{
    it('it should GET all the products', done => {
        chai
        .request(SunglassesServer)
        .get('/api/products')
        .end((err,res)=> {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(11);
            done();
        });
    });
});

describe('/GET products by brand id', () => {
    it('it should GET all products by categoryID', done => {
        chai
        .request(SunglassesServer)
        .get('/api/brands/3/products')
        .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(2);
            done();
        });
    });
});

describe('/POST api/login', ()=> {
    it('it should return an access token for a user', done => {
        chai
        .request(SunglassesServer)
        .post('/api/login')
        .send({
            "email":"susanna.richards@example.com",
            "password":"jonjon"})
        .end((err,res)=> {
            res.should.have.status(200);
            res.body.should.be.a('string');
            res.body.length.should.eql(16);
            done();
        })
    })
})

describe("/GET api/me/cart", () => {
    let accessToken = "";
    it('it should return an access token for a user to be used to test auth routes', done => {
        chai
        .request(SunglassesServer)
        .post('/api/login')
        .send({
            "email":"susanna.richards@example.com",
            "password":"jonjon"})
        .end((err,res)=> {
            res.should.have.status(200);
            res.body.should.be.a('string');
            res.body.length.should.eql(16);
            accessToken= res.body
            done();
        })
    })

    it('it should return the cart contents of a logged in user', done => {
        chai.request(SunglassesServer)
        .get(`/api/me/cart?accessToken=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(0)
          done();
        })
    });
});

describe('/POST api/me/cart', () => {
    let accessToken = "";
    it('it should return an access token for a user to be used to test auth routes', done => {
        chai
        .request(SunglassesServer)
        .post('/api/login')
        .send({
            "email":"susanna.richards@example.com",
            "password":"jonjon"})
        .end((err,res)=> {
            res.should.have.status(200);
            res.body.should.be.a('string');
            res.body.length.should.eql(16);
            accessToken= res.body;
            done();
        })
    })

    

    it('it should add product to cart of logged in user', done =>{
        let product =  {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }

        chai
        .request(SunglassesServer)
        .post(`api/me/cart?accessToken=${accessToken}`)
        .send(product)
        .end((err, res)=>{
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.should.have.property('id')
            res.body.should.have.property('categoryId')
            res.body.should.have.property('name')
            res.body.should.have.property('description')
            res.body.should.have.property('price')
            res.body.should.have.property('imageUrls')
            done();
        })
    })
})
    
describe('/DELETE api/me/cart/:productId', ()=> {
    let accessToken = "";
    it('it should return an access token for a user to be used to test auth routes', done => {
        chai
        .request(SunglassesServer)
        .post('/api/login')
        .send({
            "email":"susanna.richards@example.com",
            "password":"jonjon"})
        .end((err,res)=> {
            res.should.have.status(200);
            res.body.should.be.a('string');
            res.body.length.should.eql(16);
            accessToken= res.body;
            done();
        })
    })
})