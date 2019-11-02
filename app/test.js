let { expect } = require('chai');
let brands = require('./server.js');


//I want to test if brands is an array of objects

expect(brands._items).to.be.an('array');


 