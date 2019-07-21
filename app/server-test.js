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
    describe('GET /api/brands/:id/products', done => {
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
                    expect(res.body).to.have.length(0)
                    done();
                })
                
        })
    })
})