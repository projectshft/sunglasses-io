let Brands = require('./initial-data/brands.json');
let Products = require('./initial-data/products.json');
let Users = require('./initial-data/users.json');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./app/server');

let should = chai.should();