const chai = require('chai')
let chaiHttp = require('chai-http')
chai.use(chaiHttp)
let server = require('./server.js')
let should = chai.should()
let expect = chai.expect

// Reference chai-http documentation: https://www.chaijs.com/plugins/chai-http/
describe('Server', () => {
    // Tests for Brands
    describe('/GET brands', () => {
        it('it should GET all the brands', (done) => {
            chai.request(server)
                .get('/api/brands')
                .end(function (err, res) {
                    // console.log(res._body)
                    res._body.should.deep.equal([
                        {
                            id: '1',
                            name: 'Oakley',
                        },
                        {
                            id: '2',
                            name: 'Ray Ban',
                        },
                        {
                            id: '3',
                            name: "Levi's",
                        },
                        {
                            id: '4',
                            name: 'DKNY',
                        },
                        {
                            id: '5',
                            name: 'Burberry',
                        },
                    ])
                    done() // <= Call done to signal callback end
                })
        })
    })
    describe('/GET products', () => {
        it('it should GET all the products', (done) => {
            chai.request(server)
                .get('/api/products')
                .end(function (err, res) {
                    // console.log(res)
                    res._body.should.deep.equal([
                        {
                            id: '1',
                            categoryId: '1',
                            name: 'Superglasses',
                            description: 'The best glasses in the world',
                            price: 150,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '2',
                            categoryId: '1',
                            name: 'Black Sunglasses',
                            description: 'The best glasses in the world',
                            price: 100,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '3',
                            categoryId: '1',
                            name: 'Brown Sunglasses',
                            description: 'The best glasses in the world',
                            price: 50,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '4',
                            categoryId: '2',
                            name: 'Better glasses',
                            description: 'The best glasses in the world',
                            price: 1500,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '5',
                            categoryId: '2',
                            name: 'Glasses',
                            description: 'The most normal glasses in the world',
                            price: 150,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '6',
                            categoryId: '3',
                            name: 'glas',
                            description: 'Pretty awful glasses',
                            price: 10,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '7',
                            categoryId: '3',
                            name: 'QDogs Glasses',
                            description: 'They bark',
                            price: 1500,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '8',
                            categoryId: '4',
                            name: 'Coke cans',
                            description: 'The thickest glasses in the world',
                            price: 110,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '9',
                            categoryId: '4',
                            name: 'Sugar',
                            description: 'The sweetest glasses in the world',
                            price: 125,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '10',
                            categoryId: '5',
                            name: 'Peanut Butter',
                            description: 'The stickiest glasses in the world',
                            price: 103,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '11',
                            categoryId: '5',
                            name: 'Habanero',
                            description: 'The spiciest glasses in the world',
                            price: 153,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                    ])
                    done()
                })
        })
    })
    describe('/GET Products/:id', () => {
        it('it should GET all the prodcts in a specified brand', (done) => {
            chai.request(server)
                .get('/api/brands/1/products') // <= Get all the products from Oakley
                .end(function (err, res) {
                    // console.log(res._body)
                    res._body.should.deep.equal([
                        {
                            id: '1',
                            categoryId: '1',
                            name: 'Superglasses',
                            description: 'The best glasses in the world',
                            price: 150,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '2',
                            categoryId: '1',
                            name: 'Black Sunglasses',
                            description: 'The best glasses in the world',
                            price: 100,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                        {
                            id: '3',
                            categoryId: '1',
                            name: 'Brown Sunglasses',
                            description: 'The best glasses in the world',
                            price: 50,
                            imageUrls: [
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                                'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
                            ],
                        },
                    ])
                    done() // <= Call done to signal callback end
                })
        })
    })
    // POST /api/login
    describe('/POST Login', () => {
        it('it should login the user if credentials are a match', (done) => {
            //set correct credentials to test with
            let credentials = {
                username: 'lazywolf342',
                password: 'tucker',
            }
            chai.request(server)
                .post('/api/login')
                .send(credentials)
                .end(function (err, res) {
                    // console.log(res)
                    res.should.have.status(200)
                    done() // <= Call done to signal callback end
                })
        })
    })
})
