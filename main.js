
BASEURL = 'http://localhost:3001'

let state = {
	login: {
		username: '',
		password: ''
	},
	token: '',
	cart: [],
	products: [],
	brands: []
}

function userLogin(url, data) {
	return fetch(url, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => {
			return response.ok ? response.json() : response.statusText
		})
}

$('#submitLoginInfo').on('click', () => {
	state.login.username = $('#username').val()
	state.login.password = $('#password').val()
	userLogin(`${BASEURL}/api/login`, state.login)
		.then(data => {
			state.token = data
			renderToken()
		})
		.catch(err => err)
})

function renderToken() {
	let $container = $('#loginResponse')
	let error = `<p style='color: red'>${state.token}</p>`
	let success = `<p>${state.token}</p>`
	state.token === 'Invalid username or password' ? $container.html(error) : $container.html(success)
}

function renderCart() {
	let $container = $('.cart')
	let cartItems = ""
	cartItems = state.cart.map((item, index) => {
			return `
				<li class="list-group-item" id="${index}"> ${item.name} - $${item.price}.00 <a class="text-danger" href="#" id="delete-${index}" onclick="deleteItem(${index})"><span class="oi oi-x text-danger ml-4" title="x" aria-hidden="true"></span></a></li>
			`
		})
		cartItems.forEach((item) => $container.append(item))
		const emptyCartButton = `<button class="btn btn-danger btn-sm mt-3" onclick="deleteCart()">Empty Cart</button>`
		$container.append(emptyCartButton)
}

function getCart() {
	let accessToken = state.token
	let url = `${BASEURL}/api/me/cart?accessToken=${accessToken}`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.cart = data
			renderCart()
		})
		.catch(err => console.log(err))
}

function deleteItem(cartIndex) {
	let accessToken = state.token
	const product = state.cart[cartIndex]
	let url = `${BASEURL}/api/me/cart/${product.id}?accessToken=${accessToken}`
	return fetch(url, {
		method: 'DELETE',
		headers: {
			
		}
	})
	.then(response => response.json())
	.then((data) => {
		getCart()
	})
	.catch(err => console.log(err))
}

function deleteCart() {
	let accessToken = state.token
	let url = `${BASEURL}/api/me/cart?accessToken=${accessToken}`
	return fetch(url, {
		method: 'DELETE',
		headers: {
			
		}
	})
		.then(response => response.json())
		.then(() => getCart())
		.catch(err => console.log(err))
}

function getProducts() {
	let url = `${BASEURL}/api/products`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.products = data
			renderProducts()
		})
		.catch(err => console.log(err))
}

function getBrands() {
	let url = `${BASEURL}/api/brands`
	return fetch(url, {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	})
		.then(response => response.json())
		.then(data => {
			state.brands = data
			renderBrands()
		})
		.catch(err => console.log(err))
}

function renderProducts () {
	return
}

function renderBrands () {
	return
}

getProducts()
getBrands()