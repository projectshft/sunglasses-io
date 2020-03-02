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
            res.body.length.should.be.eql(6)
            done()
        })
    })
    // it("it should return an error if there are no brands", done=>{
    //     chai
    //     .request(server)
    //     .get('/api/brands')
    //     .end((err, res) => {
    //         res.should.have.status(503)
    //         res.text.should.be.eql("There are currently no brands")
    //         done()
    //     })
    // })
})


describe("GET brands/:id/products", () => {
    it("it should get all the products of one brand", done=>{
        chai
        .request(server)
        .get('/api/brands/1/products')
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(3)
            done()
        })
    })

    it("it should return an error if the brand id is incorrectly formatted", done=>{
        chai
        .request(server)
        .get('/api/brands/one1/products')
        .end((err, res) => {
            res.should.have.status(503)
            res.text.should.be.eql("Brand id should contain only numbers")
            done()
        })
    })

    it("it should return an error if the brand does not exist", done=>{
        chai
        .request(server)
        .get('/api/brands/15/products')
        .end((err, res) => {
            res.should.have.status(503)
            res.text.should.be.eql("There is no brand with that id")
            done()
        })
    })

    it("it should return an error if the brand has no products.", done=>{
        chai
        .request(server)
        .get('/api/brands/6/products')
        .end((err, res) => {
            res.should.have.status(503)
            res.text.should.be.eql("The given brand has no products")
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
    
    // it("it should return an error if there are no products", done=>{
    //     chai
    //     .request(server)
    //     .get('/api/products')
    //     .end((err, res) => {
    //         res.should.have.status(503)
    //         res.text.should.be.eql("There are no products to return")
    //         done()
    //     })
    // })
})

describe("POST api/login", () => {
    it("it should allow  a user with correct credentials to login", done=>{
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

    it("it should not login a user if there is no username", done=>{
        let user = {
            password:"jonjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            err.should.have.status(400)
            err.rawResponse.should.be.eql("Incorrectly formatted response")
            done()
        })
    })

    it("it should not login a user if there is no password", done=>{
        let user = {
            username:"yellowleopard753"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            err.should.have.status(400)
            err.rawResponse.should.be.eql("Incorrectly formatted response")
            done()
        })
    })

    it("it should not login a user if the user does not exist", done=>{
        let user = {
            username:"yellowleopard333",
            password:"jonjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            err.should.have.status(401)
            err.rawResponse.should.be.eql("Invalid username or password")
            done()
        })
    })

    it("it should not login a user if the user does not exist", done=>{
        let user = {
            username:"yellowleopard753",
            password:"JONjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            err.should.have.status(401)
            err.rawResponse.should.be.eql("Invalid username or password")
            done()
        })
    })

    it("it should lock a user out after three failed login attempts", done=>{
        let user = {
            username:"yellowleopard333",
            password:"jonjon"
        }
        chai
        .request(server)
        .post("/api/login")
        .send(user)
        .end((err, res) => {
            chai
            .request(server)
            .post("/api/login")
            .send(user)
            .end((err, res) => {
                chai
                .request(server)
                .post("/api/login")
                .send(user)
                .end((err, res) => {
                    err.should.have.status(400)
                    err.rawResponse.should.be.eql("Three incorrect login attempts")
                    done()
                })
            })            
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
                res.body.cart.should.be.an('array')
                res.body.cart.length.should.be.eql(0)
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
                res.body.cart.should.be.an('array')
                res.body.cart.length.should.be.eql(1)
                chai
                .request(server)
                .delete("/api/me/cart/3")
                .send({token: res.body.token})
                .end((err, res) => {
                    done()
                })
            })
        })
    })

    it("it should not POST multiple of the same item", done =>{
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
            let accessToken = res.body
            chai
            .request(server)
            .post("/api/me/cart")
            .send({token: res.body, item: item})
            .end((err, res) => {
                chai
                .request(server)
                .post("/api/me/cart")
                .send({token: res.body.token, item: item}) 
                .end((err, res) => {
                    err.should.have.status(401)
                    err.rawResponse.should.be.eql("Cannot POST multiple of the same item to the cart, you must increment the item quantity using PUT /api/me/cart/:productId")
                    chai
                    .request(server)
                    .delete("/api/me/cart/3")
                    .send({token: accessToken})
                    .end((err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should not POST an item that does not exist", done =>{
        let user = {
            username:"yellowleopard753",
            password:"jonjon"
        }
        let item = {
            "id": "100",
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
                err.should.have.status(401)
                err.rawResponse.should.be.eql("Item does not exist")
                done()
            })
        })
    })
})

describe("PUT /api/me/cart/:productid", () => {
    it("it allows a user update the quanitity of an item in the cart", done => {
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
            const userToken = res.body
            chai
            .request(server)
            .post("/api/me/cart")
            .send({token: res.body, item: item})
            .end((err, res) => {
                chai
                .request(server)
                .put("/api/me/cart/3")
                .send({token: res.body.token})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.cart.should.be.an('array')
                    res.body.cart.length.should.be.eql(1)
                    chai
                    .request(server)
                    .delete("/api/me/cart/3")
                    .send({token: res.body.token})
                    .end((err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it does not increment the quantity of an item not in the cart.", done => {
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
            .put("/api/me/cart/3")
            .send({token: res.body})
            .end((err, res) => {
                err.should.have.status(401)
                err.rawResponse.should.be.eql("Item not in cart. You must add an item before incrementing it")
                done()
            })
        })
    })
})

describe("DELETE /api/me/cart", () => {
    it("it DELETES an item in the user's cart", done =>{
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
                .delete("/api/me/cart/3")
                .send({token: res.body.token})
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.cart.should.be.an('array')
                    res.body.cart.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    it("it does not delete an item not in the user's cart", done =>{
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
            .delete("/api/me/cart/3")
            .send({token: res.body})
            .end((err, res) => {
                err.should.have.status(401)
                err.rawResponse.should.be.eql("This item is not in your cart.")
                done()
            })
        })
    })
})

describe("GET /api/search?q=:query", () => {
    it("should return all products that match the users search request", done => {
        chai
        .request(server)
        .get("/api/search?q=best")
        .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            res.body.length.should.be.eql(4)
            done()
        })
    })

    it("should return and error if the user enters a multi-term search query", done => {
        chai
        .request(server)
        .get("/api/search?q=the best")
        .end((err, res) => {
            err.should.have.status(401)
            err.rawResponse.should.be.eql("Please enter a one word search term")
            done()
        })
    })

    it("should return an error if not items match the search query", done => {
        chai
        .request(server)
        .get("/api/search?q=gucchi")
        .end((err, res) => {
            err.should.have.status(401)
            err.rawResponse.should.be.eql("No items match the entered search term.")
            done()
        })
    })
})