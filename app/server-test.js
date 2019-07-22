let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let { expect } = require('chai');

let should = chai.should();

chai.use(chaiHttp)

describe('Sunglasses API', () => {
    describe('/GET brands', () => {
        it('it should get a 200 response', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                })
        })
        it('it should get all the brands', done => {
            chai
                .request(server)
                .get('/api/brands')
                .end((err, res) => {
                    res.body.should.be.an('array')
                    res.body.should.have.length(5)
                    done();
                })
        })
        it ("it should inform the user when there are no brands in the system that match the user's search results", done => {
            chai   
                .request(server)
                .get('/api/brands')
                .query({name: 'Old Navy'})
                .end((err, res) => {
                    expect(res.body).to.have.length(0);
                    done();
                })
        })
        it('it should filter results by brand name', done => {
            chai
                .request(server)
                .get('/api/brands')
                .query({name: ['Oakley', "Levi's"]})
                .end((err, res) => {
                    expect(res.body).to.have.deep.members([ 
                    {
                        "id": "1",
                        "name" : "Oakley"
                    }, {
                        "id": "3",
                        "name" : "Levi's"
                    }])
                    done();
                })
        })
    })
    describe('GET /api/brands/:id/products', () => {
        it ('it should return all the products that belong to particular brand based on the brand id', done => {
            chai
                .request(server)
                .get('/api/brands/3/products')
                .end((err,res) => {
                    expect(res.body).to.eql([
                        {
                            "id": "6",
                            "categoryId": "3",
                            "name": "glas",
                            "description": "Pretty awful glasses",
                            "price":10,
                            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                            "cartQuantity": null
                        },
                        {
                            "id": "7",
                            "categoryId": "3",
                            "name": "QDogs Glasses",
                            "description": "They bark",
                            "price":1500,
                            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                            "cartQuantity": null
                        }
                     ])
                     done();
                })
        })
        it('it should return no results if the brand id is not found in the system', done => {
            chai
                .request(server)
                .get('/api/brands/6/products')
                .end((err, res) => {
                    expect(res.body).to.be.empty
                    done();
                })
                
        })
    })
    describe('/api/products', () => {
        it('it should return an array of all of the products', done => {
            chai   
                .request(server)
                .get('/api/products')
                .end((err, res) => {
                    expect(res.body).to.be.an('array').that.has.length(11)
                    done();
            })
        })
        it('it should filter results by product name', done => {
            chai
                .request(server)
                .get('/api/products')
                .query({name: ['qdogs', 'coke', 'sugar']})
                .end((err, res) => {
                    expect(res.body).to.have.deep.members([
                        {
                            "id": "7",
                            "categoryId": "3",
                            "name": "QDogs Glasses",
                            "description": "They bark",
                            "price":1500,
                            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                            "cartQuantity": null
                        }
                        ,
                        {
                            "id": "8",
                            "categoryId": "4",
                            "name": "Coke cans",
                            "description": "The thickest glasses in the world",
                            "price":110,
                            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                            "cartQuantity": null
                        }, 
                        {
                            "id": "9",
                            "categoryId": "4",
                            "name": "Sugar",
                            "description": "The sweetest glasses in the world",
                            "price":125,
                            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"],
                            "cartQuantity": null
                        }
                    ])
                    done();
                })
        })
    })
    describe('/api/login', () => {
        it('it should return a 400 error if there is no email or password in the body', done => {
            chai
                .request(server)
                .post('/api/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'glaspy21@gmail.com',
                    password: ''
                })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
            })
        })
        it("it should return a 400 error if the email address isn't properly formatted", done => {
            chai
                .request(server)
                .post('/api/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'lazywolf342',
                    password: 'bigpapi'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
            })
        })
        it('it should return a 400 error if the username and password combination is not found in the database', done => {
            chai
                .request(server)
                .post('/api/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'susanna.richards@example.com',
                    password: 'ladygaga'
                })
                .end((err, res) => {
                    expect(res).to.have.status(400)
                    done()
            })
        })
    })
})