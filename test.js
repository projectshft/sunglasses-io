let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('./app/server.js')

let should = chai.should();

chai.use(chaiHttp);


describe("GET brands", () => {
    it("it should return all the brands", done=>{
        chai
        .request(server)
        .get('/api/brands')
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(5)
            done()
        })
    })
})

describe("GET brands/:id/products", () => {
    it("it should get all the products of one brand", done=>{
        chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            done()
        })
    })
})

describe("GET api/products", () => {
    it("it should return all products", done=>{
        chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an("array")
            res.body.length.should.be.eql(11)
            done()
        })
    })
})

describe("POST api/login", () => {
    it("it should allow  a user with correct credentails to login", done=>{
        let user = {
            username:"yellowleopard753",
            password:"jonjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            res.should.have.status(200)
            res.should.be.an('object')
            res.body.should.be.an('string')
            done()
        })
    })
})

describe("GET api/me/cart", () => {
    it("it return all items in a user's cart", done=>{
        let user = {
            username:"yellowleopard753",
            password:"jonjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            chai
            .request(server)
            .get("/api/me/cart")
            .send({token: res.body})
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('array')
                res.body.length.should.be.eql(0)
                done()
            })
        })
    })
})

describe("POST /api/me/cart", () => {
    it("it adds an item to a user's cart", done =>{
        let user = {
            username:"yellowleopard753",
            password:"jonjon"
        }
        let item = {
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price":50,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            chai
            .request(server)
            .post("/api/me/cart")
            .send({token: res.body, item: item})
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.an('array')
                res.body.length.should.be.eql(1)
                done()
            })
        })
    })
})

describe("DELETE /api/me/cart/:productid", () => {
    it("it adds an item to a user's cart", done => {
        let user = {
            username:"yellowleopard753",
            password:"jonjon"
        }
        let item = {
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price":50,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
        }

        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            chai
            .request(server)
            .post("/api/me/cart")
            .send({token: res.body, item: item})
            .end((err, res) => {
                chai
                .request(server)
                .delete("/api/me/cart/")
                .send({token: res.body})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.be.an('array')
                    res.body.length.should.be.eql(0)
                    done()
                })
            })
        })
    })
})

// describe("PUT /api/me/cart/:productid", () => {
//     it("it allows a user update the quanitity of an item in the cart", done => {
//         let item = {
//             "id": "3",
//             "categoryId": "1",
//             "name": "Brown Sunglasses",
//             "description": "The best glasses in the world",
//             "price":50,
//             "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
//         }
//         chai
//         .request(server)
//         .post("/api/me/cart")
//         .send(item)
//         .end((err, res) => {
//             chai
//             .request(server)
//             .post("/api/me/cart")
//             .send(item)
//             .end((err, res) => {
//                 res.should.have.status(200)
//                 res.should.be.an.array('array')
//                 res.body.length.should.be.eql(1)
//                 done()
//             })
//         })
//     })
// })