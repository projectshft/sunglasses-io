var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const BASEURL = 'http://localhost:8080'

let state = {
    login: {
        username: '',
        password: ''
    },
    products: [],
    brands: [],
    cart: []
}

http.createServer(function (request, response) {

}).listen(PORT);

fs.readFile("../initial-data/products.json", 'utf8', (err, data)) => {
    if (err) throw err;
    state.products.push(data);
}

function productsGET() {
	let url = `${BASEURL}/api/products`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
	  }
	})
	.then(response => {
		return response.ok ? response.json() : response.statusText
	})
	.then(data => {
		state.products.push(data)
		renderIssues(state)
		// render data
	})
	.catch(err => console.log(err))
}